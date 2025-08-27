'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export interface CreateEnvironmentData {
  name: string
  slug: string
  description?: string
}

export async function createEnvironment(data: CreateEnvironmentData, userId: string) {
  const supabase = createClient()

  // Check if user is system admin
  const { data: systemMembership, error: systemError } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .is('environment_id', null)
    .single()

  if (systemError || !systemMembership || systemMembership.role !== 'admin') {
    throw new Error('Only system administrators can create environments')
  }

  // Check if slug already exists
  const { data: existingEnvironment, error: checkError } = await supabase
    .from('environments')
    .select('id')
    .eq('slug', data.slug)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error('Error checking environment slug')
  }

  if (existingEnvironment) {
    throw new Error('Environment with this slug already exists')
  }

  // Create the environment
  const { data: environment, error: createError } = await supabase
    .from('environments')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      created_by: userId
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating environment:', createError)
    throw new Error('Failed to create environment')
  }

  // Add the current user as a member with store_manager role
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      environment_id: environment.id,
      user_id: userId,
      role: 'store_manager'
    })

  if (membershipError) {
    console.error('Error creating membership:', membershipError)
    // Try to clean up the environment if membership creation fails
    await supabase
      .from('environments')
      .delete()
      .eq('id', environment.id)
    throw new Error('Failed to create environment membership')
  }

  revalidatePath('/admin/environments')
  revalidatePath('/dashboard')

  return environment
}
