'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { createLocationSchema } from '@/lib/utils/zod-schemas/environment'
import { getUserAdminStatus } from '@/lib/db/environments/get-user-admin-status'

export async function createLocation(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const contactPersonName = formData.get('contact_person_name') as string
  const contactEmail = formData.get('contact_email') as string
  const contactPhone = formData.get('contact_phone') as string
  const environmentId = formData.get('partner_id') as string

  // Validate input
  const validation = createLocationSchema.safeParse({
    name,
    description,
    address,
    contact_person_name: contactPersonName,
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

    // Check user's admin status
    const { isSystemAdmin } = await getUserAdminStatus(user.id)

    let targetEnvironmentId = environmentId
    let environmentSlug = ''

    if (targetEnvironmentId) {
      // Verify the partner exists and user has access
      const { data: environment, error: envError } = await supabase
        .from('partners')
        .select('id, slug')
        .eq('id', targetEnvironmentId)
        .single()

      if (envError || !environment) {
        throw new Error('Partner not found')
      }

      // Check if user has access to this partner
      if (!isSystemAdmin) {
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('id')
          .eq('partner_id', targetEnvironmentId)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membership) {
          throw new Error('You do not have permission to create locations in this partner')
        }
      }

      environmentSlug = environment.slug
    } else {
      throw new Error('Partner ID is required')
    }

    // Create the location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert({
        partner_id: targetEnvironmentId,
        name: validation.data.name,
        description: validation.data.description,
        address: validation.data.address,
        contact_person_name: validation.data.contact_person_name,
        contact_email: validation.data.contact_email,
        contact_phone: validation.data.contact_phone
      })
      .select()
      .single()

    if (locationError) {
      console.error('Error creating location:', locationError)
      throw new Error('Failed to create location: ' + locationError.message)
    }

    // Revalidate paths for immediate UI updates
    revalidatePath(`/${environmentSlug}/locations`)
    revalidatePath(`/${environmentSlug}`)

    return { success: true, location }
  } catch (error) {
    console.error('Error in createLocation:', error)
    
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('An unexpected error occurred while creating the location')
  }
}
