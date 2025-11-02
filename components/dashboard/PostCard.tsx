'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink, Users, TrendingUp } from 'lucide-react'

interface TopEngager {
  id: string
  name: string
  profile_image_url: string | null
  icp_score: number
}

interface PostStats {
  totalEngagements: number
  icpMatchPercentage: number
  newCount: number
  topICPEngagers: TopEngager[]
}

interface PostCardProps {
  post: {
    id: string
    url: string
    author_name: string | null
    content: string | null
    created_at: string
    stats: PostStats
  }
}

export function PostCard({ post }: PostCardProps) {
  // Extract post title from content (first 60 chars) or use author name
  const postTitle = post.content
    ? post.content.substring(0, 60) + (post.content.length > 60 ? '...' : '')
    : `Post by ${post.author_name || 'Unknown'}`

  // ICP badge color based on percentage
  const getICPBadgeVariant = (percentage: number) => {
    if (percentage >= 70) return 'default' // High
    if (percentage >= 40) return 'secondary' // Medium
    return 'outline' // Low
  }

  const getICPDots = (percentage: number) => {
    const filledDots = Math.round(percentage / 25)
    return '●'.repeat(filledDots) + '○'.repeat(4 - filledDots)
  }

  return (
    <Card className="relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-white truncate mb-0.5">
              {postTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        {/* Stats Row */}
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-white font-medium text-sm">
              {post.stats.totalEngagements}
            </span>
          </div>

          {post.stats.icpMatchPercentage > 0 && (
            <Badge
              variant={getICPBadgeVariant(post.stats.icpMatchPercentage)}
              className="font-mono text-[10px] px-1.5 py-0.5"
            >
              {post.stats.icpMatchPercentage}% ICP{' '}
              {getICPDots(post.stats.icpMatchPercentage)}
            </Badge>
          )}

          {post.stats.newCount > 0 && (
            <Badge
              variant="default"
              className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0.5"
            >
              <TrendingUp className="h-3 w-3 mr-0.5" />+{post.stats.newCount} new
            </Badge>
          )}
        </div>

        {/* Top ICP Engagers */}
        {post.stats.topICPEngagers.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400">Top ICP Matches</p>
            <div className="flex items-center gap-1.5">
              {post.stats.topICPEngagers.map((engager) => (
                <Avatar key={engager.id} className="h-7 w-7 border border-blue-500/20">
                  <AvatarImage src={engager.profile_image_url || undefined} />
                  <AvatarFallback className="bg-slate-800 text-[10px]">
                    {engager.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {post.stats.topICPEngagers.length === 3 && (
                <span className="text-[10px] text-slate-400">+more</span>
              )}
            </div>
          </div>
        )}

        {/* View Button */}
        <Link href={`/posts/${post.id}`}>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white h-8 text-xs"
          >
            View Engagements
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
