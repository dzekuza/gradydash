import { NextRequest, NextResponse } from 'next/server'
import { getEnvironmentBySlug } from '@/lib/db/environments/get-environments'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const environment = await getEnvironmentBySlug(params.slug)
    
    if (!environment) {
      return NextResponse.json(
        { error: 'Environment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(environment)
  } catch (error) {
    console.error('Error fetching environment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch environment' },
      { status: 500 }
    )
  }
}
