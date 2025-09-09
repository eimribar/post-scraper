import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the pending URL from cookies
      const cookieStore = await cookies()
      const pendingUrl = cookieStore.get('pending_post_url')?.value
      
      // Clear the pending URL cookie
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // In development, handle the redirect directly
        const redirectUrl = pendingUrl && pendingUrl.includes('linkedin.com')
          ? `${origin}/loading?url=${encodeURIComponent(pendingUrl)}`
          : `${origin}/dashboard`
        
        // Clear the cookie by setting it with maxAge 0
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('pending_post_url', '', { 
          maxAge: 0,
          path: '/'
        })
        
        return response
      } else {
        // In production, redirect to the forwarded host
        const productionOrigin = forwardedHost ? `https://${forwardedHost}` : origin
        const redirectUrl = pendingUrl && pendingUrl.includes('linkedin.com')
          ? `${productionOrigin}/loading?url=${encodeURIComponent(pendingUrl)}`
          : `${productionOrigin}/dashboard`
        
        // Clear the cookie by setting it with maxAge 0
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.set('pending_post_url', '', { 
          maxAge: 0,
          path: '/'
        })
        
        return response
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}