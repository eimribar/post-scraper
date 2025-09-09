import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`)
    }
    
    if (data?.session) {
      // Get the pending URL from cookie
      const cookies = request.headers.get('cookie') || ''
      const pendingUrlMatch = cookies.match(/pending_post_url=([^;]+)/)
      const pendingUrl = pendingUrlMatch ? decodeURIComponent(pendingUrlMatch[1]) : null
      
      // Clear the cookie
      const response = pendingUrl 
        ? NextResponse.redirect(`${origin}/loading?url=${encodeURIComponent(pendingUrl)}`)
        : NextResponse.redirect(`${origin}/dashboard`)
      
      response.cookies.set('pending_post_url', '', { maxAge: 0 })
      return response
    }
  }

  // Return to signin page on error
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}