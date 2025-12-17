"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import { motion } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { getCurrentUser, createPasswordForUser } from "@/lib/auth";

export default function CreatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    trackPageView("Create Password");
    checkAuth();
  }, []);

  async function checkAuth() {
    const user = await getCurrentUser();
    
    // If not authenticated, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if password already set in profile
    const { getUserProfile } = await import("@/lib/db");
    const profileResult = await getUserProfile(user.uid, user.email || "");
    
    if (profileResult.success && profileResult.data?.hasSetPassword) {
      router.push("/dashboard");
      return;
    }

    // Also check provider as backup
    const hasPassword = user.providerData.some(p => p.providerId === "password");
    if (hasPassword) {
      router.push("/dashboard");
      return;
    }

    setChecking(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await createPasswordForUser(password);

    if (result.success) {
      // Mark password as set in profile
      const user = await getCurrentUser();
      if (user) {
        const { markPasswordSet } = await import("@/lib/db");
        await markPasswordSet(user.uid);
      }
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to create password");
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-[#C5A059] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-[#E5E3DE] p-12"
      >
        <h1 className={`${serif.className} text-3xl text-[#1A1A1A] mb-3`}>
          Create Password
        </h1>
        <p className={`${sans.className} text-[#6B6B6B] mb-8`}>
          Set up a password to secure your account
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`${sans.className} peer w-full px-0 py-3 bg-transparent border-0 border-b border-[#E5E3DE] text-[#1A1A1A] placeholder-transparent focus:border-[#C5A059] focus:outline-none transition-colors`}
              placeholder="Password"
              disabled={loading}
            />
            <label
              htmlFor="password"
              className={`${sans.className} absolute left-0 -top-3.5 text-[#6B6B6B] text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#C5A059]`}
            >
              Password
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`${sans.className} peer w-full px-0 py-3 bg-transparent border-0 border-b border-[#E5E3DE] text-[#1A1A1A] placeholder-transparent focus:border-[#C5A059] focus:outline-none transition-colors`}
              placeholder="Confirm Password"
              disabled={loading}
            />
            <label
              htmlFor="confirmPassword"
              className={`${sans.className} absolute left-0 -top-3.5 text-[#6B6B6B] text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#C5A059]`}
            >
              Confirm Password
            </label>
          </div>

          <div className={`${sans.className} text-xs text-[#6B6B6B] space-y-1`}>
            <p>Password must:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li className={password.length >= 8 ? "text-[#C5A059]" : ""}>
                Be at least 8 characters long
              </li>
              <li className={password && confirmPassword && password === confirmPassword ? "text-[#C5A059]" : ""}>
                Match the confirmation
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 8 || password !== confirmPassword}
            className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1A]`}
          >
            {loading ? "Creating..." : "Create Password"}
          </button>
        </form>

        <p className={`${sans.className} text-xs text-[#6B6B6B] mt-6 text-center`}>
          You can use this password to sign in next time
        </p>
      </motion.div>
    </div>
  );
}
