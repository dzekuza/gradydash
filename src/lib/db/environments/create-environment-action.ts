'use server'

import { createClient } from '@/lib/supabase/client-server'
import { createEnvironment } from './create-environment'

export async function createEnvironmentAction(formData: FormData) {
  const supabase = createClient()
  
  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const description = formData.get('description') as string

  if (!name || !slug) {
    throw new Error('Name and slug are required')
  }

  return createEnvironment({ name, slug, description }, user.id)
}
