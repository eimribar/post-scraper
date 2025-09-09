import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPageClient from './LandingPageClient'

export default async function LandingPage() {
  // Check if user is already authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  // Render the client component for the landing page
  return <LandingPageClient />
}