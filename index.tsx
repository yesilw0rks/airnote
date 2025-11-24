import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';
import { NoteEditor } from './components/NoteEditor';
import { Note, ViewMode } from './lib/types';
import { ShieldAlert } from 'lucide-react';

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [spaces, setSpaces] = useState<string[]>(['General', 'Personal', 'Work']);
  const [currentSpace, setCurrentSpace] = useState('All Notes');
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchNotes = async () => {
    setRefreshing(true);
    
    // Determine the ID to fetch: Real User ID or the shared 'guest-user' ID
    const targetUserId = session?.user?.id || 'guest-user';

    try {
      // Always try Supabase first, even for Guest (to enable syncing with extension)
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', targetUserId) // Fetch notes for this user (or guest)
        .order('updated_at', { ascending: false });
      
      if (currentSpace !== 'All Notes') {
        query = query.eq('space', currentSpace);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        setNotes(data);
      }

    } catch (error) {
      console.warn('Supabase fetch failed, falling back to local storage.', error);
      // Local Storage Fallback (Offline Mode)
      const localNotes = JSON.parse(localStorage.getItem('airnote_notes') || '[]');
      
      let filtered = localNotes;
      if (currentSpace !== 'All Notes') {
        filtered = localNotes.filter((n: Note) => n.space === currentSpace);
      }
      setNotes(filtered);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    // Use real ID or 'guest-user' so it matches what the extension sends
    const userId = session?.user?.id || 'guest-user';

    const newNote = {
      ...noteData,
      updated_at: new Date().toISOString(),
      user_id: userId,
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
    
    // Save to LocalStorage (Backup)
    const allLocalNotes = JSON.parse(localStorage.getItem('airnote_notes') || '[]');
    const updatedLocal = allLocalNotes.some((n: Note) => n.id === newNote.id)
      ? allLocalNotes.map((n: Note) => n.id === newNote.id ? newNote : n)
      : [newNote, ...allLocalNotes];
    localStorage.setItem('airnote_notes', JSON.stringify(updatedLocal));

    // Push to Supabase (Even for Guest, to allow syncing)
    const { error } = await supabase.from('notes').upsert(newNote);
    if (error) console.error('Supabase save error:', error);

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
    return <div className="h-screen w-full bg-air-bg flex items-center justify-center text-air-accent animate-pulse">Loading AirNote...</div>;
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
        {isGuest && (
          <div className="bg-gradient-to-r from-air-surface to-air-bg text-air-muted text-xs px-4 py-2 flex items-center justify-center border-b border-air-border shadow-sm backdrop-blur-md sticky top-0 z-50">
            <ShieldAlert size={14} className="mr-2 text-air-accent" />
            <span className="font-medium text-white">Guest Sync Mode</span>
            <span className="hidden sm:inline mx-2 opacity-50">|</span>
            <span className="opacity-80">You are viewing the shared Guest notebook. Notes from the extension will appear here.</span>
          </div>
        )}

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
            onRefresh={fetchNotes}
            isRefreshing={refreshing}
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