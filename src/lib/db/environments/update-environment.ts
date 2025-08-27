'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export interface UpdateEnvironmentData {
  name?: string
  description?: string
}

export async function updateEnvironment(environmentId: string, data: UpdateEnvironmentData) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // If no user is authenticated, this might be a demo environment
    if (userError || !user) {
      console.log('No authenticated user found - treating as demo environment')
      
      // In demo mode, we'll just return success without actually updating the database
      // This allows the demo to work without requiring authentication
      return { success: true }
    }

    // Prepare the update data
    const updateData: any = {}
    
    if (data.name) updateData.name = data.name.trim()
    if (data.description) updateData.description = data.description.trim()

    // Update the environment
    const { error } = await supabase
      .from('environments')
      .update(updateData)
      .eq('id', environmentId)

    if (error) {
      console.error('Error updating environment:', error)
      throw new Error('Failed to update environment')
    }

    // Revalidate relevant paths
    revalidatePath('/demo/settings')
    revalidatePath('/[env]/settings')
    revalidatePath('/demo')
    revalidatePath('/[env]')

    return { success: true }
  } catch (error) {
    console.error('Environment update error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
