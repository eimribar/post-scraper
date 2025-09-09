'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function LoadingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState('Initializing...')
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  
  const supabase = createClient()
  const postUrl = searchParams.get('url') || sessionStorage.getItem('pendingPostUrl')

  useEffect(() => {
    initializeAndScrape()
  }, [])

  useEffect(() => {
    if (jobId && !error) {
      const interval = setInterval(() => {
        pollJobStatus()
      }, 3000) // Poll every 3 seconds

      return () => clearInterval(interval)
    }
  }, [jobId, pollCount])

  const initializeAndScrape = async () => {
    try {
      // Check authentication
      setStatus('Verifying authentication...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }
      
      setUser(user)
      
      if (!postUrl) {
        // No URL to scrape, go directly to dashboard
        router.push('/dashboard')
        return
      }

      // Start scraping
      setStatus('Starting LinkedIn data extraction...')
      const response = await fetch('/api/scrape/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: postUrl }),
      })

      if (response.ok) {
        const { jobId: newJobId } = await response.json()
        setJobId(newJobId)
        setStatus('Analyzing post engagement...')
        
        // Clear the URL from sessionStorage
        sessionStorage.removeItem('pendingPostUrl')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start scraping')
        setStatus('Failed to start scraping')
      }
    } catch (err) {
      console.error('Error during initialization:', err)
      setError('An unexpected error occurred')
      setStatus('Error occurred')
    }
  }

  const pollJobStatus = async () => {
    if (!jobId) return

    try {
      const response = await fetch('/api/scrape/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.status === 'completed') {
          setStatus('Data successfully collected! Redirecting...')
          setTimeout(() => {
            router.push(`/dashboard`)
          }, 1000)
        } else if (data.status === 'failed') {
          setError(data.message || 'Scraping failed')
          setStatus('Failed to collect data')
        } else {
          // Still processing
          setPollCount(prev => prev + 1)
          
          // Update status message based on poll count
          if (pollCount < 3) {
            setStatus('Extracting engagement data...')
          } else if (pollCount < 6) {
            setStatus('Processing LinkedIn reactions...')
          } else if (pollCount < 10) {
            setStatus('Organizing engagement insights...')
          } else {
            setStatus('Almost ready...')
          }
        }
      }
    } catch (err) {
      console.error('Error polling status:', err)
    }
  }

  const handleRetry = () => {
    setError(null)
    setPollCount(0)
    initializeAndScrape()
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-gray-200 px-10 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3 text-gray-900">
          <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path className="text-primary-500" d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor" />
          </svg>
          <h2 className="text-gray-900 text-xl font-bold">EngageTracker</h2>
        </div>
        
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Welcome back!</span>
            <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full size-10" />
          </div>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center py-12">
        <div className="flex w-full max-w-md flex-col items-center justify-center p-8 text-center">
          <div className="relative mb-8 h-24 w-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-blue-300 opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              {!error ? (
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-gray-200"></div>
                  <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-800 mb-3">
            {error ? 'Something went wrong' : 'Gathering insights...'}
          </h1>
          
          <p className="text-base text-gray-600 mb-2">
            {status}
          </p>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left w-full">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!error && (
            <div className="mt-8 w-full">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="absolute top-0 h-full w-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]"></div>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                This typically takes 10-30 seconds depending on the post engagement.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
              >
                Try Again
              </button>
              <button
                onClick={handleGoToDashboard}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}