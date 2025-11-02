'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Filter } from 'lucide-react'
import { mockEngagements } from '@/lib/mockData'
import AnimatedList from '@/components/ui/AnimatedList'

interface AggregatedEngager {
  id: string
  name: string
  profile_url: string | null
  profile_image_url: string | null
  headline: string | null
  icp_score: number | null
  icp_fit: 'high' | 'medium' | 'low' | null
  total_engagements: number
  reaction_types: string[]
  last_engaged: string
}

export default function EngagersPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [showICPOnly, setShowICPOnly] = useState(false)
  const [aggregatedEngagers, setAggregatedEngagers] = useState<AggregatedEngager[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      // Simulate aggregating engagers from multiple posts
      setIsLoading(true)
      setTimeout(() => {
        // Aggregate mock data
        const engagerMap = new Map<string, AggregatedEngager>()

        // Simulate data from multiple posts by duplicating some engagers
        const multiplePostsData = [
          ...mockEngagements,
          ...mockEngagements.slice(0, 5).map(e => ({
            ...e,
            id: e.id + '_post2',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          })),
          ...mockEngagements.slice(2, 8).map(e => ({
            ...e,
            id: e.id + '_post3',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          })),
        ]

        multiplePostsData.forEach(engagement => {
          const key = engagement.name

          if (engagerMap.has(key)) {
            const existing = engagerMap.get(key)!
            existing.total_engagements += 1
            if (engagement.reaction_type && !existing.reaction_types.includes(engagement.reaction_type)) {
              existing.reaction_types.push(engagement.reaction_type)
            }
            if (new Date(engagement.created_at) > new Date(existing.last_engaged)) {
              existing.last_engaged = engagement.created_at
            }
          } else {
            engagerMap.set(key, {
              id: engagement.id,
              name: engagement.name,
              profile_url: engagement.profile_url,
              profile_image_url: engagement.profile_image_url,
              headline: engagement.headline,
              icp_score: engagement.icp_score,
              icp_fit: engagement.icp_fit,
              total_engagements: 1,
              reaction_types: engagement.reaction_type ? [engagement.reaction_type] : [],
              last_engaged: engagement.created_at,
            })
          }
        })

        // Convert to array and sort by engagement count (descending)
        const aggregated = Array.from(engagerMap.values()).sort(
          (a, b) => b.total_engagements - a.total_engagements
        )

        setAggregatedEngagers(aggregated)
        setIsLoading(false)
      }, 500)
    }
  }, [user])

  const filteredEngagers = showICPOnly
    ? aggregatedEngagers.filter(e => e.icp_fit === 'high')
    : aggregatedEngagers

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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Engagers
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Aggregated view of all people who engaged with your posts
              </p>
            </div>

            {/* Toggle Button */}
            <Button
              onClick={() => setShowICPOnly(!showICPOnly)}
              variant={showICPOnly ? 'default' : 'outline'}
              className={
                showICPOnly
                  ? 'bg-green-600 hover:bg-green-700 text-white h-9'
                  : 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-9'
              }
            >
              <Filter className="h-4 w-4 mr-2" />
              {showICPOnly ? 'Showing ICP Only' : 'Show All'}
            </Button>
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
                {showICPOnly ? 'High ICP Engagers' : 'All Engagers'}
              </p>
              <p className="text-[#9da6b9] text-xs font-normal leading-normal">
                {filteredEngagers.length} {showICPOnly ? 'ICP matches' : 'total engagers'} sorted by engagement frequency
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-3 pb-5">
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  Total Engagers
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {aggregatedEngagers.length}
              </p>
            </Card>
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-green-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  High ICP Matches
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {aggregatedEngagers.filter(e => e.icp_fit === 'high').length}
              </p>
            </Card>
            <Card className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-lg border border-[#3b4354] bg-[#282e39] p-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-400" />
                <p className="text-[#9da6b9] text-xs font-medium leading-normal">
                  Repeat Engagers
                </p>
              </div>
              <p className="text-white text-xl font-bold leading-tight">
                {aggregatedEngagers.filter(e => e.total_engagements > 1).length}
              </p>
            </Card>
          </div>

          {/* Engagers List */}
          <div className="pb-5">
            <Card className="rounded-lg border border-[#3b4354] bg-[#282e39] overflow-hidden p-0">
              <AnimatedList
                items={filteredEngagers}
                renderItem={(engager: AggregatedEngager, index: number, isSelected: boolean) => {
                  // Extract company from headline
                  const headlineParts = engager.headline?.split('at ') || []
                  const company = headlineParts.length > 1
                    ? headlineParts[1].split('|')[0].trim()
                    : 'N/A'
                  const title = headlineParts[0]?.trim() || engager.headline || 'N/A'

                  return (
                    <div
                      className={`border-b border-[#3b4354] ${
                        index % 2 === 0 ? 'bg-[#282e39]' : 'bg-[#1f2530]'
                      } hover:bg-slate-800/50 transition-colors`}
                    >
                      <div className="grid grid-cols-6 gap-3 px-3 py-2.5 items-center">
                        {/* Name & Avatar */}
                        <div className="flex items-center gap-2">
                          <a
                            href={engager.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="block"
                          >
                            <Avatar className={`h-9 w-9 ${engager.icp_fit === 'high' ? 'border-2 border-green-700' : 'border border-slate-700'}`}>
                              <AvatarImage src={engager.profile_image_url || undefined} />
                              <AvatarFallback className="bg-slate-800 text-white text-xs">
                                {engager.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </a>
                          <a
                            href={engager.profile_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white text-sm font-medium hover:text-blue-400 transition-colors"
                          >
                            {engager.name}
                          </a>
                        </div>

                        {/* Title */}
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal truncate">
                            {title}
                          </p>
                        </div>

                        {/* Company */}
                        <div>
                          <p className="text-[#9da6b9] text-xs font-normal">
                            {company}
                          </p>
                        </div>

                        {/* Total Engagements */}
                        <div className="text-center">
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 text-xs px-2 py-0.5">
                            {engager.total_engagements}x engaged
                          </Badge>
                        </div>

                        {/* ICP Score */}
                        <div className="text-center">
                          {engager.icp_fit === 'high' ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 text-xs px-2 py-0.5">
                              High ({engager.icp_score})
                            </Badge>
                          ) : engager.icp_fit === 'medium' ? (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 text-xs px-2 py-0.5">
                              Medium ({engager.icp_score})
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 hover:bg-slate-500/30 text-xs px-2 py-0.5">
                              Low ({engager.icp_score})
                            </Badge>
                          )}
                        </div>

                        {/* Action */}
                        <div className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-slate-600 hover:border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }}
                onItemSelect={(engager: AggregatedEngager, index: number) => {
                  console.log('Selected:', engager.name, index)
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
