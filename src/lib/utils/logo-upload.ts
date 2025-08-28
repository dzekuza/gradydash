'use server'

import { createClient } from '@/lib/supabase/client-server'

export interface LogoUploadResult {
  success: boolean
  logoUrl?: string
  fileName?: string
  error?: string
}

export async function uploadPartnerLogo(
  partnerId: string,
  file: File
): Promise<LogoUploadResult> {
  const supabase = createClient()
  
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or SVG file.'
      }
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return {
        success: false,
        error: 'File size too large. Please upload a file smaller than 2MB.'
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${partnerId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('partner-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading logo:', error)
      return {
        success: false,
        error: 'Failed to upload logo: ' + error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('partner-logos')
      .getPublicUrl(fileName)

    return {
      success: true,
      logoUrl: urlData.publicUrl,
      fileName: fileName
    }
  } catch (error) {
    console.error('Error in uploadPartnerLogo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function deletePartnerLogo(fileName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.storage
      .from('partner-logos')
      .remove([fileName])

    if (error) {
      console.error('Error deleting logo:', error)
      return {
        success: false,
        error: 'Failed to delete logo: ' + error.message
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in deletePartnerLogo:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
