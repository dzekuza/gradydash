'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function createEnvironmentAdmin(formData: FormData) {
  // Use server client for authentication
  const supabase = createClient()
  
  // Use service role client for admin operations
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  // Sanitize name to prevent XSS
  const sanitizedName = name?.trim().replace(/<[^>]*>/g, '')

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and hyphens')
  }

  try {
    // Get the authenticated user from server client
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication error: ' + userError.message)
    }
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if environment with this slug already exists using service client
    const { data: existingEnv, error: checkError } = await serviceClient
      .from('environments')
      .select('id')
      .eq('slug', slug)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing environment:', checkError)
      throw new Error('Error checking environment: ' + checkError.message)
    }

    if (existingEnv) {
      throw new Error('Environment with this slug already exists')
    }

    // Create the environment using service client
    const { data: environment, error: envError } = await serviceClient
      .from('environments')
      .insert({
        name: sanitizedName,
        slug,
        description: description || `Environment for ${sanitizedName}`,
        created_by: user.id
      })
      .select()
      .single()

    if (envError) {
      console.error('Error creating environment:', envError)
      throw new Error('Failed to create environment: ' + envError.message)
    }

    if (!environment) {
      throw new Error('Environment was not created')
    }

    // Add the current user as a member with store_manager role using service client
    const { error: membershipError } = await serviceClient
      .from('memberships')
      .insert({
        environment_id: environment.id,
        user_id: user.id,
        role: 'store_manager'
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      // Don't throw here, the environment was created successfully
    }

    revalidatePath('/admin/environments')
    revalidatePath('/')
    
    return { success: true, environment }
  } catch (error) {
    console.error('Error in createEnvironmentAdmin:', error)
    throw error
  }
}
