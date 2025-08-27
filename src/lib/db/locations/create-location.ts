'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLocation(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const contactPersonName = formData.get('contact_person_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const environmentId = formData.get('environmentId') as string

  if (!name || !environmentId) {
    throw new Error('Name and environment are required')
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Check if we're in demo mode
    const isDemoMode = environmentId === 'demo' || !user
    
    if (userError) {
      console.error('User authentication error:', userError)
      // In demo mode, we'll continue without authentication
      if (!isDemoMode) {
        throw new Error('Authentication error: ' + userError.message)
      }
    }
    
    if (!user && !isDemoMode) {
      throw new Error('Authentication required')
    }

    console.log('Creating location with:', { name, description, address, environmentId, isDemoMode })

    // In demo mode, skip membership checks
    if (!isDemoMode) {
      // Check if user has access to this environment
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('role')
        .eq('environment_id', environmentId)
        .eq('user_id', user.id)
        .single()

      if (membershipError || !membership) {
        console.error('Error checking membership:', membershipError)
        throw new Error('You do not have access to this environment')
      }

      // Only allow reseller_manager and above to create locations
      if (!['reseller_manager', 'grady_admin', 'grady_staff'].includes(membership.role)) {
        throw new Error('You do not have permission to create locations')
      }
    }

    // Create the location
    const { data: location, error: locError } = await supabase
      .from('locations')
      .insert({
        name,
        description,
        address,
        contact_person_name: contactPersonName || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
        environment_id: environmentId
      })
      .select()
      .single()

    if (locError) {
      console.error('Error creating location:', locError)
      throw new Error('Failed to create location: ' + locError.message)
    }

    if (!location) {
      throw new Error('Location was not created')
    }

    console.log('Location created successfully:', location.id)

    // Revalidate relevant paths
    revalidatePath('/demo/locations')
    revalidatePath('/demo')
    revalidatePath(`/${environmentId}/locations`)
    revalidatePath(`/${environmentId}`)

    return location

  } catch (error) {
    console.error('Error in createLocation:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the location')
  }
}
