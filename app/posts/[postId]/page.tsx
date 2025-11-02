'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ExternalLink, ThumbsUp, MessageCircle, Users } from 'lucide-react'
import { mockEngagements, mockPost } from '@/lib/mockData'
import AnimatedList from '@/components/ui/AnimatedList'

interface Engagement {
  id: string
  name: string
  profile_url: string | null
  profile_image_url: string | null
  headline: string | null
  reaction_type: string | null
  icp_score: number | null
  icp_fit: 'high' | 'medium' | 'low' | null
  contacted: boolean
  created_at: string
}

interface Post {
  id: string
  url: string
  author_name: string | null
  content: string | null
  created_at: string
  total_reactions: number | null
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoaded } = useUser()
  const [post, setPost] = useState<Post | null>(null)
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user && params.postId) {
      // Use mock data for UI demonstration
      setIsLoading(true)
      setTimeout(() => {
        setPost(mockPost)
        setEngagements(mockEngagements)
        setIsLoading(false)
      }, 500) // Simulate loading
    }
  }, [user, params.postId])

  // Calculate stats from engagements
  const totalLikes = engagements.filter(e => e.reaction_type === 'LIKE').length
  const totalComments = 0 // Mock data doesn't have comments yet
  const totalEngagements = engagements.length
  const icpMatches = engagements.filter(e => e.icp_fit === 'high')

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <AppLayout>
        {/* Header Skeleton */}
        <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48 bg-slate-800" />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side skeleton */}
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 bg-slate-900/50" />
            </div>
            {/* Right side skeleton */}
            <div className="lg:col-span-1">
              <Skeleton className="h-96 bg-slate-900/50" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Post Not Found</h2>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        </div>
      </AppLayout>
    )
  }

  const postTitle = post.content
    ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '')
    : `Post by ${post.author_name || 'Unknown'}`

  return (
    <AppLayout>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex-1">
              <h1 className="text-lg font-semibold text-white truncate">
                {postTitle}
              </h1>
              <p className="text-sm text-slate-400">
                {new Date(post.created_at).toLocaleDateString()} •{' '}
                {totalEngagements} engagements
              </p>
            </div>

            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-[#111318] min-h-screen">
        <div className="px-4 md:px-6 py-4">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between gap-2 pb-4">
            <div className="flex flex-col gap-1">
              <p className="text-white text-xl font-bold leading-tight">
                Extracted Leads
              </p>
              <p className="text-[#9da6b9] text-xs font-normal leading-normal">
                Scraped engagers and ICP matches from your LinkedIn post
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-3 pb-5">
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4 text-blue-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  Total Likes
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {totalLikes}
              </p>
            </Card>
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-green-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  Total Comments
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {totalComments}
              </p>
            </Card>
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  Total Engagements
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {totalEngagements}
              </p>
            </Card>
          </div>

          {/* All Engagements Section */}
          <div className="pb-5">
            <h2 className="text-white text-base font-semibold leading-tight pb-3">
              All Engagements
            </h2>
            <Card className="rounded-lg border border-[#3b4354] bg-[#282e39] overflow-hidden p-0">
              <AnimatedList
                items={engagements}
                renderItem={(engagement, index, isSelected) => {
                  // Extract company from headline (simplified extraction)
                  const headlineParts = engagement.headline?.split('at ') || []
                  const company = headlineParts.length > 1
                    ? headlineParts[1].split('|')[0].trim()
                    : 'N/A'
                  const title = headlineParts[0]?.trim() || engagement.headline || 'N/A'

                  return (
                    <div
                      className={`border-b border-[#3b4354] ${
                        index % 2 === 0 ? 'bg-[#282e39]' : 'bg-[#1f2530]'
                      } hover:bg-slate-800/50 transition-colors`}
                    >
                      <div className="grid grid-cols-5 gap-3 px-3 py-2.5 items-center">
                        <div className="flex items-center gap-2">
                          <a
                            href={engagement.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block"
                          >
                            <Avatar className="h-9 w-9 border border-slate-700">
                              <AvatarImage src={engagement.profile_image_url || undefined} />
                              <AvatarFallback className="bg-slate-800 text-white text-xs">
                                {engagement.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </a>
                          <a
                            href={engagement.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
                          >
                            {engagement.name}
                          </a>
                        </div>
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal truncate">
                            {title}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal">
                            {company}
                          </p>
                        </div>
                        <div className="text-center">
                          {engagement.icp_fit === 'high' ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs px-2 py-0.5">
                              High ({engagement.icp_score})
                            </Badge>
                          ) : engagement.icp_fit === 'medium' ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 text-xs px-2 py-0.5">
                              Medium ({engagement.icp_score})
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30 text-xs px-2 py-0.5">
                              Low ({engagement.icp_score})
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-slate-600 hover:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }}
                onItemSelect={(engagement, index) => {
                  console.log('Selected:', engagement.name, index)
                }}
                showGradients={true}
                enableArrowNavigation={false}
                displayScrollbar={true}
              />
            </Card>
          </div>

          {/* ICP Matches Section */}
          <div className="pb-5">
            <h2 className="text-white text-base font-semibold leading-tight pb-3">
              ICP Matches ({icpMatches.length})
            </h2>
            <Card className="rounded-lg border border-green-700/30 bg-[#282e39] overflow-hidden p-0">
              <AnimatedList
                items={icpMatches}
                renderItem={(engagement, index, isSelected) => {
                  // Extract company from headline (simplified extraction)
                  const headlineParts = engagement.headline?.split('at ') || []
                  const company = headlineParts.length > 1
                    ? headlineParts[1].split('|')[0].trim()
                    : 'N/A'
                  const title = headlineParts[0]?.trim() || engagement.headline || 'N/A'

                  return (
                    <div
                      className={`border-b border-[#3b4354] ${
                        index % 2 === 0 ? 'bg-[#282e39]' : 'bg-[#1f2530]'
                      } hover:bg-green-900/20 transition-colors`}
                    >
                      <div className="grid grid-cols-5 gap-3 px-3 py-2.5 items-center">
                        <div className="flex items-center gap-2">
                          <a
                            href={engagement.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block"
                          >
                            <Avatar className="h-9 w-9 border-2 border-green-700">
                              <AvatarImage src={engagement.profile_image_url || undefined} />
                              <AvatarFallback className="bg-slate-800 text-white text-xs">
                                {engagement.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </a>
                          <a
                            href={engagement.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
                          >
                            {engagement.name}
                          </a>
                        </div>
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal truncate">
                            {title}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal">
                            {company}
                          </p>
                        </div>
                        <div className="text-center">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs px-2 py-0.5">
                            {engagement.icp_score}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }}
                onItemSelect={(engagement, index) => {
                  console.log('Selected ICP Match:', engagement.name, index)
                }}
                showGradients={true}
                enableArrowNavigation={false}
                displayScrollbar={true}
              />
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
