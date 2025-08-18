// DASHBOARD LAYOUT - Main IDE-style layout wrapper with activity bar, sidebar, and terminal
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/DashboardLayout.tsx

'use client'

import { FC, useState } from 'react'
import { ActivityBar } from './ActivityBar'
import { Sidebar } from './Sidebar'
import { Dashboard } from './Dashboard'
import { Terminal } from './Terminal'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const [activeView, setActiveView] = useState('explorer')
  const [sidebarWidth, setSidebarWidth] = useState(240)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [terminalHeight, setTerminalHeight] = useState(300)

  return (
    <div 
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#1e1e1e' }}
    >
      {/* Activity Bar */}
      <ActivityBar 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />

      {/* Sidebar */}
      <Sidebar 
        activeView={activeView}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Dashboard */}
        <div className={`flex-1 ${isTerminalOpen ? 'pb-0' : ''}`}>
          {children || <Dashboard />}
        </div>

        {/* Terminal */}
        <Terminal 
          isOpen={isTerminalOpen}
          height={terminalHeight}
          onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
          onHeightChange={setTerminalHeight}
        />
      </div>
    </div>
  )
}
