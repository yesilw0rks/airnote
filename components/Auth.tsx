
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { SendHorizontal, Loader2, ArrowRight, Mail, Lock, AlertCircle, Zap, Globe, Shield, ChevronLeft } from 'lucide-react';

interface AuthProps {
  onGuestLogin: () => void;
}

type AuthMode = 'landing' | 'login' | 'signup';

export const Auth: React.FC<AuthProps> = ({ onGuestLogin }) => {
  const [mode, setMode] = useState<AuthMode>('landing');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // PRESET ACCOUNT BACKDOOR
    if (email === 'admin@airnote' && password === 'Airnote123') {
      localStorage.setItem('airnote_preset_mode', 'true');
      // Simulate a small network delay for realism
      setTimeout(() => {
        onGuestLogin();
        setLoading(false);
      }, 500);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If Supabase returns a session immediately (Email Confirmation Disabled), log them in.
        if (data.session) {
          onGuestLogin();
        } else if (data.user) {
          // Email Confirmation is ENABLED in dashboard
          setMessage("Success! Check your email for the link.");
          setError("Note: If you don't receive the email, go to your Supabase Dashboard > Auth > Providers > Email and disable 'Confirm Email' for instant signup.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onGuestLogin();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] relative overflow-hidden text-white font-sans selection:bg-air-accent/30">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('landing')}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <SendHorizontal className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">airnote</span>
        </div>

        {mode === 'landing' && (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMode('login')}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => setMode('signup')}
              className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all border border-white/10"
            >
              Sign Up
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        
        {/* LANDING PAGE UI */}
        {mode === 'landing' && (
          <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center animate-in fade-in duration-700">
            
            {/* Left Column: Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-medium text-blue-400 w-fit">
                <Zap size={12} fill="currentColor" />
                Instant Setup • No Config Required
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                Capture thoughts <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  at the speed of light.
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                The seamless note-taking app. We've simplified the login process so you can start writing instantly.
              </p>

              <div className="pt-2">
                <button 
                  onClick={() => setMode('login')}
                  className="bg-white text-black hover:bg-gray-200 font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                  Start Writing
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Column: Visual Mockup */}
            <div className="relative group perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              
              <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl p-6 shadow-2xl transform rotate-2 transition-transform duration-500 hover:rotate-0">
                {/* Window Controls */}
                <div className="flex items-center gap-2 mb-6 opacity-80">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                </div>

                {/* Mock Code Content */}
                <div className="space-y-4 font-mono text-sm leading-relaxed">
                  <div className="text-gray-500">## Welcome to airnote</div>
                  <div className="text-white">
                    This app now uses <span className="text-blue-400 font-bold">**Email Auth**</span>.
                  </div>
                  <div className="text-gray-300">- Secure & Private</div>
                  <div className="text-gray-300">- Instant Cloud Sync</div>
                  <div className="text-gray-500 italic">_Just works_</div>
                  <div className="h-4"></div>
                  <div className="flex gap-2">
                     <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUTH FORM (Login / Signup) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="w-full max-w-md animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-[#18181b] border border-[#27272a] p-8 rounded-3xl shadow-2xl relative">
              
              <button 
                onClick={() => setMode('landing')}
                className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="mt-8">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400 mb-8 text-center text-sm">
                  {mode === 'signup' ? 'Start syncing your notes today.' : 'Enter your email to access your notes.'}
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@airnote.app" 
                        className="w-full bg-[#09090b] border border-[#27272a] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-700 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full bg-[#09090b] border border-[#27272a] rounded-xl py-3.5 pl-12 pr-4 text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-700 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {message && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-xs text-center">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        {mode === 'signup' ? 'Create Account' : 'Log In'}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button 
                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {mode === 'signup' ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
                
                <div className="mt-4 text-center border-t border-[#27272a] pt-4">
                   <button onClick={onGuestLogin} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-wider font-bold">
                     Continue as Guest
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      {mode === 'landing' && (
        <footer className="border-t border-[#27272a] bg-[#09090b] mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <div>© 2024 airnote. All rights reserved.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="flex items-center gap-1"><Zap size={12}/> V1.3</span>
              <span className="flex items-center gap-1"><Shield size={12}/> Secure</span>
              <span className="flex items-center gap-1"><Globe size={12}/> Global</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
