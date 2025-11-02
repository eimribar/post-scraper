'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Target,
  Settings,
  LogOut,
  Sparkles,
  BarChart3,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Engagers',
      icon: Users,
      href: '/engagers',
      active: pathname === '/engagers',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      active: pathname === '/analytics',
    },
  ]

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out z-50',
        isExpanded ? 'w-64' : 'w-20'
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div
              className={cn(
                'transition-all duration-300 overflow-hidden',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                EngageTracker
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      item.active
                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={cn(
                        'font-medium transition-all duration-300 overflow-hidden whitespace-nowrap',
                        isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-blue-500/30">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="bg-slate-800 text-white">
                {user?.firstName?.charAt(0) || 'U'}
                {user?.lastName?.charAt(0) || ''}
              </AvatarFallback>
            </Avatar>

            <div
              className={cn(
                'flex-1 transition-all duration-300 overflow-hidden',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div
            className={cn(
              'transition-all duration-300 overflow-hidden',
              isExpanded ? 'mt-3 opacity-100' : 'mt-0 h-0 opacity-0'
            )}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start gap-2 border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
