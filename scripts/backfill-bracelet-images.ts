/**
 * Backfill bracelet images for energy_quiz_results rows that have no cached_image_url,
 * then copy the image URL to any linked orders that are also missing generated_image_url.
 *
 * Run with: npx tsx scripts/backfill-bracelet-images.ts
 */

// dotenv must run before any module that reads process.env at init time
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { generateBraceletImage } from '../lib/bracelet-image'

// Create admin client directly (don't import lib/supabase-admin which
// evaluates createClient before dotenv has a chance to run)
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function generateBeadSequence(crystals: [string, string, string], variant: number): Promise<string[]> {
  const { data: designs } = await db
    .from('bracelet_designs')
    .select('sequence')
    .eq('active', true)
    .order('created_at', { ascending: true })

  if (!designs?.length) return []

  const design = designs[variant % designs.length]
  const sequence: number[] = design.sequence ?? []
  return sequence.map((slot: number) => crystals[Math.min(slot, 2)] ?? crystals[0])
}

async function run() {
  const { data: results, error } = await db
    .from('energy_quiz_results')
    .select('id, crystal_names')
    .is('cached_image_url', null)

  if (error) { console.error('Fetch error:', error.message); process.exit(1) }
  if (!results?.length) { console.log('No new images to generate.') }
  else {

  console.log(`Found ${results.length} result(s) to backfill.`)

  for (const result of results) {
    const crystals: string[] = result.crystal_names ?? []
    if (crystals.length < 3) {
      console.log(`[${result.id}] Skipping — fewer than 3 crystals`)
      continue
    }

    try {
      const { data: crystalRows } = await db
        .from('crystals')
        .select('name, bead_image_url, bead_image_urls')
        .in('name', crystals)

      const imageMap: Record<string, string[]> = {}
      for (const c of crystalRows ?? []) {
        if (c.bead_image_urls?.length) imageMap[c.name] = c.bead_image_urls
        else if (c.bead_image_url) imageMap[c.name] = [c.bead_image_url]
      }

      const variant = parseInt(result.id.replace(/-/g, '')[0], 16)
      const beadSequence = await generateBeadSequence(
        crystals.slice(0, 3) as [string, string, string],
        variant
      )

      if (!beadSequence.length) {
        console.log(`[${result.id}] Skipping — no active bracelet designs`)
        continue
      }

      const pngBuffer = await generateBraceletImage(beadSequence, imageMap)
      const fileName = `bracelet-${result.id}.png`
      const pngBlob = new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' })

      const { error: uploadError } = await db.storage
        .from('generated-bracelets')
        .upload(fileName, pngBlob, { contentType: 'image/png', upsert: true })

      if (uploadError) {
        console.error(`[${result.id}] Upload failed:`, uploadError.message)
        continue
      }

      const { data: { publicUrl } } = db.storage
        .from('generated-bracelets')
        .getPublicUrl(fileName)

      await db
        .from('energy_quiz_results')
        .update({ cached_image_url: publicUrl })
        .eq('id', result.id)

      console.log(`[${result.id}] Image generated ✓`)

      const { data: updatedOrders } = await db
        .from('orders')
        .update({ generated_image_url: publicUrl })
        .eq('result_id', result.id)
        .is('generated_image_url', null)
        .select('order_number')

      if (updatedOrders?.length) {
        console.log(`  → Updated order(s): ${updatedOrders.map((o: { order_number: number }) => `#${o.order_number}`).join(', ')}`)
      }

    } catch (err) {
      console.error(`[${result.id}] Failed:`, err)
    }
  }
  } // end else

  // Phase 2: copy already-generated images to orders that are still missing them
  console.log('\nPhase 2: copying existing cached images to orders...')
  const { data: ordersToFix } = await db
    .from('orders')
    .select('id, order_number, result_id')
    .is('generated_image_url', null)
    .not('result_id', 'is', null)

  if (!ordersToFix?.length) {
    console.log('No orders need image copying.')
  } else {
    for (const order of ordersToFix) {
      const { data: result } = await db
        .from('energy_quiz_results')
        .select('cached_image_url')
        .eq('id', order.result_id)
        .maybeSingle()

      if (result?.cached_image_url) {
        await db.from('orders').update({ generated_image_url: result.cached_image_url }).eq('id', order.id)
        console.log(`  → Order #${order.order_number}: image copied from result ✓`)
      } else {
        // Result row is missing or has no image — generate directly from the order's crystal names
        console.log(`  → Order #${order.order_number}: result missing, generating from order crystals...`)
        const { data: orderRow } = await db
          .from('orders')
          .select('recommended_crystal_names')
          .eq('id', order.id)
          .single()

        const crystals: string[] = orderRow?.recommended_crystal_names ?? []
        if (crystals.length < 3) {
          console.log(`     Skipping — fewer than 3 crystals on order`)
          continue
        }

        try {
          const { data: crystalRows } = await db
            .from('crystals')
            .select('name, bead_image_url, bead_image_urls')
            .in('name', crystals)

          const imageMap: Record<string, string[]> = {}
          for (const c of crystalRows ?? []) {
            if (c.bead_image_urls?.length) imageMap[c.name] = c.bead_image_urls
            else if (c.bead_image_url) imageMap[c.name] = [c.bead_image_url]
          }

          const variant = parseInt(order.id.replace(/-/g, '')[0], 16)
          const beadSequence = await generateBeadSequence(crystals.slice(0, 3) as [string, string, string], variant)
          if (!beadSequence.length) { console.log(`     Skipping — no active designs`); continue }

          const pngBuffer = await generateBraceletImage(beadSequence, imageMap)
          const fileName = `bracelet-order-${order.id}.png`
          const pngBlob = new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' })

          const { error: uploadError } = await db.storage
            .from('generated-bracelets')
            .upload(fileName, pngBlob, { contentType: 'image/png', upsert: true })

          if (uploadError) { console.error(`     Upload failed:`, uploadError.message); continue }

          const { data: { publicUrl } } = db.storage.from('generated-bracelets').getPublicUrl(fileName)
          await db.from('orders').update({ generated_image_url: publicUrl }).eq('id', order.id)
          console.log(`     Generated and saved ✓`)
        } catch (err) {
          console.error(`     Generation failed:`, err)
        }
      }
    }
  }

  console.log('Done.')
}

run()
