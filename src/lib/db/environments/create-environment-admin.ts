'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'
import { uploadPartnerLogo } from '@/lib/utils/logo-upload'
import { inviteMemberDirect } from '@/lib/db/environments/invite-member-direct'

export interface MemberInvitation {
  email: string
  role: 'store_manager'
}

export async function createEnvironmentAdmin(formData: FormData) {
  // Use server client for authentication and operations
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string
  const logoFile = formData.get('logo') as File | null
  const invitationsJson = formData.get('invitations') as string

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  // Sanitize name to prevent XSS
  const sanitizedName = name?.trim().replace(/<[^>]*>/g, '')

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug must contain only lowercase letters, numbers, and hyphens')
  }

  // Parse invitations
  let invitations: MemberInvitation[] = []
  if (invitationsJson) {
    try {
      invitations = JSON.parse(invitationsJson)
    } catch (error) {
      console.error('Error parsing invitations:', error)
    }
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

    // Check if partner with this slug already exists
    const { data: existingEnv, error: checkError } = await supabase
      .from('partners')
      .select('id')
      .eq('slug', slug)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing partner:', checkError)
      throw new Error('Error checking partner: ' + checkError.message)
    }

    if (existingEnv) {
      throw new Error('Partner with this slug already exists')
    }

    // Create the partner
    const { data: environment, error: envError } = await supabase
      .from('partners')
      .insert({
        name: sanitizedName,
        slug,
        description: description || `Partner for ${sanitizedName}`
        // created_by will be automatically set by the database trigger
      })
      .select()
      .single()

    if (envError) {
      console.error('Error creating partner:', envError)
      throw new Error('Failed to create partner: ' + envError.message)
    }

    if (!environment) {
      throw new Error('Partner was not created')
    }

    // Handle logo upload if provided
    let logoUrl: string | undefined
    let logoFileName: string | undefined
    
    if (logoFile && logoFile.size > 0) {
      const uploadResult = await uploadPartnerLogo(environment.id, logoFile)
      if (uploadResult.success && uploadResult.logoUrl) {
        logoUrl = uploadResult.logoUrl
        logoFileName = uploadResult.fileName
        
        // Update partner with logo information
        const { error: updateError } = await supabase
          .from('partners')
          .update({
            logo_url: logoUrl,
            logo_file_name: logoFileName
          })
          .eq('id', environment.id)

        if (updateError) {
          console.error('Error updating partner with logo:', updateError)
          // Don't throw here, the partner was created successfully
        }
      } else {
        console.error('Error uploading logo:', uploadResult.error)
        // Don't throw here, the partner was created successfully
      }
    }

    // Add the current user as a member with store_manager role
    const { error: membershipError } = await supabase
      .from('memberships')
      .insert({
        partner_id: environment.id,
        user_id: user.id,
        role: 'store_manager'
      })

    if (membershipError) {
      console.error('Error creating membership:', membershipError)
      // Don't throw here, the environment was created successfully
    }

    // Send invitations to members
    for (const invitation of invitations) {
      try {
        await inviteMemberDirect(environment.id, invitation.email, invitation.role, user.id)
      } catch (error) {
        console.error(`Error inviting ${invitation.email}:`, error)
        // Continue with other invitations even if one fails
      }
    }

    revalidatePath('/admin/environments')
    revalidatePath('/')
    
    return { success: true, environment }
  } catch (error) {
    console.error('Error in createEnvironmentAdmin:', error)
    throw error
  }
}
