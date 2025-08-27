'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createLocationSchema } from '@/lib/utils/zod-schemas/environment'
import { getDemoEnvironmentId } from '@/lib/db/environments/get-demo-environment'
import { CACHE_TAGS } from '@/lib/utils/cache'

export async function createLocation(formData: FormData) {
  const supabase = createClient()
  
  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Check if we're in demo mode
    const environmentId = formData.get('environment_id') as string || 'demo'
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

    // Parse and validate form data
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      address: formData.get('address') as string,
      contact_person_name: formData.get('contact_person_name') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
    }

    // Validate the data
    const validatedData = createLocationSchema.parse(rawData)

    // Get environment ID from form or use demo
    const actualEnvironmentId = environmentId === 'demo' 
      ? await getDemoEnvironmentId() 
      : environmentId

    console.log('Creating location with:', { ...validatedData, environmentId: actualEnvironmentId })

    // Create the location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert({
        ...validatedData,
        environment_id: actualEnvironmentId
      })
      .select()
      .single()

    if (locationError) {
      console.error('Error creating location:', locationError)
      throw new Error('Failed to create location: ' + locationError.message)
    }

    if (!location) {
      throw new Error('Location was not created')
    }

    console.log('Location created successfully:', location.id)

    // Invalidate relevant cache tags
    revalidateTag(CACHE_TAGS.LOCATIONS)
    revalidateTag(CACHE_TAGS.ENVIRONMENTS)
    
    // Also revalidate paths for immediate UI updates
    revalidatePath('/demo/locations')
    revalidatePath('/demo')
    revalidatePath(`/${environmentId}/locations`)
    revalidatePath(`/${environmentId}`)

    return { success: true, location }
  } catch (error) {
    console.error('Error in createLocation:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the location')
  }
}
