import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Shop visibility is admin-controlled via site_settings.shop_enabled —
// redirect away unless it's explicitly turned on.
export async function proxy(req: NextRequest) {
  const { data } = await supabaseAdmin.from('site_settings').select('shop_enabled').eq('id', 1).maybeSingle()
  if (data?.shop_enabled) return NextResponse.next()
  return NextResponse.redirect(new URL('/', req.url))
}

export const config = {
  matcher: ['/shop', '/shop/:path*'],
}
