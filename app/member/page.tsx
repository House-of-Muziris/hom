'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getMember, updateMemberLastLogin, Member } from '@/lib/db';
import { User } from 'firebase/auth';

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser || !currentUser.email) {
        router.push('/');
        return;
      }

      // Get member profile
      const memberResult = await getMember(currentUser.email);
      
      if (!memberResult.success || !memberResult.data) {
        await signOut();
        router.push('/');
        return;
      }

      // Update last login timestamp
      await updateMemberLastLogin(currentUser.email);

      setUser(currentUser);
      setMember(memberResult.data);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink/60">Loading your portal...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
        <div className="max-w-md bg-white border-2 border-red-300 p-8">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-ink border-b-4 border-gold">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl text-canvas">House of Muziris</h1>
            <p className="text-gold text-xs uppercase tracking-wider mt-1">Guild Member Portal</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 bg-canvas border-2 border-canvas hover:bg-transparent hover:text-canvas transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-ink p-8 mb-8"
        >
          <h2 className="font-display text-4xl text-ink mb-4">
            Welcome, {user?.email?.split('@')[0]}!
          </h2>
          <div className="w-16 h-0.5 bg-gold mb-6"></div>
          <p className="text-ink/70">
            Thank you for being a valued Guild member. Explore your exclusive spice benefits below.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">�️</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Premium Access</h3>
            <p className="text-ink/70 text-sm">
              Early access to new spice releases and limited editions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Member Pricing</h3>
            <p className="text-ink/70 text-sm">
              Exclusive discounts on all premium spice collections
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">👨‍🍳</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Spice Workshops</h3>
            <p className="text-ink/70 text-sm">
              Quarterly tasting events and cooking workshops with chefs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Guild Newsletter</h3>
            <p className="text-ink/70 text-sm">
              Sourcing stories from Kerala farms and exclusive recipes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Free Shipping</h3>
            <p className="text-ink/70 text-sm">
              Complimentary shipping on all orders within India
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border-2 border-ink p-6 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 bg-gold/10 border-2 border-gold flex items-center justify-center mb-4">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="font-display text-2xl text-ink mb-2">Gift Perks</h3>
            <p className="text-ink/70 text-sm">
              Special gift wrapping and member-exclusive gift sets
            </p>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gold/10 border-2 border-gold p-8"
        >
          <h3 className="font-display text-2xl text-ink mb-4">Contact Us</h3>
          <div className="grid md:grid-cols-2 gap-6 text-ink/70">
            <div>
              <p className="font-medium text-ink mb-2">Customer Support</p>
              <p className="text-sm">Monday - Saturday: 9:00 AM - 7:00 PM</p>
              <p className="text-sm">Sunday: 10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="font-medium text-ink mb-2">Get in Touch</p>
              <p className="text-sm">Email: guild@houseofmuziris.com</p>
              <p className="text-sm">Phone: +91 (0)123 456 7890</p>
            </div>
          </div>
        </motion.div>

        {/* Member Email */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-ink/50"
        >
          <p>Logged in as: {user?.email}</p>
        </motion.div>
      </main>
    </div>
  );
}
