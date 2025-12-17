'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { serif, sans } from '@/lib/fonts';
import { verifyEmailAction } from '@/app/actions/verification';
import { trackPageView } from '@/lib/analytics';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    trackPageView('Verify Email');
    
    const token = searchParams.get('token');
    console.log('Verification page loaded with token:', token);
    
    if (!token) {
      setError('Invalid verification link. Please check your email and try again.');
      setVerifying(false);
      return;
    }
    
    verifyEmail(token);
  }, []); // Only run once on mount

  async function verifyEmail(token: string) {
    try {
      console.log('=== Email Verification Started ===');
      console.log('Token:', token);
      console.log('Timestamp:', new Date().toISOString());
      
      const result = await verifyEmailAction(token);

      console.log('Verification result received:', JSON.stringify(result, null, 2));

      // Type-safe check for result structure
      if (!result || typeof result !== 'object') {
        console.error('Invalid result structure:', result);
        throw new Error('Invalid verification response from server');
      }

      if (!result.success) {
        const errorMsg = 'error' in result ? result.error : 'Verification failed - unknown error';
        console.error('Verification failed:', errorMsg);
        throw new Error(errorMsg || 'Verification failed');
      }

      // At this point, TypeScript knows result.success is true, so result.data should exist
      // Type guard to check if data exists and has required properties
      if (!('data' in result) || !result.data || typeof result.data !== 'object' || !('email' in result.data)) {
        console.error('Missing or invalid data in result:', result);
        throw new Error('Verification succeeded but no user data received');
      }

      const verifiedEmail = result.data.email;
      
      if (!verifiedEmail || typeof verifiedEmail !== 'string') {
        console.error('Invalid email in result data:', result.data);
        throw new Error('Verification succeeded but email is missing or invalid');
      }

      console.log('Email verified successfully:', verifiedEmail);
      setEmail(verifiedEmail);
      setVerified(true);
      setVerifying(false);

      console.log('Redirecting to login in 3 seconds...');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        const loginUrl = `/login?email=${encodeURIComponent(verifiedEmail)}`;
        console.log('Redirecting to:', loginUrl);
        router.push(loginUrl);
      }, 3000);
    } catch (err) {
      console.error('=== Email Verification Error ===');
      console.error('Error object:', err);
      
      let message = 'Verification failed';
      
      if (err instanceof Error) {
        message = err.message;
        console.error('Error message:', message);
        console.error('Error stack:', err.stack);
      } else if (typeof err === 'string') {
        message = err;
      } else {
        console.error('Unknown error type:', typeof err, err);
        message = 'An unexpected error occurred during verification';
      }
      
      setError(message);
      setVerifying(false);
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
          Verifying your email...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white border border-[#E5E3DE] p-8 md:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mb-4`}>
              Verification Failed
            </h1>
            <div className="w-16 h-0.5 bg-[#DC2626] mx-auto mb-6" />
            <p className={`${sans.className} text-[#6B6B6B] mb-8`}>
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className={`${sans.className} px-8 py-3 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors`}
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        <div className="bg-white border border-[#E5E3DE] p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
          <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mb-4`}>
            Email Verified!
          </h1>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mb-6" />
          <p className={`${sans.className} text-[#6B6B6B] mb-2`}>
            Your email <strong className="text-[#1A1A1A]">{email}</strong> has been successfully verified.
          </p>
          <p className={`${sans.className} text-[#6B6B6B] mb-8`}>
            You can now create your password and access your member portal.
          </p>
          <div className={`${sans.className} text-sm text-[#999]`}>
            Redirecting to login page in 3 seconds...
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${serif.className} text-2xl text-[#1A1A1A]`}
        >
          Loading...
        </motion.div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
