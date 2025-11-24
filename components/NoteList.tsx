import React from 'react';
import { Note } from '../lib/types';
import { Clock, Tag } from 'lucide-react';

interface NoteListProps {
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({ notes, onSelectNote, onCreateNote }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-8 pb-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Notes</h1>
          <button
            onClick={onCreateNote}
            className="bg-air-accent hover:bg-air-accentHover text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(56,189,248,0.4)]"
          >
            New Note
          </button>
        </div>
        
        {/* Search Bar could go here */}
        <div className="h-px bg-air-border w-full mb-4"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-20 text-air-muted">
              No notes found in this space. Create one to get started.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="group bg-air-surface border border-air-border hover:border-air-accent/50 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col h-48"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-air-accent transition-colors">
                    {note.title || 'Untitled Note'}
                  </h3>
                  {note.space && (
                    <span className="text-[10px] bg-air-border px-2 py-1 rounded-full text-air-muted uppercase tracking-wider">
                      {note.space}
                    </span>
                  )}
                </div>
                
                <p className="text-air-muted text-sm line-clamp-3 mb-auto font-light opacity-80">
                  {note.content.replace(/[#*_]/g, '') || 'No additional text'}
                </p>

                <div className="mt-4 pt-3 border-t border-air-border/50 flex justify-between items-center text-xs text-air-muted">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="flex items-center gap-1 bg-air-bg px-1.5 py-0.5 rounded text-[10px]">
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                    {note.tags.length > 2 && <span>+{note.tags.length - 2}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
