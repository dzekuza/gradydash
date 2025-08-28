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

  // Check if user is system admin or partner admin
  const { data: systemMembership, error: systemError } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .is('partner_id', null)
    .single()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_partner_admin')
    .eq('id', userId)
    .single()

  if (systemError && profileError) {
    throw new Error('Error checking user permissions')
  }

  // Allow if user is system admin or partner admin
  const isSystemAdmin = systemMembership && systemMembership.role === 'admin'
  const isPartnerAdmin = profile?.is_partner_admin

  if (!isSystemAdmin && !isPartnerAdmin) {
    throw new Error('Only administrators can create additional environments')
  }

  // Check if slug already exists
  const { data: existingEnvironment, error: checkError } = await supabase
    .from('partners')
    .select('id')
    .eq('slug', data.slug)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    throw new Error('Error checking partner slug')
  }

  if (existingEnvironment) {
    throw new Error('Partner with this slug already exists')
  }

  // Create the partner
  const { data: environment, error: createError } = await supabase
    .from('partners')
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      created_by: userId
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating partner:', createError)
    throw new Error('Failed to create partner')
  }

  // Add the current user as a member with admin role
  const { error: membershipError } = await supabase
    .from('memberships')
    .insert({
      partner_id: environment.id,
      user_id: userId,
      role: 'admin'
    })

  if (membershipError) {
    console.error('Error creating membership:', membershipError)
    // Try to clean up the partner if membership creation fails
    await supabase
      .from('partners')
      .delete()
      .eq('id', environment.id)
    throw new Error('Failed to create partner membership')
  }

  revalidatePath('/admin/environments')
  revalidatePath('/dashboard')

  return environment
}
