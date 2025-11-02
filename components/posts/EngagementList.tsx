'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Search,
  ExternalLink,
  Check,
  Filter,
  ThumbsUp,
  Heart,
  Lightbulb,
  Smile,
  HandHeart,
} from 'lucide-react'

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

interface EngagementListProps {
  engagements: Engagement[]
  onMarkAsContacted: (engagementId: string) => void
}

export function EngagementList({
  engagements,
  onMarkAsContacted,
}: EngagementListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [icpFilter, setIcpFilter] = useState<'all' | 'high' | 'medium' | 'low'>(
    'all'
  )

  // Filter engagements
  const filteredEngagements = engagements.filter((engagement) => {
    const matchesSearch =
      engagement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (engagement.headline &&
        engagement.headline.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesICP =
      icpFilter === 'all' || engagement.icp_fit === icpFilter

    return matchesSearch && matchesICP
  })

  const getICPBadgeColor = (
    fit: 'high' | 'medium' | 'low' | null
  ): 'default' | 'secondary' | 'outline' => {
    if (fit === 'high') return 'default'
    if (fit === 'medium') return 'secondary'
    return 'outline'
  }

  const getReactionIcon = (reactionType: string | null) => {
    switch (reactionType) {
      case 'LIKE':
        return <ThumbsUp className="h-3 w-3" />
      case 'EMPATHY':
        return <Heart className="h-3 w-3" />
      case 'PRAISE':
        return <HandHeart className="h-3 w-3" />
      case 'INTEREST':
        return <Lightbulb className="h-3 w-3" />
      case 'ENTERTAINMENT':
        return <Smile className="h-3 w-3" />
      default:
        return <ThumbsUp className="h-3 w-3" />
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Engagements ({filteredEngagements.length})
            </h2>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          {/* ICP Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Button
              variant={icpFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIcpFilter('all')}
              className={
                icpFilter === 'all'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'border-slate-700 text-slate-300'
              }
            >
              All
            </Button>
            <Button
              variant={icpFilter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIcpFilter('high')}
              className={
                icpFilter === 'high'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'border-slate-700 text-slate-300'
              }
            >
              High ICP
            </Button>
            <Button
              variant={icpFilter === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIcpFilter('medium')}
              className={
                icpFilter === 'medium'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'border-slate-700 text-slate-300'
              }
            >
              Medium ICP
            </Button>
            <Button
              variant={icpFilter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIcpFilter('low')}
              className={
                icpFilter === 'low'
                  ? 'bg-slate-600 hover:bg-slate-700'
                  : 'border-slate-700 text-slate-300'
              }
            >
              Low ICP
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredEngagements.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No engagements found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredEngagements.map((engagement) => (
              <div
                key={engagement.id}
                className="p-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12 border-2 border-slate-700">
                    <AvatarImage
                      src={engagement.profile_image_url || undefined}
                    />
                    <AvatarFallback className="bg-slate-800 text-white">
                      {engagement.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">
                            {engagement.name}
                          </h3>
                          {engagement.profile_url && (
                            <a
                              href={engagement.profile_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-blue-400 transition-colors flex-shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {engagement.headline && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {engagement.headline}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {engagement.icp_fit && (
                            <Badge
                              variant={getICPBadgeColor(engagement.icp_fit)}
                              className="text-xs"
                            >
                              {engagement.icp_fit.toUpperCase()} ICP
                              {engagement.icp_score && ` (${engagement.icp_score})`}
                            </Badge>
                          )}

                          {engagement.reaction_type && (
                            <Badge variant="outline" className="text-xs gap-1">
                              {getReactionIcon(engagement.reaction_type)}
                              {engagement.reaction_type}
                            </Badge>
                          )}

                          {engagement.contacted && (
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 border-green-500/30 text-green-400"
                            >
                              <Check className="h-3 w-3" />
                              Contacted
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Mark as Contacted Button */}
                      {!engagement.contacted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMarkAsContacted(engagement.id)}
                          className="flex-shrink-0 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Contacted
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
