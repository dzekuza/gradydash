import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set(name, value)
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set(name, '')
          supabaseResponse = NextResponse.next({
            request,
          })
          supabaseResponse.cookies.set(name, '', options)
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to demo environment without authentication
  if (request.nextUrl.pathname.startsWith('/demo')) {
    return supabaseResponse
  }

  // Allow access to admin routes for authenticated users
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  // If user is not signed in and the current path is not /login or /register,
  // redirect the user to /login
  if (!user && !['/login', '/register'].includes(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and the current path is /login or /register,
  // redirect the user to /dashboard
  if (user && ['/login', '/register'].includes(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is signed in and accessing /dashboard directly, redirect to their first environment
  if (user && request.nextUrl.pathname === '/dashboard') {
    // Get user's environments and redirect to the first one
    const { data: memberships } = await supabase
      .from('memberships')
      .select('environment_id')
      .eq('user_id', user.id)
      .limit(1)

    if (memberships && memberships.length > 0) {
      const { data: environment } = await supabase
        .from('environments')
        .select('slug')
        .eq('id', memberships[0].environment_id)
        .single()

      if (environment) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${environment.slug}`
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If no environments found, redirect to demo
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/demo'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
