
const SUPABASE_URL = 'https://nnckqafklmlfiwfdjrsw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY2txYWZrbG1sZml3ZmRqcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzI0NTMsImV4cCI6MjA3OTIwODQ1M30.Ov2vl_7tOHDaalVirnQ__DudbrEjK8weS6Dh2C5-3JU';

document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const connectBtn = document.getElementById('connect-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const saveBtn = document.getElementById('save-btn');
  const userIdInput = document.getElementById('user-id-input');
  const statusMsg = document.getElementById('status-msg');

  let currentUserId = null;

  // Check if connected
  chrome.storage.local.get(['airnote_user_id'], (result) => {
    if (result.airnote_user_id) {
      currentUserId = result.airnote_user_id;
      showApp();
    } else {
      showAuth();
    }
  });

  // Connect Logic
  connectBtn.addEventListener('click', () => {
    const id = userIdInput.value.trim();
    if (!id) return alert("Please enter a User ID");
    
    // Save ID
    chrome.storage.local.set({ airnote_user_id: id }, () => {
      currentUserId = id;
      showApp();
    });
  });

  // Disconnect Logic
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove('airnote_user_id', () => {
      currentUserId = null;
      showAuth();
    });
  });

  // Save Logic
  saveBtn.addEventListener('click', async () => {
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    if (!content.trim() && !title.trim()) return;

    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      const newNote = {
        title: title,
        content: content,
        space: 'General',
        tags: ['extension'],
        user_id: currentUserId || 'guest-user', // Use the Real ID
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(newNote)
      });

      if (!response.ok) throw new Error('Sync failed');

      document.getElementById('note-title').value = '';
      document.getElementById('note-content').value = '';
      statusMsg.textContent = 'Saved to cloud!';
      statusMsg.style.color = '#38bdf8';
      setTimeout(() => { statusMsg.textContent = 'Ready'; statusMsg.style.color = '#a1a1aa'; }, 2000);
    } catch (error) {
      console.error(error);
      statusMsg.textContent = 'Error saving';
      statusMsg.style.color = '#ef4444';
    } finally {
      saveBtn.textContent = 'Save Note';
      saveBtn.disabled = false;
    }
  });

  function showAuth() {
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
    userIdInput.value = 'guest-user'; // Default suggestion
  }

  function showApp() {
    authView.classList.add('hidden');
    appView.style.display = 'flex';
    appView.classList.remove('hidden');
  }
});
