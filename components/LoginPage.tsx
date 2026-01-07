import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, Box } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onForgotPassword }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        await firebaseService.register(email, password, name);
      } else {
        await firebaseService.login(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email is already registered.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await firebaseService.signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await firebaseService.signInWithFacebook();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Facebook sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-dark-border transition-colors">

        {/* Left Side - Visuals */}
        <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-surface dark:to-dark-bg p-12 flex-col justify-between overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="bg-gradient-to-tr from-brand-400 to-blue-500 p-3 rounded-xl w-fit mb-6 shadow-lg">
              <Box className="w-8 h-8 text-white dark:text-dark-bg" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              {isRegister ? "Join the Creators" : "Welcome Back"}
            </h2>
            <p className="text-gray-600 dark:text-dark-text-secondary text-lg leading-relaxed">
              {isRegister
                ? "Unlock premium 3D models, track your purchases, and build your digital library."
                : "Access your purchased files and discover new artifacts for your next print."}
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-surface bg-gray-200 dark:bg-dark-bg flex items-center justify-center text-xs text-gray-500 dark:text-dark-text-secondary">
                  <UserIcon size={16} />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-dark-surface bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                +2k
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-3 font-medium">Join 2,000+ makers today</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white dark:bg-dark-surface flex flex-col justify-center transition-colors">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              {isRegister ? "Create Account" : "Sign In"}
            </h3>
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
              {isRegister ? "Already have an account?" : "Don't have an account yet?"}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(null); }}
                className="text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-medium ml-2 transition-colors"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5 animate-in slide-in-from-left-4 fade-in duration-300">
                <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                    className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-secondary focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-secondary focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-dark-text-primary placeholder-gray-500 dark:placeholder-dark-text-secondary focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 dark:shadow-brand-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Social / Alternative (Mock) */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border text-center">
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-4">Or continue with</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-bg/80 text-gray-700 dark:text-dark-text-primary transition-colors border border-gray-200 dark:border-dark-border disabled:opacity-50"
                title="Sign in with Google"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.539-6.033-5.696s2.701-5.696,6.033-5.696c1.482,0,2.846,0.558,3.867,1.553l2.817-2.817c-1.796-1.674-4.152-2.708-6.684-2.708C4.738,2.669,0,7.431,0,13.291c0,5.86,4.738,10.622,10.422,10.622c6.015,0,10.01-4.232,10.01-10.01c0-0.643-0.08-1.27-0.198-1.879H12.545z" /></svg>
              </button>
              <button
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-bg/80 text-[#1877F2] dark:text-[#1877F2] transition-colors border border-gray-200 dark:border-dark-border disabled:opacity-50"
                title="Sign in with Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.641c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};