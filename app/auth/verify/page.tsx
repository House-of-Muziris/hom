"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import { motion } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { verifyPasswordlessLink } from "@/lib/auth";

function VerifyContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    trackPageView("Email Verification");
    verifyLink();
  }, []);

  async function verifyLink() {
    const email = typeof window !== "undefined" ? window.localStorage.getItem("emailForSignIn") : null;
    const link = typeof window !== "undefined" ? window.location.href : "";

    if (!email) {
      setStatus("error");
      setError("Email not found. Please request a new sign-in link.");
      return;
    }

    const result = await verifyPasswordlessLink(email, link);

    if (result.success && result.user?.email) {
      const userEmail = result.user.email.toLowerCase().trim();
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase());
      
      // Check if admin
      if (adminEmails.includes(userEmail)) {
        setStatus("success");
        setTimeout(() => router.push("/admin"), 1500);
        return;
      }

      // For members: Check if approved request exists
      const { getApprovedRequest, getMember, createMember } = await import("@/lib/db");
      const approvedRequest = await getApprovedRequest(userEmail);
      
      if (!approvedRequest.success || !approvedRequest.data) {
        setStatus("error");
        setError("No approved membership found. Please apply for membership first.");
        return;
      }

      // Check if member profile exists, create if not
      const existingMember = await getMember(userEmail);
      if (!existingMember.data) {
        await createMember(approvedRequest.data);
      }

      setStatus("success");
      setTimeout(() => router.push("/member"), 1500);
    } else {
      setStatus("error");
      setError(result.error || "Verification failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-[#E5E3DE] p-12 text-center"
      >
        {status === "verifying" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[#C5A059] border-t-transparent"
            />
            <h2 className={`${serif.className} text-2xl text-[#1A1A1A] mb-3`}>
              Verifying...
            </h2>
            <p className={`${sans.className} text-[#6B6B6B]`}>
              Please wait while we verify your email
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.div>
            <h2 className={`${serif.className} text-2xl text-[#1A1A1A] mb-3`}>
              Welcome Back!
            </h2>
            <p className={`${sans.className} text-[#6B6B6B]`}>
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className={`${serif.className} text-2xl text-[#1A1A1A] mb-3`}>
              Verification Failed
            </h2>
            <p className={`${sans.className} text-[#6B6B6B] mb-6`}>
              {error}
            </p>
            <button
              onClick={() => router.push("/login")}
              className={`${sans.className} px-8 py-3 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
            >
              Back to Login
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-2 border-[#C5A059] border-t-transparent"
          />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
