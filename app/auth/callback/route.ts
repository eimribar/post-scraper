import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const postUrl = searchParams.get('post_url')
  const state = searchParams.get('state')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if we have a post URL from either query param or state
      const linkedinUrl = postUrl || state
      
      // If we have a LinkedIn URL, go to loading page
      if (linkedinUrl && linkedinUrl.includes('linkedin.com')) {
        return NextResponse.redirect(`${origin}/loading?url=${encodeURIComponent(linkedinUrl)}`)
      }
      
      // Otherwise, go directly to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Return to signin page on error
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`)
}