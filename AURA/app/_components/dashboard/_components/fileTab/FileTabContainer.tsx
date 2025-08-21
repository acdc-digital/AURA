// FILE TAB CONTAINER - Container for individual file editing tabs
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/fileTab/FileTabContainer.tsx

"use client";

import { useEffect, useState, useCallback } from 'react';
import { TipTapEditor } from './TipTapEditor';
import { useFiles } from '@/lib/hooks';
import { Id } from '@/convex/_generated/dataModel';
import { FileText, Save, Clock, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface FileTabContainerProps {
  fileId: Id<"files">;
  fileName: string;
  filePath: string;
  onContentChange?: (content: string) => void;
}

export function FileTabContainer({
  fileId,
  fileName,
  filePath,
  onContentChange
}: FileTabContainerProps) {
  const { files, updateFile } = useFiles();
  const [content, setContent] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Find the current file
  const currentFile = files?.find(file => file._id === fileId);

  // Initialize content from file data
  useEffect(() => {
    if (currentFile) {
      // Only update content if user hasn't made modifications or if this is initial load
      if (!isModified || content === '') {
        const newContent = currentFile.content || `# ${fileName.replace(/\.md$/, '')}\n\nYour markdown content here...`;
        setContent(newContent);
        setIsModified(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFile, fileName]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsModified(true);
    setError(null);
    onContentChange?.(newContent);
  }, [onContentChange]);

  const handleSave = useCallback(async (contentToSave?: string) => {
    if (!currentFile) return;

    const saveContent = contentToSave || content;
    setIsSaving(true);
    setError(null);

    try {
      await updateFile(fileId, {
        content: saveContent,
      });
      
      setIsModified(false);
      setLastSaved(new Date());
      console.log(`Saved file: ${fileName}`);
    } catch (error) {
      console.error('Error saving file:', error);
      setError('Failed to save file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [fileId, fileName, content, updateFile, currentFile]);

  // Debounce content changes for auto-save
  const debouncedContent = useDebounce(content, 1000);

  // Auto-save when debounced content changes
  useEffect(() => {
    // Only auto-save if:
    // 1. We have debounced content
    // 2. The content has been modified by user
    // 3. We have a current file to save to
    // 4. We're not already in the middle of saving
    // 5. The debounced content is different from the current file content
    if (
      debouncedContent && 
      isModified && 
      currentFile && 
      !isSaving &&
      debouncedContent !== (currentFile.content || '')
    ) {
      console.log('Auto-saving file:', fileName);
      handleSave(debouncedContent);
    }
  }, [debouncedContent, isModified, currentFile, handleSave, isSaving, fileName]);

  const handleManualSave = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleManualSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1e1e] text-[#858585]">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#f48771]" />
          <p>File not found</p>
          <p className="text-sm mt-1">The file may have been deleted or moved.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* File Header */}
      <div className="border-b border-[#454545] bg-[#252526] px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#7db3d8]" />
            <span className="text-sm font-medium text-[#cccccc]">
              {fileName}
            </span>
            {isModified && (
              <span className="w-2 h-2 bg-[#f48771] rounded-full" />
            )}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-[#858585]">
            {error && (
              <div className="flex items-center gap-1 text-[#f48771]">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
            
            {isSaving && (
              <div className="flex items-center gap-1">
                <div className="animate-spin w-3 h-3 border border-[#858585] border-t-transparent rounded-full" />
                <span>Saving...</span>
              </div>
            )}
            
            {lastSaved && !isSaving && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Saved {lastSaved.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
            
            <button
              onClick={handleManualSave}
              disabled={!isModified || isSaving}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#3d3d3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Save (Cmd/Ctrl+S)"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
        
        <div className="text-xs text-[#858585] mt-1">
          {filePath}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <TipTapEditor
          content={content}
          onContentChange={handleContentChange}
          placeholder={`Start writing your markdown content for ${fileName}...`}
        />
      </div>
    </div>
  );
}
