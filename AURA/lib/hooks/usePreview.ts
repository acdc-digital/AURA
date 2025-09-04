// PREVIEW AGENT HOOK - React hook for brand preview functionality
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/usePreview.ts

import { useState } from 'react';
import { useAgentStore } from '@/lib/agents';
import { PreviewAgent } from '@/lib/agents/previewAgent';

export function usePreview() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async (guidelinesId: string) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const previewAgent = new PreviewAgent();
      const tool = previewAgent.tools.find(t => t.command === 'generate-brand-preview');
      
      if (!tool) {
        throw new Error('Preview tool not found');
      }

      const result = await previewAgent.execute(
        tool,
        `--guidelines-id ${guidelinesId}`,
        {} as any, // mutations placeholder
        { userId: 'current-user' } // context placeholder
      );

      if (result.success) {
        setPreviewData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePreview,
    isGenerating,
    previewData,
    error,
    clearPreview: () => setPreviewData(null)
  };
}
