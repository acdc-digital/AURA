// SIDEBAR COMPONENT - Context-sensitive panel with collapsible sections
// /Users/matthewsimon/Projects/AURA/AURA/components/dashboard/Sidebar.tsx

'use client'

import { FC, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, Folder, FileText, Table, Code } from 'lucide-react'

interface SidebarProps {
  activeView: string
  width?: number
  onWidthChange?: (width: number) => void
}

interface SidebarSection {
  id: string
  title: string
  items: SidebarItem[]
  defaultExpanded?: boolean
}

interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  children?: SidebarItem[]
  onClick?: () => void
}

export const Sidebar: FC<SidebarProps> = ({ 
  activeView, 
  width = 240,
  onWidthChange 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['files', 'database', 'debug'])
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getSidebarContent = () => {
    switch (activeView) {
      case 'explorer':
        return {
          title: 'EXPLORER',
          sections: [
            {
              id: 'files',
              title: 'FILES',
              defaultExpanded: true,
              items: [
                { id: 'src', label: 'src', icon: <Folder className="w-4 h-4" />, children: [
                  { id: 'components', label: 'components', icon: <Folder className="w-4 h-4" /> },
                  { id: 'pages', label: 'pages', icon: <Folder className="w-4 h-4" /> },
                  { id: 'utils', label: 'utils', icon: <Folder className="w-4 h-4" /> },
                ]},
                { id: 'package.json', label: 'package.json', icon: <FileText className="w-4 h-4" /> },
                { id: 'tsconfig.json', label: 'tsconfig.json', icon: <FileText className="w-4 h-4" /> },
              ]
            }
          ]
        }
      case 'database':
        return {
          title: 'DATABASE',
          sections: [
            {
              id: 'tables',
              title: 'TABLES',
              defaultExpanded: true,
              items: [
                { id: 'users', label: 'users', icon: <Table className="w-4 h-4" /> },
                { id: 'projects', label: 'projects', icon: <Table className="w-4 h-4" /> },
                { id: 'tasks', label: 'tasks', icon: <Table className="w-4 h-4" /> },
              ]
            },
            {
              id: 'queries',
              title: 'QUERIES',
              defaultExpanded: true,
              items: [
                { id: 'getUsers', label: 'getUsers', icon: <Code className="w-4 h-4" /> },
                { id: 'createProject', label: 'createProject', icon: <Code className="w-4 h-4" /> },
              ]
            }
          ]
        }
      case 'debug':
        return {
          title: 'DEBUG',
          sections: [
            {
              id: 'variables',
              title: 'VARIABLES',
              defaultExpanded: true,
              items: [
                { id: 'locals', label: 'Locals', icon: <Code className="w-4 h-4" /> },
                { id: 'globals', label: 'Globals', icon: <Code className="w-4 h-4" /> },
              ]
            },
            {
              id: 'watch',
              title: 'WATCH',
              defaultExpanded: true,
              items: []
            },
            {
              id: 'callstack',
              title: 'CALL STACK',
              defaultExpanded: true,
              items: []
            }
          ]
        }
      default:
        return {
          title: activeView.toUpperCase(),
          sections: []
        }
    }
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => (
    <div key={item.id} className={cn("select-none", level > 0 && "ml-4")}>
      <button
        onClick={item.onClick}
        className={cn(
          "flex items-center gap-2 w-full px-2 py-1 text-left rounded-sm transition-colors",
          "hover:bg-[#2a2d2e] text-[#cccccc] hover:text-white text-sm"
        )}
      >
        {item.icon}
        <span className="truncate">{item.label}</span>
      </button>
      {item.children && (
        <div className="ml-2">
          {item.children.map(child => renderSidebarItem(child, level + 1))}
        </div>
      )}
    </div>
  )

  const renderSection = (section: SidebarSection) => {
    const isExpanded = expandedSections.has(section.id)
    
    return (
      <div key={section.id} className="mb-4">
        <button
          onClick={() => toggleSection(section.id)}
          className={cn(
            "flex items-center gap-1 w-full px-2 py-1 text-left transition-colors",
            "text-[11px] uppercase font-semibold tracking-wider",
            "text-[#cccccc] hover:text-white"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          {section.title}
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {section.items.map(item => renderSidebarItem(item))}
          </div>
        )}
      </div>
    )
  }

  const content = getSidebarContent()

  return (
    <div 
      className="h-full border-r border-[#2d2d30] vscode-scrollbar overflow-auto"
      style={{ 
        width: `${width}px`, 
        backgroundColor: '#1e1e1e',
        minWidth: '180px'
      }}
    >
      {/* Header */}
      <div className="px-2 py-3 border-b border-[#2d2d30]">
        <h2 className="text-[11px] uppercase font-semibold tracking-wider text-[#cccccc]">
          {content.title}
        </h2>
      </div>

      {/* Content */}
      <div className="p-2">
        {content.sections.map(renderSection)}
      </div>

      {/* Resize Handle */}
      {onWidthChange && (
        <div 
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#007acc] transition-colors opacity-0 hover:opacity-100"
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = width

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(180, Math.min(500, startWidth + (e.clientX - startX)))
              onWidthChange(newWidth)
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}
    </div>
  )
}
