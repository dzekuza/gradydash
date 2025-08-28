'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  full_name?: string
  bio?: string
  avatar_url?: string
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Authentication required')
    }

    // Use service client to bypass RLS for profile updates
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Prepare the update data
    const updateData: any = {}
    
    if (data.first_name) updateData.first_name = data.first_name
    if (data.last_name) updateData.last_name = data.last_name
    if (data.full_name) updateData.full_name = data.full_name
    if (data.bio) updateData.bio = data.bio
    if (data.avatar_url) updateData.avatar_url = data.avatar_url

    // Update the profile using service client to bypass RLS
    const { error } = await serviceClient
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error('Failed to update profile')
    }

    // Revalidate the settings page
    revalidatePath('/[env]/settings')
    revalidatePath('/admin/settings')

    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
