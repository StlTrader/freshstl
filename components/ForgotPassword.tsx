import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle, AlertCircle, Box } from 'lucide-react';
import * as firebaseService from '../services/firebaseService';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await firebaseService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border p-8 transition-colors">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-900/30 rounded-full mb-4 text-brand-600 dark:text-brand-400 shadow-sm">
            <Box size={32} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">Reset Password</h2>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center animate-in zoom-in duration-300">
            <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl mb-6 flex flex-col items-center gap-2 border border-green-200 dark:border-green-900/30">
              <CheckCircle size={32} />
              <p className="font-medium">Check your email</p>
              <p className="text-xs text-green-600/80 dark:text-green-300/80">
                We have sent a password reset link to <br /> <span className="font-bold">{email}</span>
              </p>
            </div>
            <button
              onClick={onBack}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-dark-bg/80 text-gray-900 dark:text-dark-text-primary font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 dark:shadow-brand-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-dark-text-primary transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};