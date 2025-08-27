'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEnvironment(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

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
    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User authentication error:', userError)
      throw new Error('Authentication error: ' + userError.message)
    }
    
    if (!user) {
      // Redirect to login for unauthenticated users
      redirect('/auth/login?redirect=' + encodeURIComponent(`/create-environment?name=${encodeURIComponent(sanitizedName)}&slug=${encodeURIComponent(slug)}`))
    }

    console.log('Creating environment with:', { name: sanitizedName, slug, userId: user.id })

    // Check if environment with this slug already exists
    const { data: existingEnv, error: checkError } = await supabase
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

    // Create the environment
    const { data: environment, error: envError } = await supabase
      .from('environments')
      .insert({
        name: sanitizedName,
        slug,
        description: `Environment for ${sanitizedName}`,
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

    console.log('Environment created successfully:', environment.id)

    // Add the current user as a member with reseller_manager role
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        environment_id: environment.id,
        user_id: user.id,
        role: 'reseller_manager'
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      // Don't throw here, the environment was created successfully
      // But we should still redirect to the environment
    } else {
      console.log('Membership created successfully')
    }

    revalidatePath('/')
    redirect(`/${slug}`)
  } catch (error) {
    console.error('Error in createEnvironment:', error)
    throw error
  }
}
