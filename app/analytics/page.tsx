'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()

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
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-white text-xl font-bold leading-tight">
                Engagement Analytics
              </h1>
              <p className="text-slate-400 text-xs font-normal leading-normal">
                Aggregated insights from your LinkedIn posts
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-9 text-sm"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Last 30 Days</span>
              <span className="text-xs">▼</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-5">
        <div className="flex flex-col gap-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-400 text-xs font-medium leading-normal">
                    Total Likes
                  </p>
                  <p className="text-white tracking-tight text-2xl font-bold leading-tight">
                    12,845
                  </p>
                  <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +12.5%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-400 text-xs font-medium leading-normal">
                    Avg. Likes / Post
                  </p>
                  <p className="text-white tracking-tight text-2xl font-bold leading-tight">
                    152
                  </p>
                  <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +3.1%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-400 text-xs font-medium leading-normal">
                    Posts Scraped
                  </p>
                  <p className="text-white tracking-tight text-2xl font-bold leading-tight">
                    84
                  </p>
                  <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +5
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-400 text-xs font-medium leading-normal">
                    Engagement Rate
                  </p>
                  <p className="text-white tracking-tight text-2xl font-bold leading-tight">
                    4.72%
                  </p>
                  <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                    <TrendingDown className="h-3.5 w-3.5" />
                    -0.2%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-3">
            {/* Engagement Chart */}
            <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-200 text-sm font-medium leading-normal">
                    Engagement Over Time
                  </p>
                  <p className="text-white tracking-light text-2xl font-bold leading-tight truncate">
                    1.2k Likes
                  </p>
                  <div className="flex gap-1">
                    <p className="text-slate-400 text-xs font-normal leading-normal">
                      Last 30 Days
                    </p>
                    <p className="text-green-500 text-xs font-medium leading-normal">
                      +8.2%
                    </p>
                  </div>
                  <div className="flex min-h-[180px] flex-1 flex-col gap-6 py-3">
                    <svg
                      fill="none"
                      height="100%"
                      preserveAspectRatio="none"
                      viewBox="-3 0 478 150"
                      width="100%"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                        fill="url(#paint0_linear_chart)"
                      />
                      <path
                        d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                        stroke="url(#paint1_linear_chart)"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                      <defs>
                        <linearGradient
                          gradientUnits="userSpaceOnUse"
                          id="paint0_linear_chart"
                          x1="236"
                          x2="236"
                          y1="1"
                          y2="149"
                        >
                          <stop stopColor="#0d7ff2" stopOpacity="0.2" />
                          <stop offset="1" stopColor="#0d7ff2" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient
                          gradientUnits="userSpaceOnUse"
                          id="paint1_linear_chart"
                          x1="0"
                          x2="472"
                          y1="75"
                          y2="75"
                        >
                          <stop stopColor="#00A6F3" />
                          <stop offset="1" stopColor="#0052D4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex justify-between">
                      <p className="text-slate-400 text-[10px] font-bold leading-normal tracking-[0.015em]">
                        Week 1
                      </p>
                      <p className="text-slate-400 text-[10px] font-bold leading-normal tracking-[0.015em]">
                        Week 2
                      </p>
                      <p className="text-slate-400 text-[10px] font-bold leading-normal tracking-[0.015em]">
                        Week 3
                      </p>
                      <p className="text-slate-400 text-[10px] font-bold leading-normal tracking-[0.015em]">
                        Week 4
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Insights */}
            <Card className="lg:col-span-1 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col gap-1.5">
                  <p className="text-slate-200 text-sm font-medium leading-normal">
                    Audience Insights
                  </p>
                  <p className="text-slate-400 text-xs font-normal leading-normal">
                    Follower vs. Non-Follower
                  </p>
                  <div className="flex flex-1 items-center justify-center p-2">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="stroke-slate-700"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#donut_gradient)"
                          strokeDasharray="70, 100"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                        <defs>
                          <linearGradient
                            id="donut_gradient"
                            x1="0%"
                            x2="0%"
                            y1="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              style={{ stopColor: '#00A6F3', stopOpacity: 1 }}
                            />
                            <stop
                              offset="100%"
                              style={{ stopColor: '#0052D4', stopOpacity: 1 }}
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">70%</span>
                        <span className="text-xs text-slate-400">Followers</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-around pt-2">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Followers</p>
                      <p className="font-bold text-base text-slate-200">9,012</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Non-Followers</p>
                      <p className="font-bold text-base text-slate-200">3,833</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Content */}
          <div className="flex flex-col gap-3">
            <h2 className="text-white text-base font-semibold leading-tight pb-2">
              Top Performing Content
            </h2>
            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-400">
                  <thead className="text-[10px] text-slate-300 uppercase bg-slate-800">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold" scope="col">
                        Post Snippet
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-center" scope="col">
                        Likes
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-center" scope="col">
                        Comments
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-center" scope="col">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-white max-w-sm truncate text-xs">
                        Excited to share my latest article on the future of UI design
                        systems...
                      </td>
                      <td className="px-4 py-3 text-center">452</td>
                      <td className="px-4 py-3 text-center">34</td>
                      <td className="px-4 py-3 text-center">2023-10-26</td>
                    </tr>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-white max-w-sm truncate text-xs">
                        Just wrapped up a major project! Here's a quick rundown of our
                        process...
                      </td>
                      <td className="px-4 py-3 text-center">389</td>
                      <td className="px-4 py-3 text-center">21</td>
                      <td className="px-4 py-3 text-center">2023-10-24</td>
                    </tr>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-white max-w-sm truncate text-xs">
                        Thinking about the impact of AI on creative roles. What are your
                        thoughts?
                      </td>
                      <td className="px-4 py-3 text-center">312</td>
                      <td className="px-4 py-3 text-center">58</td>
                      <td className="px-4 py-3 text-center">2023-10-22</td>
                    </tr>
                    <tr className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-medium text-white max-w-sm truncate text-xs">
                        Quick tip for all fellow developers out there working with
                        Tailwind CSS...
                      </td>
                      <td className="px-4 py-3 text-center">278</td>
                      <td className="px-4 py-3 text-center">15</td>
                      <td className="px-4 py-3 text-center">2023-10-20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
