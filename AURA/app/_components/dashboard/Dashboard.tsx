// DASHBOARD COMPONENT - Main content area with tabbed interface
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/Dashboard.tsx

'use client'

import { FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, Plus, Code, FileText, Database } from 'lucide-react'

interface DashboardProps {
  className?: string
}

interface Tab {
  id: string
  title: string
  content: string
  icon: React.ReactNode
  isDirty?: boolean
  canClose?: boolean
}

export const Dashboard: FC<DashboardProps> = ({ className }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'welcome',
      title: 'Welcome',
      content: 'welcome',
      icon: <FileText className="w-4 h-4" />,
      canClose: false
    },
    {
      id: 'database',
      title: 'Database',
      content: 'database',
      icon: <Database className="w-4 h-4" />,
      canClose: true
    }
  ])
  
  const [activeTabId, setActiveTabId] = useState('welcome')

  const closeTab = (tabId: string) => {
    setTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter(tab => tab.id !== tabId)
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[remainingTabs.length - 1].id)
      }
    }
  }

  const renderTabContent = (contentType: string) => {
    switch (contentType) {
      case 'welcome':
        return (
          <div className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to AURA
              </h1>
              <p className="text-[#cccccc] text-lg mb-8">
                Your AI-powered development environment is ready. Start exploring the features 
                using the activity bar on the left.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#252526' }}>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#007acc]" />
                    Development
                  </h3>
                  <p className="text-[#cccccc] text-sm">
                    Access your files, run commands, and debug your applications with 
                    integrated tools.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg" style={{ backgroundColor: '#252526' }}>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#007acc]" />
                    Database
                  </h3>
                  <p className="text-[#cccccc] text-sm">
                    Manage your Convex database, run queries, and monitor your data 
                    in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      case 'database':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Database Explorer</h2>
              <p className="text-[#cccccc]">Manage your Convex database tables and queries</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg border border-[#2d2d30]" style={{ backgroundColor: '#252526' }}>
                <h3 className="text-white font-semibold mb-3">Tables</h3>
                <div className="space-y-2">
                  {['users', 'projects', 'tasks', 'files'].map((table) => (
                    <div key={table} className="flex items-center justify-between p-2 rounded hover:bg-[#2a2d2e] transition-colors">
                      <span className="text-[#cccccc] flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {table}
                      </span>
                      <span className="text-[#858585] text-sm">
                        {Math.floor(Math.random() * 100)} records
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-[#2d2d30]" style={{ backgroundColor: '#252526' }}>
                <h3 className="text-white font-semibold mb-3">Recent Queries</h3>
                <div className="space-y-2">
                  {[
                    'SELECT * FROM users WHERE active = true',
                    'INSERT INTO projects (name, userId) VALUES...',
                    'UPDATE tasks SET status = "completed"...',
                  ].map((query, index) => (
                    <div key={index} className="p-2 rounded hover:bg-[#2a2d2e] transition-colors">
                      <code className="text-[#ce9178] text-sm break-all">
                        {query.length > 50 ? `${query.substring(0, 50)}...` : query}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Content Area
            </h2>
            <p className="text-[#cccccc]">
              This is where your main content will be displayed.
            </p>
          </div>
        )
    }
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Tab Bar */}
      <div 
        className="flex items-center border-b border-[#2d2d30] min-h-[35px]"
        style={{ backgroundColor: '#2d2d30' }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-r border-[#2d2d30] cursor-pointer group transition-colors",
              activeTabId === tab.id 
                ? "text-white" 
                : "text-[#858585] hover:text-[#cccccc]"
            )}
            style={{ 
              backgroundColor: activeTabId === tab.id ? '#1e1e1e' : '#2d2d30'
            }}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.icon}
            <span className="text-sm">{tab.title}</span>
            {tab.isDirty && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
            {tab.canClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-[#2a2d2e] rounded p-0.5 transition-all"
                title={`Close ${tab.title}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {/* New Tab Button */}
        <button
          className="p-2 text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
          title="New Tab"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-auto vscode-scrollbar"
        style={{ backgroundColor: '#1e1e1e' }}
      >
        {activeTab && renderTabContent(activeTab.content)}
      </div>
    </div>
  )
}
