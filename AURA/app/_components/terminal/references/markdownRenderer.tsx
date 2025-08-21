// Terminal Markdown Renderer
// /Users/matthewsimon/Projects/eac/eac/app/_components/terminal/_components/markdownRenderer.tsx

import React from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Custom components for terminal-style rendering
  const components: Components = {
    // Headers with emoji support
    h1: ({ children }) => (
      <div className="text-[#569cd6] font-bold text-sm mb-2 mt-3 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    h2: ({ children }) => (
      <div className="text-[#569cd6] font-bold text-xs mb-2 mt-2 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    h3: ({ children }) => (
      <div className="text-[#4ec9b0] font-medium text-xs mb-1 mt-2 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    h4: ({ children }) => (
      <div className="text-[#4ec9b0] text-xs mb-1 mt-1 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    h5: ({ children }) => (
      <div className="text-[#cccccc] text-xs mb-1 mt-1 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    h6: ({ children }) => (
      <div className="text-[#cccccc] text-xs mb-1 mt-1 first:mt-0 flex items-center gap-1">{children}</div>
    ),
    
    // Paragraphs with special handling for agent responses
    p: ({ children }) => {
      // Convert children to string to check for agent prefixes
      const textContent = React.Children.toArray(children).join('');
      
      // Special styling for agent response headers
      if (typeof textContent === 'string' && textContent.startsWith('🤖 **') && textContent.includes('Agent Result:**')) {
        return (
          <div className="text-[#4ec9b0] text-xs mb-2 font-medium border-b border-[#2d2d2d] pb-1">
            {children}
          </div>
        );
      }
      
      return (
        <div className="text-[#cccccc] text-xs mb-2 leading-relaxed">{children}</div>
      );
    },
    
    // Lists
    ul: ({ children }) => (
      <ul className="text-[#cccccc] text-xs mb-2 ml-3 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="text-[#cccccc] text-xs mb-2 ml-3 space-y-1 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-[#cccccc] text-xs">{children}</li>
    ),
    
    // Code
    code: ({ children, className }) => {
      // Check if it's inline code by looking for language class
      const isInline = !className || !className.includes('language-');
      
      if (isInline) {
        return (
          <span className="bg-[#1e1e1e] text-[#ce9178] px-1 py-0.5 rounded text-xs font-mono">
            {children}
          </span>
        );
      }
      return (
        <pre className="bg-[#1e1e1e] text-[#ce9178] p-3 rounded text-xs font-mono overflow-x-auto mb-2 border border-[#2d2d2d]">
          <code>{children}</code>
        </pre>
      );
    },
    
    // Block quotes
    blockquote: ({ children }) => (
      <div className="border-l-2 border-[#569cd6] pl-3 ml-2 text-[#cccccc] text-xs mb-2 italic">
        {children}
      </div>
    ),
    
    // Emphasis
    strong: ({ children }) => (
      <span className="text-[#569cd6] font-bold">{children}</span>
    ),
    em: ({ children }) => (
      <span className="text-[#4ec9b0] italic">{children}</span>
    ),
    
    // Images - handle empty src attributes
    img: ({ src, alt, title }) => {
      if (!src || (typeof src === 'string' && src.trim() === '')) {
        return null; // Don't render if src is empty
      }
      return (
        <img 
          src={src as string} 
          alt={alt || ''} 
          title={title}
          className="max-w-full h-auto my-2 rounded border border-[#2d2d2d]"
        />
      );
    },
    
    // Links
    a: ({ href, children }) => (
      <span className="text-[#007acc] underline hover:text-[#4fc1ff] cursor-pointer">
        {children}
      </span>
    ),
    
    // Horizontal rule
    hr: () => (
      <div className="border-t border-[#2d2d2d] my-3"></div>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full border-collapse border border-[#2d2d2d] text-xs">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-[#1e1e1e]">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-[#2d2d2d]">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border border-[#2d2d2d] px-2 py-1 text-left text-[#569cd6] font-medium">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-[#2d2d2d] px-2 py-1 text-[#cccccc]">
        {children}
      </td>
    ),
  };

  return (
    <div className={`markdown-terminal ${className}`}>
      <ReactMarkdown components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
