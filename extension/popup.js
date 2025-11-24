document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const saveBtn = document.getElementById('save-btn');
  const titleInput = document.getElementById('note-title');
  const contentInput = document.getElementById('note-content');
  const statusMsg = document.getElementById('status-msg');

  // SUPABASE CONFIGURATION
  const SUPABASE_URL = 'https://nnckqafklmlfiwfdjrsw.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY2txYWZrbG1sZml3ZmRqcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzI0NTMsImV4cCI6MjA3OTIwODQ1M30.Ov2vl_7tOHDaalVirnQ__DudbrEjK8weS6Dh2C5-3JU';

  // Check Auth State
  chrome.storage.local.get(['isAuthenticated', 'currentNote'], (result) => {
    if (result.isAuthenticated) {
      showApp();
      if (result.currentNote) {
        titleInput.value = result.currentNote.title || '';
        contentInput.value = result.currentNote.content || '';
      }
    } else {
      showAuth();
    }
  });

  // Login Handler
  loginBtn.addEventListener('click', () => {
    // Simulating login for the extension to enable the view
    chrome.storage.local.set({ isAuthenticated: true }, () => {
      showApp();
    });
  });

  // Logout Handler
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.set({ isAuthenticated: false }, () => {
      showAuth();
    });
  });

  // Save Handler (Sends to Supabase)
  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value;
    const content = contentInput.value;

    if (!title && !content) return;

    statusMsg.textContent = 'Syncing to Cloud...';
    saveBtn.disabled = true;
    
    const note = {
      title: title,
      content: content,
      tags: ['extension', 'web-clip'],
      space: 'General',
      // CRITICAL UPDATE: Matches the web app's guest ID so syncing works without login
      user_id: 'guest-user', 
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(note)
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      statusMsg.textContent = 'Saved to AirNote!';
      chrome.storage.local.set({ currentNote: null }); // Clear draft
      
      setTimeout(() => {
        statusMsg.textContent = 'Ready';
        titleInput.value = '';
        contentInput.value = '';
        saveBtn.disabled = false;
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      statusMsg.textContent = 'Error saving. Try again.';
      saveBtn.disabled = false;
    }
  });

  // Auto-save draft locally
  contentInput.addEventListener('input', () => {
    chrome.storage.local.set({ 
      currentNote: { title: titleInput.value, content: contentInput.value } 
    });
  });

  // Format Toolbar
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.getAttribute('data-prefix');
      const suffix = btn.getAttribute('data-suffix');
      insertText(contentInput, prefix, suffix);
    });
  });

  function showAuth() {
    authView.classList.remove('hidden');
    appView.style.display = 'none';
  }

  function showApp() {
    authView.classList.add('hidden');
    appView.style.display = 'flex';
  }

  function insertText(textarea, prefix, suffix) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    textarea.value = before + prefix + selection + suffix + after;
    textarea.focus();
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = end + prefix.length;
    
    // Trigger input event to save draft
    textarea.dispatchEvent(new Event('input'));
  }
});