'use client'

import { useRouter } from 'next/navigation'
import { HeroWave } from '@/components/ui/ai-input-hero'

export default function LandingPageClient() {
  const router = useRouter()

  const handleSubmit = (url: string) => {
    if (!url || !url.includes('linkedin.com/posts/')) {
      alert('Please enter a valid LinkedIn post URL')
      return
    }

    // Store URL in sessionStorage to pass through auth flow
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pendingPostUrl', url)
    }

    // Redirect to sign in page with custom redirect to loading page
    // This overrides the default /dashboard redirect when user has a pending URL
    router.push('/sign-in?redirect_url=/loading')
  }

  return (
    <HeroWave
      title="Track LinkedIn Engagement"
      subtitle="Discover who's engaging with your posts and turn reactions into leads"
      placeholder="Paste your colleague's, competitor's, or influencer's post URL..."
      buttonText="Start Tracking"
      onPromptSubmit={handleSubmit}
    />
  )
}