
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteDetail } from './components/NoteDetail';
import { NoteEditor } from './components/NoteEditor';
import { Note, ViewMode } from './lib/types';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const App = () => {
  // We now track 'userId' directly instead of just session
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [spaces, setSpaces] = useState<string[]>(['General', 'Personal', 'Work']);
  const [currentSpace, setCurrentSpace] = useState('All Notes');
  const [refreshing, setRefreshing] = useState(false);

  // Auth & Session Check
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // 1. Check for Magic ID (Local)
    const localId = localStorage.getItem('airnote_user_id');
    if (localId) {
      setUserId(localId);
      setLoading(false);
      return;
    }

    // 2. Check for Real Supabase Session (Fallback)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
    
    setLoading(false);
  };

  // Fetch Notes
  useEffect(() => {
    if (userId) {
      fetchNotes();
      // Auto-poll for sync
      const intervalId = setInterval(() => {
        if (viewMode === 'list') fetchNotes(true);
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [userId, currentSpace]);

  const fetchNotes = async (silent = false) => {
    if (!silent) setRefreshing(true);
    if (!userId) return;

    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (currentSpace !== 'All Notes') {
        query = query.eq('space', currentSpace);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setNotes(data);

    } catch (error) {
      if (!silent) console.warn('Sync failed', error);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!userId) return;

    const newNote = {
      ...noteData,
      updated_at: new Date().toISOString(),
      user_id: userId,
    } as Note;

    if (!newNote.id) {
      newNote.id = crypto.randomUUID();
      newNote.created_at = new Date().toISOString();
    }

    // Optimistic UI Update
    const updatedNotes = notes.some(n => n.id === newNote.id)
      ? notes.map(n => n.id === newNote.id ? newNote : n)
      : [newNote, ...notes];
    
    setNotes(updatedNotes);
    
    // Save to Cloud
    await supabase.from('notes').upsert(newNote);
    
    setViewMode('list');
    setSelectedNote(null);
  };

  const handleAddSpace = () => {
    const name = prompt('Enter new space name:');
    if (name && !spaces.includes(name)) setSpaces([...spaces, name]);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('airnote_user_id');
    await supabase.auth.signOut();
    setUserId(null);
  };

  if (loading) return <div className="h-screen w-full bg-air-bg flex items-center justify-center text-air-accent animate-pulse">Loading AirNote...</div>;

  if (!userId) return <Auth onGuestLogin={checkSession} />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-air-bg text-air-text font-sans">
      <Sidebar 
        spaces={spaces}
        currentSpace={currentSpace}
        onSelectSpace={setCurrentSpace}
        onAddSpace={handleAddSpace}
        onSignOut={handleSignOut}
        user={{ id: userId }} // Pass the Magic ID as the user
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        <div className="bg-air-surface border-b border-air-border text-air-muted text-xs px-4 py-2 flex items-center justify-between backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center">
              <ShieldCheck size={14} className="mr-2 text-air-accent" />
              <span className="font-medium text-white">Magic Sync Active</span>
            </div>
            <button onClick={() => fetchNotes()} className="hover:text-white flex items-center gap-1 transition-colors">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Sync
            </button>
        </div>

        {viewMode === 'list' && (
          <NoteList 
            notes={notes} 
            onSelectNote={(note) => { setSelectedNote(note); setViewMode('detail'); }}
            onCreateNote={() => { setSelectedNote(null); setViewMode('create'); }}
            onRefresh={() => fetchNotes()}
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
            onCancel={() => viewMode === 'create' ? setViewMode('list') : setViewMode('detail')}
          />
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
