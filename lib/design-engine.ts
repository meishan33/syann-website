import { supabaseAdmin } from '@/lib/supabase-admin'

// Bracelet bead-placement designs are stored in the `bracelet_designs` table
// (managed via the admin Designs tab) rather than hardcoded here, so admins
// can add/edit/retire designs without a code deploy.
// Each design's `sequence` is 24 ints: 0=primary, 1=secondary, 2=accent.
// variant is derived from the result ID so the same reading always shows the
// same design, for as long as the set of active designs doesn't change —
// the index is `variant % activeDesigns.length`, so adding/removing designs
// can shift which design a given index maps to (same characteristic the
// hardcoded array had if its length ever changed).

export type BeadSequence = string[]
export type DesignRow = { id: string; name: string; description: string | null; sequence: number[] }

export async function getActiveDesigns(): Promise<DesignRow[]> {
  const { data } = await supabaseAdmin
    .from('bracelet_designs')
    .select('id, name, description, sequence')
    .eq('active', true)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function generateBeadSequence(
  crystals: [string, string, string],
  variant: number
): Promise<BeadSequence> {
  const designs = await getActiveDesigns()
  if (designs.length === 0) return []
  const layout = designs[variant % designs.length].sequence
  return layout.map(i => crystals[i])
}
