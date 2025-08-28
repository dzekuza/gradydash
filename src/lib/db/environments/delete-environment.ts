'use server'

import { createClient } from '@/lib/supabase/client-server'
import { revalidatePath } from 'next/cache'

export async function deleteEnvironment(environmentId: string, userId: string) {
  const supabase = createClient()

  // Check if user is system admin
  const { data: systemMembership, error: systemError } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .is('partner_id', null)
    .single()

  if (systemError || !systemMembership || systemMembership.role !== 'admin') {
    throw new Error('Only system administrators can delete partners')
  }

  // Delete the partner (cascade will handle related data)
  const { error: deleteError } = await supabase
    .from('partners')
    .delete()
    .eq('id', environmentId)

  if (deleteError) {
    console.error('Error deleting partner:', deleteError)
    throw new Error('Failed to delete partner')
  }

  revalidatePath('/admin/environments')
  revalidatePath('/dashboard')

  return { success: true }
}
