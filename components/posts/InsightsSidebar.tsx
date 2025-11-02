'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  TrendingUp,
  Target,
  Check,
  Award,
  Activity,
} from 'lucide-react'

interface Engagement {
  id: string
  name: string
  profile_url: string | null
  profile_image_url: string | null
  headline: string | null
  icp_score: number | null
  icp_fit: 'high' | 'medium' | 'low' | null
}

interface Post {
  id: string
  url: string
  author_name: string | null
  content: string | null
  created_at: string
}

interface Stats {
  totalEngagements: number
  icpMatchPercentage: number
  highICPCount: number
  mediumICPCount: number
  lowICPCount: number
  contactedCount: number
  topICPEngagers: Engagement[]
  recentCount: number
}

interface InsightsSidebarProps {
  post: Post
  stats: Stats | null
}

export function InsightsSidebar({ post, stats }: InsightsSidebarProps) {
  if (!stats) {
    return (
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Insights</h2>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Loading insights...</p>
        </CardContent>
      </Card>
    )
  }

  const getICPDots = (percentage: number) => {
    const filledDots = Math.round(percentage / 25)
    return '●'.repeat(filledDots) + '○'.repeat(4 - filledDots)
  }

  return (
    <div className="space-y-6 sticky top-24">
      {/* Overview Stats Card */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Overview
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Engagements */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Total Engagements</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {stats.totalEngagements}
            </span>
          </div>

          <Separator className="bg-slate-800" />

          {/* ICP Match */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">ICP Match</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">
                  {stats.icpMatchPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {getICPDots(stats.icpMatchPercentage)}
                </span>
              </div>
            </div>

            {/* ICP Breakdown */}
            <div className="space-y-1 pl-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400">High ICP</span>
                <span className="text-slate-300">{stats.highICPCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400">Medium ICP</span>
                <span className="text-slate-300">{stats.mediumICPCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Low ICP</span>
                <span className="text-slate-300">{stats.lowICPCount}</span>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Recent Activity */}
          {stats.recentCount > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-400">New (24h)</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                +{stats.recentCount}
              </Badge>
            </div>
          )}

          {/* Contacted Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-400">Contacted</span>
            </div>
            <span className="text-lg font-semibold text-white">
              {stats.contactedCount}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top ICP Engagers Card */}
      {stats.topICPEngagers.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Top ICP Matches
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topICPEngagers.map((engager, index) => (
              <div
                key={engager.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors"
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10 border-2 border-blue-500/20">
                  <AvatarImage src={engager.profile_image_url || undefined} />
                  <AvatarFallback className="bg-slate-800 text-white text-xs">
                    {engager.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {engager.name}
                  </p>
                  {engager.headline && (
                    <p className="text-xs text-slate-400 truncate">
                      {engager.headline}
                    </p>
                  )}
                </div>

                {/* ICP Score */}
                {engager.icp_score !== null && (
                  <Badge
                    variant="default"
                    className="flex-shrink-0 bg-blue-500/20 text-blue-400 border-blue-500/30"
                  >
                    {engager.icp_score}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Post Info Card */}
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Post Details</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-xs text-slate-400">Posted on</span>
            <p className="text-sm text-white">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {post.author_name && (
            <div>
              <span className="text-xs text-slate-400">Author</span>
              <p className="text-sm text-white">{post.author_name}</p>
            </div>
          )}

          {post.content && (
            <div>
              <span className="text-xs text-slate-400">Preview</span>
              <p className="text-sm text-slate-300 line-clamp-3 mt-1">
                {post.content}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
