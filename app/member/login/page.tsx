'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { sendPasswordlessEmail } from '@/lib/auth';
import { getApprovedRequest } from '@/lib/db';

export default function MemberLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkSent, setLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user has an approved membership request
      const approvedRequest = await getApprovedRequest(email);
      
      if (!approvedRequest.success) {
        throw new Error('Unable to verify membership status');
      }

      if (!approvedRequest.data) {
        setError('This email is not registered as an approved member. Please apply for membership first.');
        setLoading(false);
        return;
      }

      // Send passwordless link
      const result = await sendPasswordlessEmail(email);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send login link');
      }

      setLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white border-2 border-ink p-8 md:p-12">
            <div className="text-center">
              <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">
                Check Your Email
              </h1>
              <div className="w-16 h-0.5 bg-gold mx-auto mb-6"></div>
              <p className="text-ink/70 mb-6">
                We&apos;ve sent a secure sign-in link to:
              </p>
              <p className="text-gold font-medium mb-8 break-all">{email}</p>
              <p className="text-sm text-ink/60 mb-4">
                Click the link in the email to access your member portal. The link will expire in 60 minutes.
              </p>
              <p className="text-sm text-ink/60">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setLinkSent(false)}
                  className="text-gold hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white border-2 border-ink p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
              Member Portal
            </h1>
            <div className="w-16 h-0.5 bg-gold mx-auto mb-4"></div>
            <p className="text-ink/70 text-sm uppercase tracking-wider">
              House of Muziris
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ink bg-canvas focus:outline-none focus:border-gold transition-colors"
                placeholder="member@example.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-50 border-2 border-red-300 text-red-800 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-ink font-medium py-4 px-6 border-2 border-ink transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-ink/10 text-center">
            <p className="text-sm text-ink/60 mb-2">Not a member yet?</p>
            <a
              href="/"
              className="text-gold hover:underline text-sm font-medium"
            >
              Apply for Membership
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-ink/50">
              Secure passwordless authentication • Link expires in 60 minutes
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
