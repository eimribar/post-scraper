'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '@/components/layout/AppLayout'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'
import { mockPosts } from '@/lib/mockData'
import { LinkedInUrlInput } from '@/components/dashboard/LinkedInUrlInput'
import { XCard } from '@/components/ui/x-gradient-card'
import { GlowEffect } from '@/components/ui/glow-effect'

interface Post {
  id: string
  url: string
  author_name: string | null
  content: string | null
  created_at: string
  stats: {
    totalEngagements: number
    icpMatchPercentage: number
    newCount: number
    topICPEngagers: any[]
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      // Use mock data for UI demonstration
      setIsLoading(true)
      setTimeout(() => {
        setPosts(mockPosts)
        setIsLoading(false)
      }, 500) // Simulate loading
    }
  }, [user])

  const handleSubmit = (url: string) => {
    if (!url || !url.includes('linkedin.com/posts/')) {
      alert('Please enter a valid LinkedIn post URL')
      return
    }

    // Simulate processing
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      // In real implementation, this would add a new post to the list
      alert('Post URL submitted! In production, this would scrape engagers.')
    }, 2000)
  }

  const handleBatchUpload = () => {
    alert('Batch upload feature coming soon!')
  }

  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`)
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-white text-xl font-bold leading-tight">
              Dashboard
            </h1>
            <p className="text-slate-400 text-xs font-normal leading-normal">
              Paste a LinkedIn post URL to extract engagers
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* URL Input Section */}
        <div className="mb-8">
          <LinkedInUrlInput
            onSubmit={handleSubmit}
            onBatchUpload={handleBatchUpload}
            isProcessing={isProcessing}
          />
        </div>

        {/* Scraped Posts Section */}
        {isLoading ? (
          // Loading State
          <div className="space-y-3">
            <Skeleton className="h-6 w-48 bg-slate-900/50" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-32 bg-slate-900/50 rounded-lg"
                />
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-3 max-w-md">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                No Posts Yet
              </h3>
              <p className="text-slate-400 text-sm">
                Paste a LinkedIn post URL above to start extracting engagers and potential leads.
              </p>
            </div>
          </div>
        ) : (
          // Posts List
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">
                Scraped Posts ({posts.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
              {posts.map((post) => {
                // Split content into lines for XCard format
                const contentLines = post.content
                  ? post.content.split('\n').filter(line => line.trim())
                  : [`Post from ${post.author_name || 'LinkedIn'}`]

                // Format timestamp
                const timestamp = new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                // Get top ICP engager for reply if available
                const topEngager = post.stats.topICPEngagers?.[0]
                const reply = topEngager ? {
                  authorName: topEngager.name,
                  authorHandle: topEngager.name.toLowerCase().replace(/\s+/g, ''),
                  authorImage: topEngager.profile_image_url,
                  content: `Reacted to this post • ICP Score: ${topEngager.icp_score}`,
                  isVerified: topEngager.icp_score >= 85,
                  timestamp: 'Recently'
                } : undefined

                return (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post.id)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-full w-full">
                      <GlowEffect
                        colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                        mode='static'
                        blur='medium'
                      />
                      <div className="relative h-full w-full rounded-lg bg-slate-900/95 border border-slate-800/50 p-3">
                        <div className="dark">
                          <XCard
                            link={post.url}
                            authorName={post.author_name || 'LinkedIn User'}
                            authorHandle={post.author_name?.toLowerCase().replace(/\s+/g, '') || 'linkedinuser'}
                            authorImage="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                            content={contentLines}
                            isVerified={true}
                            timestamp={timestamp}
                            reply={reply}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  )
}
