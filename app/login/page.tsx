"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackPageView, trackLogin } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { signInWithPassword, sendPasswordlessEmail, getCurrentUser } from "@/lib/auth";

export default function MemberLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"password" | "passwordless">("passwordless");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    trackPageView("Member Login");
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

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signInWithPassword(email, password);

    if (result.success) {
      trackLogin("password");
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  }

  async function handlePasswordlessLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await sendPasswordlessEmail(email);

    if (result.success) {
      trackLogin("passwordless");
      setEmailSent(true);
    } else {
      setError(result.error || "Failed to send email");
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

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setAuthMode("passwordless")}
            className={`${sans.className} flex-1 py-3 text-xs tracking-wider uppercase transition-colors ${
              authMode === "passwordless"
                ? "bg-[#1A1A1A] text-[#F0EFEA]"
                : "bg-transparent text-[#6B6B6B] border border-[#E5E3DE]"
            }`}
          >
            Email Link
          </button>
          <button
            onClick={() => setAuthMode("password")}
            className={`${sans.className} flex-1 py-3 text-xs tracking-wider uppercase transition-colors ${
              authMode === "password"
                ? "bg-[#1A1A1A] text-[#F0EFEA]"
                : "bg-transparent text-[#6B6B6B] border border-[#E5E3DE]"
            }`}
          >
            Password
          </button>
        </div>

        {emailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M4 8l8 5 8-5M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8" stroke="#C5A059" strokeWidth="1.5" />
              </svg>
            </div>
            <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-3`}>
              Check Your Email
            </h3>
            <p className={`${sans.className} text-[#6B6B6B] mb-6`}>
              We've sent a sign-in link to<br />
              <strong>{email}</strong>
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className={`${sans.className} text-sm text-[#C5A059] hover:underline`}
            >
              Try a different email
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={authMode === "password" ? handlePasswordLogin : handlePasswordlessLogin}
            className="space-y-6"
          >
            <div>
              <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                required
                className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
              />
            </div>

            {authMode === "password" && (
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
                  className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors`}
                />
              </div>
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
              className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors`}
            >
              {authMode === "password" ? "Sign In" : "Send Sign-In Link"}
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
