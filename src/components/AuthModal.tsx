import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any, role: UserRole) => void;
  initialAdminMode?: boolean;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialAdminMode = false }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(initialAdminMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAdminLogin(initialAdminMode);
      setIsSignUp(false);
      setError(null);
    }
  }, [isOpen, initialAdminMode]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: UserRole.CUSTOMER
            }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          onAuthSuccess(data.user, UserRole.CUSTOMER);
          onClose();
        }
      } else {
        console.log('Attempting sign in for:', email);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error('Sign in error details:', signInError);
          throw signInError;
        }

        if (data.user) {
          console.log('Sign in successful:', data.user.id);
          const role = isAdminLogin ? UserRole.ADMIN : (data.user.user_metadata?.role || UserRole.CUSTOMER);
          onAuthSuccess(data.user, role as UserRole);
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Caught auth error:', err);
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FCFBFA] w-full max-w-md border border-[#121212]/15 shadow-2xl relative overflow-hidden">
        {/* Progress Bar for loading */}
        {loading && (
          <div className="absolute top-0 left-0 h-1 bg-[#D9411E] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#121212]/40 hover:text-[#D9411E] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-[#D9411E]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D9411E]">
                {isAdminLogin ? 'Admin Access' : (isSignUp ? 'New Account' : 'Welcome Back')}
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#121212]">
              {isAdminLogin ? 'Admin Login' : (isSignUp ? 'Join Dealy KE' : 'Sign In')}
            </h2>
            <p className="text-sm text-[#121212]/60 mt-2">
              {isAdminLogin 
                ? 'Enter your administrative credentials to manage the platform.' 
                : (isSignUp ? 'Create an account to start ordering premium deals.' : 'Access your personalized workspace and track orders.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isSignUp || isAdminLogin ? null : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/60">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#121212]/30" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-[#121212]/15 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D9411E] transition-colors"
                    placeholder="Abby Soilan"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/60">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#121212]/30" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#121212]/15 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D9411E] transition-colors"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/60">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-[9px] font-bold text-[#D9411E] uppercase tracking-wider hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#121212]/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#121212]/15 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-[#D9411E] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#121212]/30 hover:text-[#121212] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#121212] text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-[#D9411E] transition-all disabled:opacity-50 disabled:hover:bg-[#121212] flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : (isAdminLogin ? 'Admin Login' : 'Sign In')}
                </>
              )}
            </button>
          </form>

          {!isAdminLogin && (
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#121212]/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="bg-[#FCFBFA] px-4 text-[#121212]/40">Or Continue With</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-[#121212]/15 text-[#121212] py-3 font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all flex items-center justify-center gap-3"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google Account
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#121212]/10 flex flex-col gap-3">
            {!isAdminLogin && (
              <p className="text-center text-xs text-[#121212]/60">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#D9411E] font-bold uppercase tracking-wider hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
