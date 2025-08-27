'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { createLocationSchema } from '@/lib/utils/zod-schemas/environment'

export async function createLocation(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string

  // Validate input
  const validation = createLocationSchema.safeParse({
    name,
    description,
    address,
    contact_email: contactEmail,
    contact_phone: contactPhone
  })

  if (!validation.success) {
    throw new Error('Invalid input: ' + validation.error.errors.map(e => e.message).join(', '))
  }

  try {
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Get user's environment
    const { data: memberships } = await supabase
      .from('memberships')
      .select('environment_id')
      .eq('user_id', user.id)
      .limit(1)

    if (!memberships || memberships.length === 0) {
      throw new Error('No environment found for user')
    }

    const environmentId = memberships[0].environment_id

    // Get environment slug for revalidation
    const { data: environment } = await supabase
      .from('environments')
      .select('slug')
      .eq('id', environmentId)
      .single()

    if (!environment) {
      throw new Error('Environment not found')
    }

    // Create the location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert({
        environment_id: environmentId,
        name: validation.data.name,
        description: validation.data.description,
        address: validation.data.address,
        contact_email: validation.data.contact_email,
        contact_phone: validation.data.contact_phone,
        created_by: user.id
      })
      .select()
      .single()

    if (locationError) {
      console.error('Error creating location:', locationError)
      throw new Error('Failed to create location: ' + locationError.message)
    }


    // Revalidate paths for immediate UI updates
    revalidatePath(`/${environment.slug}/locations`)
    revalidatePath(`/${environment.slug}`)

    return { success: true, location }
  } catch (error) {
    console.error('Error in createLocation:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the location')
  }
}
