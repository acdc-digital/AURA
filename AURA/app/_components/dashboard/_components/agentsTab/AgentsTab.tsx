// AGENTS TAB - Agent specification cards with Pokemon-style layout
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/agentsTab/AgentsTab.tsx

'use client'

import { FC } from 'react'
import { agentRegistry } from '@/lib/agents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Crown, Zap, DollarSign, Command } from 'lucide-react'

interface AgentCardProps {
  agent: {
    id: string
    name: string
    description: string
    icon: string
    isPremium: boolean
    tools: Array<{
      command: string
      name: string
      description: string
      usage?: string
    }>
  }
}

const AgentCard: FC<AgentCardProps> = ({ agent }) => {
  // Generate pricing based on agent type
  const getAgentPricing = () => {
    if (!agent.isPremium) {
      return { price: 'Free', period: '', color: 'text-[#4ec9b0]' }
    }
    
    // Premium pricing based on agent capabilities
    switch (agent.id) {
      case 'cmo':
        return { price: '$29', period: '/month', color: 'text-[#ffd700]' }
      case 'scheduling':
        return { price: '$19', period: '/month', color: 'text-[#ffd700]' }
      default:
        return { price: '$9', period: '/month', color: 'text-[#ffd700]' }
    }
  }

  const pricing = getAgentPricing()

  return (
    <div className="relative bg-gradient-to-b from-[#2d2d30] to-[#1e1e1e] border border-[#454545] rounded-xl overflow-hidden hover:border-[#007acc]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#007acc]/10">
      {/* Premium Badge */}
      {agent.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-[#ffd700] text-[#1e1e1e] text-xs font-medium flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Premium
          </Badge>
        </div>
      )}

      {/* Main Content Area - Pokemon card style */}
      <div className="p-6">
        {/* Header with Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-3 filter drop-shadow-lg">
            {agent.icon}
          </div>
          <h3 className="text-[#cccccc] font-bold text-lg mb-2">
            {agent.name}
          </h3>
          <p className="text-[#858585] text-sm leading-relaxed">
            {agent.description}
          </p>
        </div>

        {/* Stats Section - Pokemon style */}
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-4 border border-[#2d2d2d]">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-[#4ec9b0] text-2xl font-bold">
                {agent.tools.length}
              </div>
              <div className="text-[#858585] text-xs uppercase tracking-wide">
                Tool{agent.tools.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${pricing.color}`}>
                {pricing.price}
              </div>
              <div className="text-[#858585] text-xs uppercase tracking-wide">
                {pricing.period ? pricing.period.replace('/', '') : 'Forever'}
              </div>
            </div>
          </div>
        </div>

        {/* Tools List */}
        <div className="space-y-2 mb-6">
          <h4 className="text-[#cccccc] text-sm font-medium flex items-center gap-2 mb-3">
            <Command className="w-4 h-4 text-[#4ec9b0]" />
            Available Tools
          </h4>
          {agent.tools.map((tool) => (
            <div key={tool.command} className="bg-[#252526] rounded-lg p-3 border border-[#2d2d2d]">
              <div className="flex items-center gap-2 mb-1">
                <code className="bg-[#007acc] text-white text-xs px-2 py-1 rounded font-mono">
                  {tool.command}
                </code>
                <span className="text-[#cccccc] text-sm font-medium">
                  {tool.name}
                </span>
              </div>
              <p className="text-[#858585] text-xs leading-relaxed">
                {tool.description}
              </p>
              {tool.usage && (
                <div className="mt-2 p-2 bg-[#1e1e1e] rounded border border-[#2d2d2d]">
                  <code className="text-[#4ec9b0] text-xs">
                    {tool.usage}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1 bg-[#007acc] hover:bg-[#005a9e] text-white"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Activate
          </Button>
          {agent.isPremium && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
      </div>

      {/* Bottom stripe - Pokemon card style */}
      <div className={`h-2 ${agent.isPremium ? 'bg-gradient-to-r from-[#ffd700] to-[#ffed4e]' : 'bg-gradient-to-r from-[#4ec9b0] to-[#66d9c0]'}`} />
    </div>
  )
}

export const AgentsTab: FC = () => {
  const allAgents = agentRegistry.getAllAgents()
  
  // Filter to only show core agents for now
  // Focus on Instructions Agent and one premium agent (CMO) as examples
  const coreAgents = allAgents.filter(agent => 
    agent.id === 'instructions' || agent.id === 'cmo'
  )

  // Debug: Log what we're getting
  console.log('AgentsTab - All agents:', allAgents.map(a => a.id))
  console.log('AgentsTab - Core agents:', coreAgents.map(a => a.id))
  console.log('AgentsTab - Showing:', coreAgents.length, 'of', allAgents.length)

  return (
    <div className="h-full bg-[#1e1e1e] overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            🤖 AI Agents
          </h1>
          <p className="text-[#cccccc] text-lg">
            Powerful AI agents to automate and enhance your development workflow. 
            Each agent specializes in specific tasks and can be activated individually.
          </p>
          <div className="mt-4 p-4 bg-[#252526] rounded-lg border border-[#2d2d2d]">
            <div className="flex items-center gap-2 text-[#4ec9b0] text-sm">
              <div className="w-2 h-2 bg-[#4ec9b0] rounded-full animate-pulse"></div>
              <span>Currently showing core agents - more agents will be added as they&apos;re implemented</span>
            </div>
            <div className="text-xs text-[#858585] mt-2">
              Showing {coreAgents.length} of {allAgents.length} agents
            </div>
            <div className="text-xs text-[#007acc] mt-1 font-mono">
              DEBUG: Filtered IDs: [{coreAgents.map(a => a.id).join(', ')}]
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coreAgents.map((agent) => (
            <AgentCard 
              key={agent.id} 
              agent={{
                id: agent.id,
                name: agent.name,
                description: agent.description,
                icon: agent.icon,
                isPremium: agent.isPremium,
                tools: agent.tools
              }}
            />
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4">🚀 Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Orchestrator Agent Preview */}
            <div className="bg-gradient-to-b from-[#2d2d30]/50 to-[#1e1e1e]/50 border border-[#454545]/50 rounded-xl p-6 relative">
              <div className="absolute top-3 right-3">
                <div className="bg-[#858585] text-[#1e1e1e] text-xs px-2 py-1 rounded">
                  In Development
                </div>
              </div>
              <div className="text-center opacity-60">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="text-[#cccccc] font-medium text-sm mb-1">
                  Orchestrator Agent
                </h3>
                <p className="text-[#858585] text-xs">
                  Intelligent routing and coordination of agent tasks
                </p>
              </div>
            </div>

            {/* Onboarding Agent Preview */}
            <div className="bg-gradient-to-b from-[#2d2d30]/50 to-[#1e1e1e]/50 border border-[#454545]/50 rounded-xl p-6 relative">
              <div className="absolute top-3 right-3">
                <div className="bg-[#858585] text-[#1e1e1e] text-xs px-2 py-1 rounded">
                  In Development
                </div>
              </div>
              <div className="text-center opacity-60">
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="text-[#cccccc] font-medium text-sm mb-1">
                  Onboarding Agent
                </h3>
                <p className="text-[#858585] text-xs">
                  Guided setup and configuration assistance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {coreAgents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-[#cccccc] text-lg font-medium mb-2">
              No agents configured
            </h3>
            <p className="text-[#858585]">
              Agents will appear here when they are registered in the system.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 p-6 bg-[#252526] rounded-xl border border-[#2d2d2d]">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-[#cccccc] font-medium mb-2">
                How to Use Agents
              </h3>
              <div className="text-[#858585] text-sm space-y-2">
                <p>
                  1. <strong className="text-[#cccccc]">Activate</strong> agents you want to use by clicking the &quot;Activate&quot; button
                </p>
                <p>
                  2. <strong className="text-[#cccccc]">Open terminal</strong> and type <code className="bg-[#2d2d2d] px-1 rounded">/</code> to see available commands
                </p>
                <p>
                  3. <strong className="text-[#cccccc]">Execute commands</strong> using the agent&apos;s specific syntax and tools
                </p>
                <p>
                  4. <strong className="text-[#cccccc]">Premium features</strong> require upgrading to unlock advanced capabilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
