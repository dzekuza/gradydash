import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/auth'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const environment = await getEnvironmentBySlug(params.slug)
    
    if (!environment) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(environment)
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner' },
      { status: 500 }
    )
  }
}
