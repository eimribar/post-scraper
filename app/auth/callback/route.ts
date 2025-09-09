import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { isWorkEmail } from '@/lib/email-validation'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user's email to validate it's a work email
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email && !isWorkEmail(user.email)) {
        // Sign out personal email accounts
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/auth/signin?error=work_email_required`)
      }
      
      // Check for pending URL in cookies
      const pendingUrl = request.headers.get('cookie')?.match(/pending_post_url=([^;]*)/)?.[1]
      
      if (pendingUrl) {
        const decodedUrl = decodeURIComponent(pendingUrl)
        // Clear the cookie and redirect to loading page
        const response = decodedUrl.includes('linkedin.com')
          ? NextResponse.redirect(`${origin}/loading?url=${encodeURIComponent(decodedUrl)}`)
          : NextResponse.redirect(`${origin}/dashboard`)
        
        response.cookies.set('pending_post_url', '', {
          maxAge: 0,
          path: '/'
        })
        
        return response
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }
  
  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}