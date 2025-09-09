import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LandingPageClient from './LandingPageClient'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Handle OAuth callback if code is present (Supabase redirects here)
  if (params.code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code)
    
    if (exchangeError) {
      console.error('OAuth code exchange error:', exchangeError)
      redirect(`/auth/signin?error=${encodeURIComponent(exchangeError.message)}`)
    }
    
    if (data?.session) {
      // Get the pending URL from cookie
      const cookieStore = await cookies()
      const pendingUrl = cookieStore.get('pending_post_url')?.value
      
      // Clear the cookie by setting it with maxAge 0
      if (pendingUrl) {
        cookieStore.set('pending_post_url', '', {
          maxAge: 0,
          path: '/'
        })
      }
      
      // Redirect based on whether we have a LinkedIn URL
      if (pendingUrl && pendingUrl.includes('linkedin.com')) {
        redirect(`/loading?url=${encodeURIComponent(pendingUrl)}`)
      } else {
        redirect('/dashboard')
      }
    } else {
      redirect('/auth/signin?error=no_session')
    }
  }
  
  // Handle OAuth errors
  if (params.error) {
    console.error('OAuth error:', params.error)
    redirect(`/auth/signin?error=${encodeURIComponent(params.error)}`)
  }
  
  // Check if user is already authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  // Render the client component for the landing page
  return <LandingPageClient />
}