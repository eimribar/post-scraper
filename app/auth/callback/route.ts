import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const postUrl = searchParams.get('post_url')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to loading page with post URL if provided
      const redirectUrl = postUrl 
        ? `${origin}/loading?url=${encodeURIComponent(postUrl)}`
        : `${origin}/loading`
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Return to signin page on error
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}