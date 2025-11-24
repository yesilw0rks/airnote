import React from 'react';
import { Note } from '../lib/types';
import { ArrowLeft, Calendar, Clock, Edit2, Tag } from 'lucide-react';
import { parseAirNoteContent } from '../utils/parser';

interface NoteDetailProps {
  note: Note;
  onBack: () => void;
  onEdit: () => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onBack, onEdit }) => {
  const contentHtml = parseAirNoteContent(note.content);

  return (
    <div className="h-full flex flex-col bg-air-bg">
      {/* Header */}
      <div className="p-6 border-b border-air-border flex justify-between items-center bg-air-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-air-border rounded-lg text-air-muted hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{note.title || 'Untitled Note'}</h2>
            <div className="flex items-center gap-3 text-xs text-air-muted mt-1">
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(note.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(note.updated_at).toLocaleTimeString()}</span>
              <span className="bg-air-accent/10 text-air-accent px-2 py-0.5 rounded-full">
                {note.space || 'General'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onEdit}
          className="flex items-center gap-2 bg-air-border hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Edit2 size={16} />
          Edit Note
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-air-accent">
          <div 
            className="text-lg leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: contentHtml }} 
          />
        </div>

        {/* Tags Section */}
        {note.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-air-border">
            <div className="flex items-center gap-2 mb-3 text-sm text-air-muted font-medium">
              <Tag size={16} />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="bg-air-surface border border-air-border px-3 py-1 rounded-full text-sm text-air-muted hover:text-white hover:border-air-accent/50 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
