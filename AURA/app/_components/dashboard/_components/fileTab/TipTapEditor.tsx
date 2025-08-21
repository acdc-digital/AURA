// TIPTAP EDITOR - Rich text markdown editor with real-time sync
// /Users/matthewsimon/Projects/AURA/AURA/app/_components/dashboard/_components/fileTab/TipTapEditor.tsx

"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';

interface TipTapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
}

export function TipTapEditor({
  content,
  onContentChange,
  isReadOnly = false,
  placeholder = "Start writing your markdown content..."
}: TipTapEditorProps) {
  
  const editor = useEditor({
    immediatelyRender: false,  // Prevent SSR hydration mismatches
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#007acc] hover:text-[#1890ff] underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      const markdown = editor.getHTML();
      onContentChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-invert max-w-none focus:outline-none p-4 min-h-[500px]',
        'data-placeholder': placeholder,
      },
    },
  });

  // Update editor content when prop changes (but not while user is typing)
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      // Only update if editor doesn't have focus (user isn't actively typing)
      if (!editor.isFocused) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="p-4 text-[#858585]">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc]">
      {/* Toolbar */}
      <div className="border-b border-[#454545] p-2 flex items-center gap-2 bg-[#252526]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              editor.isActive('bold') 
                ? 'bg-[#007acc] text-white' 
                : 'hover:bg-[#3d3d3d] text-[#cccccc]'
            }`}
            disabled={isReadOnly}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              editor.isActive('italic') 
                ? 'bg-[#007acc] text-white' 
                : 'hover:bg-[#3d3d3d] text-[#cccccc]'
            }`}
            disabled={isReadOnly}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 text-xs rounded transition-colors font-mono ${
              editor.isActive('code') 
                ? 'bg-[#007acc] text-white' 
                : 'hover:bg-[#3d3d3d] text-[#cccccc]'
            }`}
            disabled={isReadOnly}
          >
            {'</>'}
          </button>
        </div>
        
        <div className="w-px h-4 bg-[#454545] mx-1" />
        
        <div className="flex items-center gap-1">
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                editor.isActive('heading', { level }) 
                  ? 'bg-[#007acc] text-white' 
                  : 'hover:bg-[#3d3d3d] text-[#cccccc]'
              }`}
              disabled={isReadOnly}
            >
              H{level}
            </button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <div className="text-xs text-[#858585] flex items-center gap-2">
          <span>
            {editor.storage.characterCount?.characters() || 0} chars
          </span>
          <span>•</span>
          <span>
            {editor.storage.characterCount?.words() || 0} words
          </span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <EditorContent 
          editor={editor} 
          className="h-full prose-headings:text-[#cccccc] prose-p:text-[#cccccc] prose-strong:text-[#cccccc] prose-code:text-[#d4d4d4] prose-code:bg-[#3d3d3d] prose-blockquote:border-l-[#007acc] prose-blockquote:text-[#cccccc] prose-li:text-[#cccccc]"
        />
      </div>
    </div>
  );
}
