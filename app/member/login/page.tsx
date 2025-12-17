'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithPassword } from '@/lib/auth';
import { getApprovedRequest } from '@/lib/db';
import { serif, sans } from '@/lib/fonts';
import { trackPageView } from '@/lib/analytics';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MemberLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackPageView('Member Login');
  }, []);

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

      // Sign in with password
      const result = await signInWithPassword(email, password);
      
      if (!result.success) {
        throw new Error(result.error || 'Invalid email or password');
      }

      // Redirect to member dashboard
      router.push('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white border border-[#E5E3DE] p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className={`${serif.className} text-4xl md:text-5xl text-[#1A1A1A] mb-3`}>
              Member Portal
            </h1>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-4" />
            <p className={`${sans.className} text-[#6B6B6B] text-sm uppercase tracking-wider`}>
              House of Muziris
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
                placeholder="member@example.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${sans.className} p-4 bg-red-50 border border-red-200 text-red-800 text-sm`}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50`}
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E3DE] text-center">
            <p className={`${sans.className} text-sm text-[#6B6B6B] mb-2`}>Not a member yet?</p>
            <a
              href="/#waitlist"
              className={`${sans.className} text-[#C5A059] hover:underline text-sm font-medium`}
            >
              Apply for Membership
            </a>
          </div>

          <div className={`${sans.className} mt-6 text-center`}>
            <p className="text-xs text-[#999]">
              Secure passwordless authentication - Link expires in 60 minutes
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
<div>
              <label htmlFor="password" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${sans.className} p-4 bg-red-50 border border-red-200 text-red-800 text-sm`}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50`}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E3DE] text-center">
            <p className={`${sans.className} text-sm text-[#6B6B6B] mb-2`}>Not a member yet?</p>
            <a
              href="/#waitlist"
              className={`${sans.className} text-[#C5A059] hover:underline text-sm font-medium`}
            >
              Apply for Membership
            </a>
          </div>

          <div className={`${sans.className} mt-6 text-center`}>
            <p className="text-xs text-[#999]">
              Secure password authentication • No email quota limit