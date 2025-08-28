import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client-server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('location_id', params.id)

    if (error) {
      console.error('Error fetching product count:', error)
      return NextResponse.json({ error: 'Failed to fetch product count' }, { status: 500 })
    }

    return NextResponse.json({ count: data?.length || 0 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
