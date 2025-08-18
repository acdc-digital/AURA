// DASHBOARD LAYOUT - Main IDE-style layout wrapper with activity bar, sidebar, and terminal
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/DashboardLayout.tsx

'use client'

import { FC } from 'react'
import { Dashboard } from './Dashboard'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#1e1e1e]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {children || <Dashboard />}
      </div>
    </div>
  )
}
