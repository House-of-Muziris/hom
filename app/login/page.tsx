"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackPageView, trackLogin } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { signInWithPassword, getCurrentUser } from "@/lib/auth";

export default function MemberLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Email, Step 2: Password
  const [hasPassword, setHasPassword] = useState(false); // Does user have password set?
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailDisabled, setEmailDisabled] = useState(false);

  useEffect(() => {
    trackPageView("Member Login");
    // Check for email in URL params (from email verification)
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setEmailDisabled(true);
    }
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    if (user) {
      router.push("/dashboard");
    } else {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if user has approved membership
      const { getApprovedRequest } = await import("@/lib/db");
      const approvedRequest = await getApprovedRequest(email);

      if (!approvedRequest.success) {
        console.error("Firestore error:", approvedRequest.error);
        throw new Error(`Unable to verify membership status: ${approvedRequest.error}`);
      }

      if (!approvedRequest.data) {
        setError("This email is not registered as an approved member. Please apply for membership first.");
        setLoading(false);
        return;
      }

      // Check if email is verified
      if (!approvedRequest.data.emailVerified) {
        setError("Please verify your email first. Check your inbox for the verification link we sent when your membership was approved.");
        setLoading(false);
        return;
      }

      // Check if user has a password set using Firebase Auth
      const { getAuth } = await import("@/lib/firebase");
      const { fetchSignInMethodsForEmail } = await import("firebase/auth");
      const signInMethods = await fetchSignInMethodsForEmail(getAuth(), email);
      
      // If user has password provider, they have already set password
      const hasPasswordSet = signInMethods.includes("password");

      setHasPassword(hasPasswordSet);
      setStep(2);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (hasPassword) {
        // User has password - sign in
        const result = await signInWithPassword(email, password);

        if (!result.success) {
          throw new Error(result.error || "Invalid password");
        }

        trackLogin("password");
        router.push("/dashboard");
      } else {
        // User needs to create password for the first time
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          setLoading(false);
          return;
        }

        if (!/[A-Z]/.test(password)) {
          setError("Password must contain at least one uppercase letter");
          setLoading(false);
          return;
        }

        if (!/[a-z]/.test(password)) {
          setError("Password must contain at least one lowercase letter");
          setLoading(false);
          return;
        }

        if (!/[0-9]/.test(password)) {
          setError("Password must contain at least one number");
          setLoading(false);
          return;
        }

        // Create password-based credential for approved member
        const { createPasswordForApprovedMember } = await import("@/lib/auth");
        const result = await createPasswordForApprovedMember(email, password);

        if (!result.success) {
          throw new Error(result.error || "Failed to create password");
        }

        // Mark password as set in profile
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const { markPasswordSet } = await import("@/lib/db");
          await markPasswordSet(currentUser.uid);
        }

        trackLogin("password");
        router.push("/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`${serif.className} text-2xl text-[#1A1A1A]`}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-[#E5E3DE] p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mb-3`}>
            Member Portal
          </h1>
          <p className={`${sans.className} text-[#6B6B6B]`}>
            Access your exclusive spice collection
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-[#C5A059] text-white' : 'bg-[#E5E3DE] text-[#6B6B6B]'}`}>
              1
            </div>
            <div className="w-12 h-0.5 bg-[#E5E3DE]"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-[#C5A059] text-white' : 'bg-[#E5E3DE] text-[#6B6B6B]'}`}>
              2
            </div>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6"
          >
            <div>
              <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                Email Address {emailDisabled && <span className="text-[#C5A059] text-[10px]">(double-click to edit)</span>}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onDoubleClick={() => setEmailDisabled(false)}
                disabled={emailDisabled || loading}
                placeholder="member@example.com"
                required
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors text-sm disabled:bg-[#F0EFEA] disabled:cursor-not-allowed disabled:text-[#6B6B6B]`}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${sans.className} text-sm text-red-600`}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50`}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  disabled
                  className={`${sans.className} flex-1 px-4 py-3 border border-[#E5E3DE] bg-[#F0EFEA] text-[#6B6B6B] outline-none`}
                />
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); }}
                  className={`${sans.className} px-4 py-3 text-xs text-[#C5A059] hover:underline`}
                >
                  Change
                </button>
              </div>
            </div>

            {hasPassword ? (
              <div>
                <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoFocus
                  className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    disabled={loading}
                    autoFocus
                    className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                  />
                  <p className={`${sans.className} text-xs text-[#999] mt-2`}>
                    8+ characters, uppercase, lowercase, and number
                  </p>
                </div>
                <div>
                  <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    disabled={loading}
                    className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors disabled:opacity-50`}
                  />
                </div>
              </>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${sans.className} text-sm text-red-600`}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50`}
            >
              {loading ? (hasPassword ? "Signing In..." : "Setting Up...") : (hasPassword ? "Sign In" : "Create Account")}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-[#E5E3DE] text-center">
          <p className={`${sans.className} text-sm text-[#6B6B6B]`}>
            Not a member yet?{" "}
            <a href="/#waitlist" className="text-[#C5A059] hover:underline">
              Apply for membership
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
