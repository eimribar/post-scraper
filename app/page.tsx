import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPageClient from './LandingPageClient'

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; post_url?: string }>
}) {
  const params = await searchParams
  
  // Handle OAuth callback if code is present
  if (params.code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(params.code)
      
      if (error) {
        console.error('Code exchange error:', error.message, error)
        redirect(`/auth/signin?error=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        // Check if we have a LinkedIn URL in the params
        if (params.post_url) {
          redirect(`/loading?url=${encodeURIComponent(params.post_url)}`)
        } else {
          redirect('/dashboard')
        }
      }
    } catch (e) {
      console.error('OAuth callback error:', e)
      redirect(`/auth/signin?error=${encodeURIComponent(String(e))}`)
    }
  }

  // Check if user is already authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  // Render the client component for the landing page
  return <LandingPageClient />
}