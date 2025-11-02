'use client'

import { AppSidebar } from './AppSidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <AppSidebar />

      {/* Main Content - offset by sidebar width */}
      <div className="ml-20 transition-all duration-300">
        {children}
      </div>
    </div>
  )
}
