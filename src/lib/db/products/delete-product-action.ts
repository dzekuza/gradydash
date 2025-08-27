'use server'

import { createClient } from '@/lib/supabase/client-server'
import { deleteProduct } from './delete-product'

export async function deleteProductAction(productId: string, environmentSlug: string) {
  const supabase = createClient()
  
  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  // Get the environment by slug
  const { data: environment, error: envError } = await supabase
    .from('environments')
    .select('id')
    .eq('slug', environmentSlug)
    .single()

  if (envError || !environment) {
    throw new Error('Environment not found')
  }

  return deleteProduct(productId, user.id, environment.id)
}
