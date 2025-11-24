import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wind, Loader2, AlertCircle, Globe, Shield, Zap } from 'lucide-react';

interface AuthProps {
  onGuestLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Login error:', err);
      // Specific handling for the "provider disabled" error
      if (err.message?.includes('provider is not enabled')) {
        setError('Google Login is not enabled in your Supabase dashboard. Please enable it or use Guest Mode.');
      } else {
        setError(err.message || 'An error occurred during sign in.');
      }
      setLoading(false);
    }
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
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Download Extension</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Copy */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Capture thoughts <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-air-accent to-purple-500">
                at the speed of light.
              </span>
            </h1>
            <p className="text-lg text-air-muted leading-relaxed max-w-md">
              The seamless note-taking app that syncs between your browser extension and the web. Markdown support, spaces, and beautiful dark mode included.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 transition-all duration-200 py-4 px-8 rounded-xl font-bold text-lg disabled:opacity-70 shadow-lg shadow-white/10"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Sign in with Google
              </button>
              
              <button
                onClick={onGuestLogin}
                className="flex items-center justify-center gap-2 bg-air-surface border border-air-border hover:bg-air-border hover:text-white text-air-muted transition-all duration-200 py-4 px-8 rounded-xl font-medium text-lg"
              >
                Continue as Guest
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm max-w-md animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
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
                <div className="text-air-muted">## Project Ideas</div>
                <div className="text-white">**AirNote** is going to be <span className="text-air-accent">awesome</span>.</div>
                <div className="text-white">- Simple</div>
                <div className="text-white">- Fast</div>
                <div className="text-white">- _Beautiful_</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Footer */}
      <footer className="border-t border-air-border bg-air-surface/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-air-accent/10 rounded-lg text-air-accent"><Zap size={24} /></div>
            <div>
              <h3 className="font-bold text-white mb-1">Instant Sync</h3>
              <p className="text-sm text-air-muted">Notes sync in real-time between your browser extension and the dashboard.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Globe size={24} /></div>
            <div>
              <h3 className="font-bold text-white mb-1">Access Anywhere</h3>
              <p className="text-sm text-air-muted">Your thoughts are available on any device, anytime you need them.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><Shield size={24} /></div>
            <div>
              <h3 className="font-bold text-white mb-1">Private & Secure</h3>
              <p className="text-sm text-air-muted">Your data is yours. We prioritize security and privacy above all.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};