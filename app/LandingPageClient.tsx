'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPageClient() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !url.includes('linkedin.com/posts/')) {
      alert('Please enter a valid LinkedIn post URL')
      return
    }

    setIsLoading(true)
    
    // Store URL in sessionStorage to pass through auth flow
    sessionStorage.setItem('pendingPostUrl', url)
    
    // Redirect to sign in page
    router.push('/auth/signin')
  }

  return (
    <div className="bg-white">
      <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden">
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between whitespace-nowrap px-6 py-5 sm:px-10">
          <div className="flex items-center gap-3">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M20.447 20.452H20.453V13.738C20.453 10.161 19.578 7.551 15.823 7.551C14.012 7.551 12.656 8.528 12.062 9.452H12.001V7.801H8.563V20.452H12.124V14.417C12.124 12.425 12.518 10.53 14.807 10.53C17.062 10.53 17.433 12.69 17.433 14.536V20.452H20.447ZM4.646 20.452H8.207V7.801H4.646V20.452ZM6.425 3.5C5.074 3.5 3.999 4.574 3.999 5.925C3.999 7.275 5.074 8.35 6.425 8.35C7.775 8.35 8.85 7.275 8.85 5.925C8.85 4.574 7.775 3.5 6.425 3.5Z" 
                fill="currentColor"
              />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">EngageTracker</h2>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
              <a className="hover:text-gray-900" href="#">Features</a>
              <a className="hover:text-gray-900" href="#">Pricing</a>
            </nav>
            <button 
              onClick={() => router.push('/auth/signin')}
              className="flex items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
            >
              Sign In
            </button>
          </div>
        </header>
        
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 sm:text-5xl lg:text-6xl">
              Unlock Insights from Any Post
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Just paste a post URL to scrape likes and discover valuable leads. Turn engagement into opportunity, effortlessly.
            </p>
            
            <form onSubmit={handleSubmit} className="mt-12 w-full max-w-xl mx-auto">
              <div className="relative">
                <input 
                  className="form-input w-full rounded-full border-2 border-gray-200 bg-white py-4 pl-6 pr-40 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-300" 
                  placeholder="https://www.linkedin.com/posts/..." 
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute inset-y-1.5 right-1.5 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2.5 text-base font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Loading...' : 'Extract Leads'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}