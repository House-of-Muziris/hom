'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { serif, sans } from '@/lib/fonts';
import { verifyPasswordlessLink, createPasswordForUser } from '@/lib/auth';
import { trackPageView } from '@/lib/analytics';

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    trackPageView('Setup Password');
    verifyLink();
  }, []);

  async function verifyLink() {
    const emailParam = searchParams.get('email');
    const link = window.location.href;

    if (!emailParam) {
      setError('Invalid setup link. Please contact support.');
      setVerifying(false);
      setLoading(false);
      return;
    }

    setEmail(emailParam);

    // Verify the passwordless link and sign in the user
    const result = await verifyPasswordlessLink(emailParam, link);

    if (!result.success) {
      setError('This setup link has expired or is invalid. Please contact support.');
      setVerifying(false);
      setLoading(false);
      return;
    }

    // User is now signed in, they can set their password
    setVerifying(false);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    setLoading(true);

    try {
      const result = await createPasswordForUser(password);

      if (!result.success) {
        throw new Error(result.error || 'Failed to set password');
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${serif.className} text-2xl text-[#1A1A1A]`}
        >
          Verifying your link...
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white border border-[#E5E3DE] p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mb-4`}>
              Welcome to the Guild!
            </h1>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-6" />
            <p className={`${sans.className} text-[#6B6B6B] mb-6`}>
              Your password has been set successfully. You're being redirected to your member portal...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white border border-[#E5E3DE] p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mb-3`}>
              Welcome to House of Muziris
            </h1>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-4" />
            <p className={`${sans.className} text-[#6B6B6B]`}>
              Set your password to complete your membership setup
            </p>
          </div>

          {error && !verifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${sans.className} p-4 mb-6 bg-red-50 border border-red-200 text-red-800 text-sm`}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                Your Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                disabled
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-[#F0EFEA] text-[#6B6B6B] outline-none`}
              />
            </div>

            <div>
              <label htmlFor="password" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                Create Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
                placeholder="Enter a strong password"
                required
                disabled={loading}
              />
              <p className={`${sans.className} text-xs text-[#999] mt-2`}>
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
                placeholder="Re-enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50`}
            >
              {loading ? 'Setting up your account...' : 'Complete Setup'}
            </button>
          </form>

          <div className={`${sans.className} mt-8 pt-6 border-t border-[#E5E3DE] text-center`}>
            <p className="text-xs text-[#999]">
              Having trouble? Contact us at support@houseofmuziris.com
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
