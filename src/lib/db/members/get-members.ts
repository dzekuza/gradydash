import { createClient } from '@/lib/supabase/client-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function getMembers(environmentSlug: string) {
  const supabase = createClient()

  // Get the partner by slug
  const { data: environment, error: envError } = await supabase
    .from('partners')
    .select('id')
    .eq('slug', environmentSlug)
    .single()

  if (envError || !environment) {
    return []
  }

  // Use service client to bypass RLS for members fetching
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get members for this partner using service client
  const { data: members, error } = await serviceClient
    .from('memberships')
    .select(`
      id,
      role,
      created_at,
      profiles!inner(
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('partner_id', environment.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching members:', error)
    return []
  }

  // Transform the data to match the expected interface
  const transformedMembers = (members || []).map(member => ({
    ...member,
    profiles: Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
  }))

  return transformedMembers
}
