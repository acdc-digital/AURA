// TERMINAL RESIZER - Draggable divider for terminal height adjustment
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/terminal/_components/TerminalResizer.tsx

"use client";

import { useCallback, useEffect, useState } from "react";

interface TerminalResizerProps {
  onHeightChange: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  currentHeight: number;
}

export function TerminalResizer({
  onHeightChange,
  minHeight = 200,
  maxHeight = 800,
  currentHeight
}: TerminalResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(currentHeight);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(currentHeight);
    e.preventDefault();
  }, [currentHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY; // Negative when dragging up (to increase height)
    const newHeight = Math.min(
      maxHeight,
      Math.max(minHeight, startHeight + deltaY)
    );
    
    onHeightChange(newHeight);
  }, [isDragging, startY, startHeight, minHeight, maxHeight, onHeightChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={`
        w-full h-1 border-t transition-colors duration-150 cursor-ns-resize
        ${isDragging 
          ? 'border-white' 
          : 'border-[#3d3d3d] hover:border-[#858585]'
        }
      `}
      onMouseDown={handleMouseDown}
    />
  );
}
