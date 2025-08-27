// First, modify the Tiptap component to properly integrate with react-hook-form
// This should be in your /components/common/Tiptap.jsx file

import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { 
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, 
  AlignCenter, AlignRight, List, ListOrdered, Link as LinkIcon,
  Heading1, Heading2, Heading3
} from 'lucide-react';

// Toolbar Button component
const ToolbarButton = ({ icon, isActive, onClick }) => (
  <button 
    type="button" // Explicitly set type to button to prevent form submission
    onClick={onClick} 
    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
      isActive ? 'bg-gray-200 dark:bg-gray-700' : ''
    }`}
  >
    {icon}
  </button>
);

const Tiptap = ({ value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const editorContainerRef = useRef(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      // Send updated content to form
      const content = editor.getHTML();
      onChange(content);
    },
    autofocus: 'end',
    onFocus: () => {
      setIsFocused(true);
    },
    onBlur: () => {
      setIsFocused(false);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-p:m-0 prose-headings:mb-2 prose-headings:mt-2 max-w-none outline-none text-black',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex flex-wrap p-2 border-b bg-gray-50 dark:bg-gray-800">
        <ToolbarButton 
          icon={<Bold size={18} />} 
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton 
          icon={<Italic size={18} />} 
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton 
          icon={<UnderlineIcon size={18} />} 
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <div className="mx-2 border-r h-6"></div>
        
        <ToolbarButton 
          icon={<Heading1 size={18} />} 
          isActive={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton 
          icon={<Heading2 size={18} />} 
          isActive={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton 
          icon={<Heading3 size={18} />} 
          isActive={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <div className="mx-2 border-r h-6"></div>
        
        <ToolbarButton 
          icon={<AlignLeft size={18} />} 
          isActive={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton 
          icon={<AlignCenter size={18} />} 
          isActive={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton 
          icon={<AlignRight size={18} />} 
          isActive={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        />
        <div className="mx-2 border-r h-6"></div>
        
        <ToolbarButton 
          icon={<List size={18} />} 
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton 
          icon={<ListOrdered size={18} />} 
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <div className="mx-2 border-r h-6"></div>
        
        <ToolbarButton 
          icon={<LinkIcon size={18} />} 
          isActive={editor.isActive('link')}
          onClick={setLink}
        />
      </div>
      
      <div 
        className="relative border cursor-text bg-white"
        style={{
          borderColor: isFocused ? 'rgb(59, 130, 246)' : 'hsl(var(--input))',
          boxShadow: isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none'
        }}
        onClick={(e) => {
          // Focus the editor when clicking anywhere in the container
          if (editor && !editor.isFocused) {
            editor.commands.focus('end');
          }
        }}
      >
        <EditorContent 
          editor={editor} 
          className="p-4 min-h-[250px] prose max-w-none outline-none text-black dark:text-white transition-colors"
        />
        
        {/* Placeholder text */}
        {!editor?.getText().trim() && !isFocused && (
          <div 
            className="absolute top-0 left-0 p-4 text-gray-400 pointer-events-none"
          >
            Type your job description here...
          </div>
        )}
      </div>
    </div>
  );
};

export default Tiptap;