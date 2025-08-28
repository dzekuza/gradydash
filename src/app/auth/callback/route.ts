import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Check if user has a pending invitation
    if (user && user.user_metadata?.pending_invite_id) {
      const inviteId = user.user_metadata.pending_invite_id
      
      try {
        // Get the invitation
        const { data: invite, error: inviteError } = await supabase
          .from('partner_invites')
          .select(`
            id,
            partner_id,
            email,
            role,
            expires_at,
            accepted_at,
            partners!inner(name, slug)
          `)
          .eq('id', inviteId)
          .single()

        if (!inviteError && invite && !invite.accepted_at) {
          // Check if invitation is expired
          if (new Date(invite.expires_at) >= new Date()) {
            // Check if user's email matches the invitation email
            if (user.email === invite.email) {
              // Accept the invitation
              const { error: acceptError } = await supabase
                .from('partner_invites')
                .update({ accepted_at: new Date().toISOString() })
                .eq('id', inviteId)

              if (!acceptError) {
                // Create the membership
                const partner = Array.isArray(invite.partners) ? invite.partners[0] : invite.partners
                
                await supabase
                  .from('memberships')
                  .insert({
                    partner_id: invite.partner_id,
                    user_id: user.id,
                    role: invite.role
                  })

                // Clear the pending invitation from user metadata
                await supabase.auth.updateUser({
                  data: { pending_invite_id: null }
                })

                // Redirect to the partner
                return NextResponse.redirect(new URL(`/${partner.slug}`, request.url))
              }
            }
          }
        }
      } catch (error) {
        console.error('Error handling pending invitation:', error)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
