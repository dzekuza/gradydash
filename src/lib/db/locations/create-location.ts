'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLocation(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const environmentId = formData.get('environmentId') as string

  if (!name || !environmentId) {
    throw new Error('Name and environment are required')
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication error: ' + userError.message)
    }
    
    if (!user) {
      // For demo purposes, we'll create the location without a specific user
      console.log('No authenticated user found, creating location with demo user')
      
      const { data: location, error: locError } = await supabase
        .from('locations')
        .insert({
          name,
          description,
          address,
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

      console.log('Demo location created successfully:', location.id)
      revalidatePath('/')
      return location
    }

    console.log('Creating location with:', { name, description, address, environmentId, userId: user.id })

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

    // Create the location
    const { data: location, error: locError } = await supabase
      .from('locations')
      .insert({
        name,
        description,
        address,
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
    revalidatePath('/')
    return location
  } catch (error) {
    console.error('Error in createLocation:', error)
    throw error
  }
}
