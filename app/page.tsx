import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import LandingPageClient from './LandingPageClient'

export default async function LandingPage() {
  // Check if user is already authenticated
  const { userId } = await auth()

  if (userId) {
    redirect('/dashboard')
  }

  // Render the client component for the landing page
  return <LandingPageClient />
}