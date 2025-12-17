'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getMember, updateMemberLastLogin, type Member } from '@/lib/db';
import { trackPageView } from '@/lib/analytics';
import { serif, sans } from '@/lib/fonts';
import type { User } from 'firebase/auth';

export default function MemberDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    trackPageView('Member Portal');
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
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
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-[#C5A059] border-t-transparent mx-auto mb-4"
          />
          <p className={`${sans.className} text-[#6B6B6B]`}>Loading your portal...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-red-300 p-8">
          <p className={`${sans.className} text-red-800`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA]">
      {/* Header */}
      <header className="bg-[#1A1A1A] border-b-4 border-[#C5A059]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className={`${serif.className} text-3xl text-[#F0EFEA]`}>House of Muziris</h1>
            <p className={`${sans.className} text-[#C5A059] text-xs uppercase tracking-wider mt-1`}>Guild Member Portal</p>
          </div>
          <button
            onClick={handleSignOut}
            className={`${sans.className} px-6 py-2 bg-[#F0EFEA] text-[#1A1A1A] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
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
          className="bg-white border border-[#E5E3DE] p-8 mb-8"
        >
          <h2 className={`${serif.className} text-4xl text-[#1A1A1A] mb-4`}>
            Welcome, {member?.name || user?.email?.split('@')[0]}!
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mb-6" />
          <p className={`${sans.className} text-[#6B6B6B]`}>
            Thank you for being a valued Guild member. Explore your exclusive spice benefits below.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E5E3DE] p-6 hover:border-[#C5A059] transition-colors"
            >
              <div className="w-12 h-12 bg-[#C5A059]/10 border border-[#C5A059] flex items-center justify-center mb-4">
                <span className="text-2xl">{benefit.icon}</span>
              </div>
              <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-2`}>{benefit.title}</h3>
              <p className={`${sans.className} text-[#6B6B6B] text-sm`}>{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-[#C5A059]/10 border border-[#C5A059] p-8"
        >
          <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-4`}>Contact Us</h3>
          <div className={`${sans.className} grid md:grid-cols-2 gap-6 text-[#6B6B6B]`}>
            <div>
              <p className="font-medium text-[#1A1A1A] mb-2">Customer Support</p>
              <p className="text-sm">Monday - Saturday: 9:00 AM - 7:00 PM</p>
              <p className="text-sm">Sunday: 10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="font-medium text-[#1A1A1A] mb-2">Get in Touch</p>
              <p className="text-sm">Email: trade@houseofmuziris.com</p>
              <p className="text-sm">Phone: +91 6282 855 001</p>
            </div>
          </div>
        </motion.div>

        {/* Member Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`${sans.className} mt-8 text-center text-sm text-[#6B6B6B]`}
        >
          <p>Logged in as: {user?.email}</p>
        </motion.div>
      </main>
    </div>
  );
}

const BENEFITS = [
  { icon: '🏷️', title: 'Premium Access', description: 'Early access to new spice releases and limited editions' },
  { icon: '⭐', title: 'Member Pricing', description: 'Exclusive discounts on all premium spice collections' },
  { icon: '👨‍🍳', title: 'Spice Workshops', description: 'Quarterly tasting events and cooking workshops with chefs' },
  { icon: '📧', title: 'Guild Newsletter', description: 'Sourcing stories from Kerala farms and exclusive recipes' },
  { icon: '🛍️', title: 'Free Shipping', description: 'Complimentary shipping on all orders within India' },
  { icon: '🎁', title: 'Gift Perks', description: 'Special gift wrapping and member-exclusive gift sets' },
];
