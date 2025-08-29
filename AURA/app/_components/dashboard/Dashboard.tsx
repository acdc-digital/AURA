// DASHBOARD COMPONENT - Main content area with tabbed interface
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/Dashboard.tsx

'use client'

import { FC } from 'react'
import { cn } from '@/lib/utils'
import { X, Plus, Code, Database } from 'lucide-react'
import { IdentityGuidelinesTab } from './_components/identityTab/IdentityGuidelinesTab'
import { AgentsTab } from './_components/agentsTab/AgentsTab'
import { useEditorStore } from '@/lib/store/editor'

interface DashboardProps {
  className?: string
}

export const Dashboard: FC<DashboardProps> = ({ className }) => {
  const { tabs, activeTabId, closeTab, setActiveTab } = useEditorStore();

  const renderTabContent = (tabType: string) => {
    switch (tabType) {
      case 'identity-guidelines':
        return <IdentityGuidelinesTab />;
      case 'agent':
        return <AgentsTab />;
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
                <div className="p-6 rounded-lg bg-[#252526]">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#007acc]" />
                    Development
                  </h3>
                  <p className="text-[#cccccc] text-sm">
                    Access your files, run commands, and debug your applications with 
                    integrated tools.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-[#252526]">
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
              <div className="p-4 rounded-lg border border-[#2d2d30] bg-[#252526]">
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
              
              <div className="p-4 rounded-lg border border-[#2d2d30] bg-[#252526]">
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
        );
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <h2 className="text-[#cccccc] text-lg mb-2">No tabs open</h2>
          <p className="text-[#858585] text-sm">Open a file from the explorer to get started</p>
        </div>
      </div>
    );
  }

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Tab Bar */}
      <div className="flex items-center border-b border-[#2d2d30] min-h-[35px] bg-[#2d2d30]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-r border-[#2d2d30] cursor-pointer group transition-colors",
              activeTabId === tab.id
                ? "text-white bg-[#1e1e1e]"
                : "text-[#858585] hover:text-[#cccccc] bg-[#2d2d30]"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="text-sm">{tab.title}</span>
            {tab.isDirty && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
            {(!tab.isPinned) && (
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
      <div className="flex-1 overflow-auto vscode-scrollbar bg-[#1e1e1e]">
        {activeTab ? (
          renderTabContent(activeTab.type || 'welcome')
        ) : (
          <div className="p-6 text-center text-[#858585]">
            <p>No active tab</p>
          </div>
        )}
      </div>
    </div>
  )
}
