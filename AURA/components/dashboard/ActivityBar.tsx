// ACTIVITY BAR COMPONENT - Left navigation sidebar for main app sections
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/ActivityBar.tsx

'use client'

import { FC } from 'react'
import { cn } from '@/lib/utils'
import { 
  Files, 
  Search, 
  GitBranch, 
  Bug, 
  Settings, 
  User,
  Database,
  Terminal
} from 'lucide-react'

interface ActivityBarProps {
  activeView: string
  onViewChange: (view: string) => void
}

interface ActivityItem {
  id: string
  icon: React.ReactNode
  label: string
}

const activityItems: ActivityItem[] = [
  { id: 'explorer', icon: <Files className="w-5 h-5" />, label: 'Explorer' },
  { id: 'search', icon: <Search className="w-5 h-5" />, label: 'Search' },
  { id: 'source', icon: <GitBranch className="w-5 h-5" />, label: 'Source Control' },
  { id: 'debug', icon: <Bug className="w-5 h-5" />, label: 'Debug' },
  { id: 'database', icon: <Database className="w-5 h-5" />, label: 'Database' },
  { id: 'terminal', icon: <Terminal className="w-5 h-5" />, label: 'Terminal' },
]

const bottomItems: ActivityItem[] = [
  { id: 'profile', icon: <User className="w-5 h-5" />, label: 'Profile' },
  { id: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
]

export const ActivityBar: FC<ActivityBarProps> = ({ 
  activeView, 
  onViewChange 
}) => {
  return (
    <div 
      className="flex flex-col w-12 h-full border-r border-[#2d2d30]"
      style={{ backgroundColor: '#181818' }}
    >
      {/* Main Navigation Items */}
      <div className="flex-1 flex flex-col py-2">
        {activityItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "relative flex items-center justify-center w-full h-12 transition-all duration-150",
              "hover:bg-[#2a2d2e] group",
              activeView === item.id 
                ? "text-white" 
                : "text-[#858585] hover:text-[#cccccc]"
            )}
            title={item.label}
          >
            {/* Active Indicator */}
            {activeView === item.id && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: '#007acc' }}
              />
            )}
            {item.icon}
          </button>
        ))}
      </div>

      {/* Bottom Items */}
      <div className="flex flex-col py-2 border-t border-[#2d2d30]">
        {bottomItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "relative flex items-center justify-center w-full h-12 transition-all duration-150",
              "hover:bg-[#2a2d2e] group",
              activeView === item.id 
                ? "text-white" 
                : "text-[#858585] hover:text-[#cccccc]"
            )}
            title={item.label}
          >
            {/* Active Indicator */}
            {activeView === item.id && (
              <div 
                className="absolute left-0 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: '#007acc' }}
              />
            )}
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
