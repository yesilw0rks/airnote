import React, { useState, useEffect } from 'react';
import { Note } from '../lib/types';
import { Save, X, Hash, Type, Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import { parseAirNoteContent } from '../utils/parser';

interface NoteEditorProps {
  initialNote?: Partial<Note>;
  space: string;
  onSave: (note: Partial<Note>) => Promise<void>;
  onCancel: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, space, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    await onSave({
      ...initialNote,
      title,
      content,
      tags,
      space: initialNote?.space || space
    });
    setSaving(false);
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const insertFormat = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setContent(newText);
    
    // Reset focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="h-full flex flex-col bg-air-bg">
      {/* Toolbar */}
      <div className="p-4 border-b border-air-border flex justify-between items-center bg-air-surface">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-2 hover:bg-air-border rounded-lg text-air-muted">
            <X size={20} />
          </button>
          <span className="text-sm font-medium text-air-muted">{initialNote?.id ? 'Edit Note' : 'New Note'}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-air-accent hover:bg-air-accentHover text-black font-medium px-6 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save</>}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Side */}
        <div className="flex-1 flex flex-col border-r border-air-border p-6 overflow-y-auto">
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-3xl font-bold text-white placeholder-air-border outline-none mb-6 w-full"
          />
          
          {/* Formatting Toolbar */}
          <div className="flex gap-2 mb-4 p-2 bg-air-surface rounded-lg border border-air-border w-fit">
            <button onClick={() => insertFormat('## ', '')} title="Header" className="p-1.5 hover:bg-air-border rounded text-air-muted hover:text-white"><Hash size={16} /></button>
            <button onClick={() => insertFormat('**', '**')} title="Bold" className="p-1.5 hover:bg-air-border rounded text-air-muted hover:text-white"><Bold size={16} /></button>
            <button onClick={() => insertFormat('*', '*')} title="Italic" className="p-1.5 hover:bg-air-border rounded text-air-muted hover:text-white"><Italic size={16} /></button>
            <button onClick={() => insertFormat('-', '-')} title="Strikethrough" className="p-1.5 hover:bg-air-border rounded text-air-muted hover:text-white"><Strikethrough size={16} /></button>
            <button onClick={() => insertFormat('_', '_')} title="Underline" className="p-1.5 hover:bg-air-border rounded text-air-muted hover:text-white"><Underline size={16} /></button>
          </div>

          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... use ## for headers, **bold**, *italics*, -strikethrough-, _underline_"
            className="flex-1 bg-transparent text-air-text placeholder-air-border outline-none resize-none font-mono leading-relaxed"
          />

          <div className="mt-4 pt-4 border-t border-air-border">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span key={tag} className="bg-air-accent/10 text-air-accent px-2 py-1 rounded flex items-center gap-1 text-xs">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={10} /></button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              className="bg-transparent text-sm text-air-muted placeholder-air-border outline-none w-full"
            />
          </div>
        </div>

        {/* Preview Side (Hidden on mobile) */}
        <div className="hidden lg:block flex-1 p-8 bg-air-surface/30 overflow-y-auto">
          <div className="prose prose-invert max-w-none opacity-80 pointer-events-none">
            <h1 className="text-3xl font-bold mb-4">{title || 'Untitled'}</h1>
            <div dangerouslySetInnerHTML={{ __html: parseAirNoteContent(content) || '<p class="text-air-muted italic">Preview...</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
