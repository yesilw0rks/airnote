import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';
import { NoteEditor } from './components/NoteEditor';
import { Note, ViewMode } from './lib/types';

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [spaces, setSpaces] = useState<string[]>(['General', 'Personal', 'Work']);
  const [currentSpace, setCurrentSpace] = useState('All Notes');

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Notes (Supabase + LocalStorage Fallback)
  useEffect(() => {
    if (session || isGuest) {
      fetchNotes();
    }
  }, [session, isGuest, currentSpace]);

  const seedWelcomeNote = (currentNotes: Note[]) => {
    if (currentNotes.length === 0) {
      const welcomeNote: Note = {
        id: 'welcome-note',
        user_id: 'system',
        title: 'Welcome to AirNote',
        content: `## Getting Started\n\nWelcome to **AirNote**! This is a fast, dark-themed note-taking app.\n\n## Formatting\nYou can use special formatting here:\n\n- **Bold text** using asterisks\n- *Italic text* using single asterisks\n- -Strikethrough- using dashes\n- _Underline_ using underscores\n\n## Organization\nUse the sidebar to create **Spaces** to organize your life. Add #tags to your notes to find them easily later.`,
        tags: ['welcome', 'tutorial'],
        space: 'General',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return [welcomeNote];
    }
    return currentNotes;
  };

  const fetchNotes = async () => {
    // If Guest, strictly use LocalStorage
    if (isGuest) {
      const localNotes = JSON.parse(localStorage.getItem('airnote_notes') || '[]');
      const seededNotes = localNotes.length === 0 ? seedWelcomeNote([]) : localNotes;
      
      if (localNotes.length === 0) {
        localStorage.setItem('airnote_notes', JSON.stringify(seededNotes));
      }

      let filtered = seededNotes;
      if (currentSpace !== 'All Notes') {
        filtered = seededNotes.filter((n: Note) => n.space === currentSpace);
      }
      setNotes(filtered);
      return;
    }

    try {
      // Attempt Supabase Fetch
      let query = supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (currentSpace !== 'All Notes') {
        query = query.eq('space', currentSpace);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        if (data.length === 0 && currentSpace === 'All Notes') {
            // Optional: Seed welcome note in Supabase if empty (omitted for simplicity to avoid write permission issues on first load)
            setNotes(data); 
        } else {
            setNotes(data);
        }
      }

    } catch (error) {
      console.warn('Supabase fetch failed, falling back to local storage.');
      // Local Storage Fallback
      const localNotes = JSON.parse(localStorage.getItem('airnote_notes') || '[]');
      const seededNotes = localNotes.length === 0 ? seedWelcomeNote([]) : localNotes;
      
      let filtered = seededNotes;
      if (currentSpace !== 'All Notes') {
        filtered = seededNotes.filter((n: Note) => n.space === currentSpace);
      }
      setNotes(filtered);
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    const newNote = {
      ...noteData,
      updated_at: new Date().toISOString(),
      user_id: session?.user?.id || 'guest-user',
    } as Note;

    if (!newNote.id) {
      newNote.id = crypto.randomUUID();
      newNote.created_at = new Date().toISOString();
    }

    // Optimistic Update (Update State immediately)
    const updatedNotes = notes.some(n => n.id === newNote.id)
      ? notes.map(n => n.id === newNote.id ? newNote : n)
      : [newNote, ...notes];
    
    setNotes(updatedNotes);
    
    // Save to LocalStorage (Always do this as backup)
    const allLocalNotes = JSON.parse(localStorage.getItem('airnote_notes') || '[]');
    const updatedLocal = allLocalNotes.some((n: Note) => n.id === newNote.id)
      ? allLocalNotes.map((n: Note) => n.id === newNote.id ? newNote : n)
      : [newNote, ...allLocalNotes];
    localStorage.setItem('airnote_notes', JSON.stringify(updatedLocal));

    // Only try Supabase if we have a real session
    if (!isGuest && session) {
      const { error } = await supabase.from('notes').upsert(newNote);
      if (error) console.error('Supabase save error:', error);
    }

    setViewMode('list');
    setSelectedNote(null);
  };

  const handleAddSpace = () => {
    const name = prompt('Enter new space name:');
    if (name && !spaces.includes(name)) {
      setSpaces([...spaces, name]);
    }
  };

  const handleSignOut = async () => {
    if (isGuest) {
      setIsGuest(false);
    } else {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  if (loading) {
    return <div className="h-screen w-full bg-air-bg flex items-center justify-center text-air-accent">Loading...</div>;
  }

  if (!session && !isGuest) {
    return <Auth onGuestLogin={() => setIsGuest(true)} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-air-bg text-air-text font-sans">
      <Sidebar 
        spaces={spaces}
        currentSpace={currentSpace}
        onSelectSpace={setCurrentSpace}
        onAddSpace={handleAddSpace}
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        {viewMode === 'list' && (
          <NoteList 
            notes={notes} 
            onSelectNote={(note) => {
              setSelectedNote(note);
              setViewMode('detail');
            }}
            onCreateNote={() => {
              setSelectedNote(null);
              setViewMode('create');
            }}
          />
        )}

        {viewMode === 'detail' && selectedNote && (
          <NoteDetail 
            note={selectedNote} 
            onBack={() => setViewMode('list')}
            onEdit={() => setViewMode('edit')}
          />
        )}

        {(viewMode === 'edit' || viewMode === 'create') && (
          <NoteEditor 
            initialNote={selectedNote || {}} 
            space={currentSpace === 'All Notes' ? 'General' : currentSpace}
            onSave={handleSaveNote}
            onCancel={() => {
              if (viewMode === 'create') setViewMode('list');
              else setViewMode('detail');
            }}
          />
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);