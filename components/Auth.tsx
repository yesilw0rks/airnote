
import React, { useState } from 'react';
import { Wind, Loader2, ArrowRight, Zap } from 'lucide-react';

interface AuthProps {
  onGuestLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleMagicLogin = async () => {
    setLoading(true);
    // Simulate a network request for effect
    setTimeout(() => {
      // Generate a stable ID for this user if one doesn't exist
      let userId = localStorage.getItem('airnote_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('airnote_user_id', userId);
      }
      onGuestLogin(); // This triggers the App to load, checking localStorage
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-air-bg relative overflow-hidden text-air-text">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-air-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]"></div>

      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-air-accent to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-air-accent/20">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">AirNote</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-air-muted">
           <span className="opacity-50">v1.0</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-air-surface border border-air-border text-xs text-air-accent mb-2">
              <Zap size={12} fill="currentColor" />
              <span>Instant Setup &bull; No Config Required</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Capture thoughts <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-air-accent to-purple-500">
                at the speed of light.
              </span>
            </h1>
            <p className="text-lg text-air-muted leading-relaxed max-w-md">
              The seamless note-taking app. We've simplified the login process so you can start writing instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleMagicLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 transition-all duration-200 py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-70 shadow-lg shadow-white/10 w-full sm:w-auto"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                   <>
                    Start Writing
                    <ArrowRight size={20} />
                   </>
                )}
              </button>
            </div>
            
            <div className="text-xs text-air-muted/50 max-w-sm border-l-2 border-air-border pl-3">
              We create a secure Magic ID for your device. Copy it from the sidebar to sync with the Chrome Extension.
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-t from-air-bg via-transparent to-transparent z-10"></div>
            <div className="bg-air-surface border border-air-border rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2 mb-4 border-b border-air-border pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="text-air-muted">## Welcome to AirNote</div>
                <div className="text-white">This app now uses **Magic Sync**.</div>
                <div className="text-white">- No Google Config needed</div>
                <div className="text-white">- Instant Cloud Sync</div>
                <div className="text-white">- _Just works_</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
