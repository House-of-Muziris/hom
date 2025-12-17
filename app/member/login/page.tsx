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
  const [step, setStep] = useState<1 | 2>(1);
  const [hasPassword, setHasPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackPageView('Member Login');
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const approvedRequest = await getApprovedRequest(email);
      
      if (!approvedRequest.success) {
        console.error('Firestore error:', approvedRequest.error);
        throw new Error(`Unable to verify membership status: ${approvedRequest.error}`);
      }

      if (!approvedRequest.data) {
        setError('This email is not registered as an approved member. Please apply for membership first.');
        setLoading(false);
        return;
      }

      // Check if email is verified
      if (!approvedRequest.data.emailVerified) {
        setError('Please verify your email first. Check your inbox for the verification link we sent when your membership was approved.');
        setLoading(false);
        return;
      }

      const { checkUserHasPassword } = await import('@/lib/auth');
      const passwordCheck = await checkUserHasPassword(email);

      if (!passwordCheck.success) {
        throw new Error(passwordCheck.error || 'Failed to verify account status');
      }

      setHasPassword(passwordCheck.hasPassword || false);
      setStep(2);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (hasPassword) {
        const result = await signInWithPassword(email, password);
        
        if (!result.success) {
          throw new Error(result.error || 'Invalid password');
        }

        router.push('/dashboard');
      } else {
        // User needs to create password for the first time
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
          setError('Password must be 8+ characters with uppercase, lowercase, and number');
          setLoading(false);
          return;
        }

        // Create password-based credential for approved member
        const { createPasswordForApprovedMember } = await import('@/lib/auth');
        const result = await createPasswordForApprovedMember(email, password);

        if (!result.success) {
          throw new Error(result.error || 'Failed to create password');
        }

        router.push('/dashboard');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
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

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-[#C5A059] text-white' : 'bg-[#E5E3DE] text-[#6B6B6B]'}`}>
                1
              </div>
              <div className="w-12 h-0.5 bg-[#E5E3DE]"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-[#C5A059] text-white' : 'bg-[#E5E3DE] text-[#6B6B6B]'}`}>
                2
              </div>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
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
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    disabled
                    className={`${sans.className} flex-1 px-4 py-3 border border-[#E5E3DE] bg-[#F0EFEA] text-[#6B6B6B]`}
                  />
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className={`${sans.className} px-4 py-3 text-xs text-[#C5A059] hover:underline`}
                  >
                    Change
                  </button>
                </div>
              </div>

              {hasPassword ? (
                <div>
                  <label htmlFor="password" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="password" className={`${sans.className} block text-xs tracking-wider uppercase text-[#6B6B6B] mb-2`}>
                      Create Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                      placeholder="Create a strong password"
                      required
                      disabled={loading}
                      autoFocus
                    />
                    <p className={`${sans.className} text-xs text-[#999] mt-2`}>
                      8+ characters, uppercase, lowercase, and number
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
                      className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                      placeholder="Re-enter your password"
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}

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
                {loading ? (hasPassword ? 'Signing In...' : 'Setting Up...') : (hasPassword ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          )}

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
              Secure password authentication • No email quota limits
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}