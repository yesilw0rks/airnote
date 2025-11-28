
const SUPABASE_URL = 'https://nnckqafklmlfiwfdjrsw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uY2txYWZrbG1sZml3ZmRqcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzI0NTMsImV4cCI6MjA3OTIwODQ1M30.Ov2vl_7tOHDaalVirnQ__DudbrEjK8weS6Dh2C5-3JU';

document.addEventListener('DOMContentLoaded', () => {
  const authView = document.getElementById('auth-view');
  const appView = document.getElementById('app-view');
  
  const authBtn = document.getElementById('auth-btn');
  const toggleAuthBtn = document.getElementById('toggle-auth-btn');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  
  const logoutBtn = document.getElementById('logout-btn');
  const saveBtn = document.getElementById('save-btn');
  
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const authError = document.getElementById('auth-error');
  
  const statusMsg = document.getElementById('status-msg');
  const noteContent = document.getElementById('note-content');
  const ghostText = document.getElementById('ghost-text');
  const tabHint = document.getElementById('tab-hint');

  let currentUserId = null;
  let isSignUp = false;
  let pendingSuggestion = null;

  // Check if connected
  chrome.storage.local.get(['airnote_user_id'], (result) => {
    if (result.airnote_user_id) {
      currentUserId = result.airnote_user_id;
      showApp();
    } else {
      showAuth();
    }
  });

  // Toggle Login/Signup
  toggleAuthBtn.addEventListener('click', () => {
    isSignUp = !isSignUp;
    if (isSignUp) {
      authTitle.textContent = "Create Account";
      authSubtitle.textContent = "Sign up to start syncing.";
      authBtn.textContent = "Sign Up";
      toggleAuthBtn.textContent = "Already have an account? Log In";
    } else {
      authTitle.textContent = "Welcome Back";
      authSubtitle.textContent = "Log in to sync your notes.";
      authBtn.textContent = "Log In";
      toggleAuthBtn.textContent = "Don't have an account? Sign Up";
    }
    authError.textContent = "";
  });

  // Auth Logic (REST API)
  authBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
      authError.textContent = "Please enter email and password";
      return;
    }

    // PRESET ACCOUNT BYPASS
    if (email === 'admin@airnote' && password === 'Airnote123') {
      const fakeId = 'preset-admin-id';
      chrome.storage.local.set({ airnote_user_id: fakeId }, () => {
        currentUserId = fakeId;
        showApp();
      });
      return;
    }

    const originalBtnText = authBtn.textContent;
    authBtn.textContent = isSignUp ? "Creating..." : "Logging in...";
    authBtn.disabled = true;
    authError.textContent = "";

    try {
      let url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
      let body = { email, password };

      if (isSignUp) {
        url = `${SUPABASE_URL}/auth/v1/signup`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || data.msg || "Authentication failed");
      }

      // If session exists (Instant Login), save and proceed
      if (data.user && (data.session || data.access_token)) {
        const userId = data.user.id;
        chrome.storage.local.set({ airnote_user_id: userId }, () => {
          currentUserId = userId;
          showApp();
        });
        return;
      }

      // If SignUp but NO session (Email Confirmation Required)
      if (isSignUp && data.user && !data.session && !data.access_token) {
        authError.style.color = "#38bdf8"; // Blue for info
        authError.textContent = "Success! Disable 'Confirm Email' in Supabase dashboard to login instantly.";
        authBtn.textContent = originalBtnText;
        authBtn.disabled = false;
        return;
      }

      const userId = data.user.id;
      
      // Save ID
      chrome.storage.local.set({ airnote_user_id: userId }, () => {
        currentUserId = userId;
        showApp();
      });

    } catch (err) {
      authError.style.color = "#ef4444";
      authError.textContent = err.message;
    } finally {
      if (!authError.textContent.includes('Success')) {
        authBtn.textContent = originalBtnText;
        authBtn.disabled = false;
      }
    }
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
    statusMsg.textContent = 'Syncing...';
    statusMsg.style.color = '#a1a1aa';

    try {
      const newNote = {
        title: title,
        content: content,
        space: 'General',
        tags: ['extension'],
        user_id: currentUserId,
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

      if (!response.ok) {
        let errorMsg = 'Sync failed';
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.hint || response.statusText;
        } catch (e) {
          errorMsg = response.statusText;
        }

        console.error("Supabase Error:", errorMsg);

        if (errorMsg.includes('row-level security') || errorMsg.includes('policy')) {
          throw new Error('DATABASE PERMISSION ERROR: RLS is enabled but policies are missing.');
        } else if (response.status === 404) {
           throw new Error('TABLE MISSING: Database not set up.');
        } else {
          throw new Error(errorMsg);
        }
      }

      // Success
      document.getElementById('note-title').value = '';
      document.getElementById('note-content').value = '';
      clearSuggestion(); // Clear any pending suggestion
      statusMsg.textContent = 'Saved to cloud!';
      statusMsg.style.color = '#38bdf8';
      
      setTimeout(() => { 
        statusMsg.textContent = 'Ready'; 
        statusMsg.style.color = '#a1a1aa'; 
      }, 2000);

    } catch (error) {
      console.error(error);
      statusMsg.textContent = 'Error';
      statusMsg.style.color = '#ef4444';
      
      // Detailed Alert
      alert(`⚠️ SAVE FAILED ⚠️\n\nReason: ${error.message}`);
    } finally {
      saveBtn.textContent = 'Save Note';
      saveBtn.disabled = false;
    }
  });

  // --- AUTOCOMPLETE LOGIC ---

  function showApp() {
    authView.classList.add('hidden');
    appView.style.display = 'flex';
    appView.classList.remove('hidden');
    
    // Attempt to check for selection on active tab
    checkForSelection();
  }

  function showAuth() {
    authView.classList.remove('hidden');
    appView.classList.add('hidden');
    emailInput.value = ''; 
    passwordInput.value = '';
    authError.textContent = '';
  }

  async function checkForSelection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selection = window.getSelection().toString();
          return {
            text: selection,
            url: window.location.hostname
          };
        }
      });

      if (result && result[0] && result[0].result) {
        const { text, url } = result[0].result;
        if (text && text.trim().length > 0) {
          // Format the suggestion
          pendingSuggestion = `"${text.trim()}"\n${url}`;
          
          // Only show if textarea is empty or user hasn't typed yet
          if (noteContent.value.trim() === '') {
            showSuggestion(pendingSuggestion);
          }
        }
      }
    } catch (err) {
      console.log('Script injection not allowed on this page', err);
    }
  }

  function showSuggestion(text) {
    ghostText.style.display = 'block';
    ghostText.textContent = text;
    tabHint.style.display = 'flex';
  }

  function clearSuggestion() {
    pendingSuggestion = null;
    ghostText.textContent = '';
    ghostText.style.display = 'none';
    tabHint.style.display = 'none';
  }

  // Handle Tab key
  noteContent.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && pendingSuggestion) {
      e.preventDefault(); // Stop focus change
      noteContent.value = pendingSuggestion;
      clearSuggestion();
    }
  });

  // Clear ghost text if user starts typing something else
  noteContent.addEventListener('input', () => {
    if (pendingSuggestion) {
      clearSuggestion();
    }
  });
});
