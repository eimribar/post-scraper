'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface Engagement {
  id: string
  name: string
  headline: string
  title: string
  company: string
  profile_image_url: string
  linkedin_profile_url: string
  reaction_type: string
}

interface ScrapingJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  post_url: string
  created_at: string
  completed_at?: string
  error_message?: string
}

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const supabase = createClient()
  const postUrl = searchParams.get('url')

  useEffect(() => {
    checkUser()
    loadExistingData()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/signin')
    } else {
      setUser(user)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch('/api/scrape/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'completed') {
          // Reload job and engagements
          const { data: job } = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('id', jobId)
            .single()
          
          if (job) {
            setCurrentJob(job)
            await loadEngagements(jobId)
          }
        } else if (data.status === 'failed') {
          const { data: job } = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('id', jobId)
            .single()
          
          if (job) {
            setCurrentJob(job)
          }
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error('Error polling job status:', error)
    }
  }

  const subscribeToJobUpdates = (jobId: string) => {
    // Subscribe to real-time updates for this job
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scraping_jobs',
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          const newJob = payload.new as ScrapingJob
          setCurrentJob(newJob)
          
          if (newJob?.status === 'completed') {
            loadEngagements(jobId)
          }
        }
      )
      .subscribe()

    // Also poll for updates in case webhook fails
    const pollInterval = setInterval(() => {
      if (currentJob?.status === 'processing') {
        pollJobStatus(jobId)
      }
    }, 5000) // Poll every 5 seconds

    return () => {
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }

  const loadEngagements = async (jobId: string) => {
    const { data, error } = await supabase
      .from('engagements')
      .select('*')
      .eq('scraping_job_id', jobId)

    if (data) {
      setEngagements(data)
    }
    setIsLoading(false)
  }

  const loadExistingData = async () => {
    // Load most recent job and its engagements
    const { data: jobs } = await supabase
      .from('scraping_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    if (jobs && jobs.length > 0) {
      setCurrentJob(jobs[0])
      
      // If job is processing, start polling
      if (jobs[0].status === 'processing') {
        subscribeToJobUpdates(jobs[0].id)
      } else if (jobs[0].status === 'completed') {
        await loadEngagements(jobs[0].id)
      }
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const filteredEngagements = engagements.filter(
    (e) => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort engagements: profiles with images first, then those without
  const displayEngagements = filteredEngagements.sort((a, b) => {
    const aHasImage = a.profile_image_url && a.profile_image_url.trim() !== ''
    const bHasImage = b.profile_image_url && b.profile_image_url.trim() !== ''
    
    if (aHasImage && !bHasImage) return -1
    if (!aHasImage && bHasImage) return 1
    return 0
  })

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 px-10 py-4 bg-white">
        <div className="flex items-center gap-3 text-gray-900">
          <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path className="text-primary-500" d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
          </svg>
          <h2 className="text-gray-900 text-xl font-bold">EngageTracker</h2>
        </div>
        
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <a className="hover:text-gray-900 transition-colors" href="/">Home</a>
          <a className="text-primary-600 font-semibold transition-colors" href="/dashboard">Dashboard</a>
          <a className="hover:text-gray-900 transition-colors" href="#">Analytics</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined text-2xl">notifications</span>
          </button>
          <div className="relative group">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer bg-gradient-to-r from-blue-400 to-cyan-400" />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 py-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">
              Engagement Dashboard
            </h1>
            <p className="text-gray-500">Track and analyze the engagement across your LinkedIn posts.</p>
          </div>

          {currentJob && currentJob.status === 'processing' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                <span className="text-blue-800">Scraping LinkedIn post data... This may take a few moments.</span>
              </div>
            </div>
          )}

          {currentJob && currentJob.status === 'failed' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Failed to scrape data</p>
                  <p className="text-sm text-red-700 mt-1">{currentJob.error_message}</p>
                  <button 
                    onClick={() => {
                      window.location.href = '/'
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Retry Scraping
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input
                  className="w-full rounded-md border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Search engagers..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {displayEngagements.length} engagements found
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            {displayEngagements.length === 0 && !isLoading ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-4 text-lg font-medium text-gray-900">No engagement data yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  {currentJob?.status === 'processing' 
                    ? 'Scraping in progress. Data will appear here soon...'
                    : 'Enter a LinkedIn post URL to start scraping'}
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-gray-600" colSpan={2}>User</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Title</th>
                    <th className="p-4 text-sm font-semibold text-gray-600">Headline</th>
                    <th className="p-4 text-sm font-semibold text-gray-600 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayEngagements.map((engagement) => (
                    <tr key={engagement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 w-14">
                        {engagement.profile_image_url && engagement.profile_image_url.trim() !== '' ? (
                          <div 
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                            style={{ backgroundImage: `url(${engagement.profile_image_url})` }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-900">{engagement.name}</td>
                      <td className="p-4 text-gray-500">{engagement.title}</td>
                      <td className="p-4 text-gray-500">{engagement.headline}</td>
                      <td className="p-4 text-right">
                        <a
                          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                          href={engagement.linkedin_profile_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}