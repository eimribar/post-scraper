import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  
  // Handle OAuth errors from provider
  if (error) {
    console.error('OAuth provider error:', error)
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error)}`)
  }
  
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/signin?error=no_code`)
  }

  const supabase = await createClient()
  
  try {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(exchangeError.message)}`)
    }
    
    if (!data?.session) {
      return NextResponse.redirect(`${origin}/auth/signin?error=no_session`)
    }
    
    // Successfully authenticated - check for pending URL in cookies
    const cookieStore = await cookies()
    const pendingUrl = cookieStore.get('pending_post_url')?.value
    
    // Clear the pending URL cookie
    const response = pendingUrl && pendingUrl.includes('linkedin.com')
      ? NextResponse.redirect(`${origin}/loading?url=${encodeURIComponent(pendingUrl)}`)
      : NextResponse.redirect(`${origin}/dashboard`)
    
    response.cookies.set('pending_post_url', '', { 
      maxAge: 0,
      path: '/'
    })
    
    return response
    
  } catch (err) {
    // This should not catch NEXT_REDIRECT errors since we're using NextResponse.redirect
    console.error('Unexpected error in auth callback:', err)
    return NextResponse.redirect(`${origin}/auth/signin?error=unexpected_error`)
  }
}