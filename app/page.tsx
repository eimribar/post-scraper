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
  
  // Handle OAuth callback if code is present
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    
    if (!error) {
      // Successfully authenticated - check for pending URL in cookies
      const cookieStore = await cookies()
      const pendingUrl = cookieStore.get('pending_post_url')?.value
      
      // Clear the pending URL cookie
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