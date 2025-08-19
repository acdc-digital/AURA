"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTokenManagement } from '@/lib/hooks/useTokenManagement';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    DollarSign,
    Info,
    MessageSquare,
    RotateCcw,
    Zap
} from 'lucide-react';

interface TokenUsageDisplayProps {
  sessionId: string;
  userId?: string;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

export function TokenUsageDisplay({ 
  sessionId, 
  userId, 
  className,
  compact = false,
  showActions = true
}: TokenUsageDisplayProps) {
  const { 
    tokenUsage, 
    limits, 
    isLoading, 
    initializeSession, 
    endSession 
  } = useTokenManagement(sessionId, userId);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading token usage...
      </div>
    );
  }

  if (!tokenUsage) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => initializeSession()}
          className="text-xs"
        >
          Initialize Session
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'destructive';
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'safe': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <AlertTriangle className="w-3 h-3" />;
      case 'critical': return <AlertTriangle className="w-3 h-3" />;
      case 'warning': return <Info className="w-3 h-3" />;
      case 'safe': return <Zap className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  if (compact) {
    return (
      <div 
        className={cn("flex items-center gap-2 text-xs", className)}
        title={`${tokenUsage.status.message} - Tokens: ${tokenUsage.formattedTokens} / ${tokenUsage.maxTokens.toLocaleString()} - Cost: ${tokenUsage.formattedCost} - Messages: ${tokenUsage.messageCount}`}
      >
        <Badge variant={getStatusColor(tokenUsage.status.status)} className="text-xs">
          {getStatusIcon(tokenUsage.status.status)}
          {tokenUsage.percentUsed}%
        </Badge>
        <span className="text-muted-foreground">
          {tokenUsage.formattedTokens}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3 p-4 rounded-lg border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Token Usage</h3>
          <Badge variant={getStatusColor(tokenUsage.status.status)} className="text-xs">
            {getStatusIcon(tokenUsage.status.status)}
            {tokenUsage.status.status.toUpperCase()}
          </Badge>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => endSession()}
              className="h-6 w-6 p-0"
              title="Start new conversation"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Token Usage</span>
          <span>{tokenUsage.formattedTokens} / {tokenUsage.maxTokens.toLocaleString()}</span>
        </div>
        <div className="relative">
          <Progress 
            value={tokenUsage.percentUsed} 
            className={cn(
              "h-2",
              tokenUsage.status.status === 'exceeded' && "[&>div]:bg-destructive",
              tokenUsage.status.status === 'critical' && "[&>div]:bg-destructive", 
              tokenUsage.status.status === 'warning' && "[&>div]:bg-yellow-500",
              tokenUsage.status.status === 'safe' && "[&>div]:bg-primary"
            )}
          />
        </div>
      </div>

      {/* Status Message */}
      <p className="text-xs text-muted-foreground">
        {tokenUsage.status.message}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="font-medium">{tokenUsage.inputTokens.toLocaleString()}</p>
            <p className="text-muted-foreground">Input</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="font-medium">{tokenUsage.outputTokens.toLocaleString()}</p>
            <p className="text-muted-foreground">Output</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <div>
            <p className="font-medium">{tokenUsage.messageCount}</p>
            <p className="text-muted-foreground">Messages</p>
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="w-3 h-3" />
          <span>Est. Cost</span>
        </div>
        <span className="text-xs font-medium">{tokenUsage.formattedCost}</span>
      </div>

      {/* Warning if near limit */}
      {(tokenUsage.status.status === 'critical' || tokenUsage.status.status === 'exceeded') && (
        <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-destructive">Action Required</p>
            <p className="text-muted-foreground">
              {tokenUsage.status.status === 'exceeded' 
                ? "This conversation has reached its token limit. Please start a new conversation."
                : "This conversation is approaching its token limit. Consider starting a new conversation soon to avoid interruption."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact token usage indicator for headers/status bars
 */
export function TokenUsageIndicator({ sessionId, userId, className }: TokenUsageDisplayProps) {
  return (
    <TokenUsageDisplay 
      sessionId={sessionId}
      userId={userId}
      className={className}
      compact={true}
      showActions={false}
    />
  );
}
