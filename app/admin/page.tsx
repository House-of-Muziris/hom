"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { sendPasswordlessEmail, getCurrentUser, signOut } from "@/lib/auth";
import { Request, getRequestsByStatus, approveRequest, rejectRequest } from "@/lib/db";
import { User } from "firebase/auth";
import { trackPageView, trackMembershipApproval, trackMembershipRejection } from "@/lib/analytics";
import { sendApprovalEmailAction, sendRejectionEmailAction } from "@/app/actions/admin";

// Authorized admin emails from environment
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

export default function AdminVault() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  const [requests, setRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    trackPageView("Admin Dashboard");
    checkAuth();
  }, []);

  async function checkAuth() {
    const currentUser = await getCurrentUser();
    
    // Check if user email is in authorized admin list
    if (currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
      setUser(currentUser);
      setLoading(false);
    } else if (currentUser) {
      // User is authenticated but not an admin
      setError("Access denied. You are not authorized as an admin.");
      await signOut();
      setUser(null);
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
    }
  }

  // Load data when user or activeTab changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  async function loadData() {
    if (!user?.email) return;
    
    // Load requests based on active tab
    const result = await getRequestsByStatus(activeTab);
    
    if (result.success) {
      setRequests(result.data || []);
    } else {
      setError(result.error || 'Failed to load requests');
    }
  }

async function handlePasswordlessLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    // Check if email is authorized admin
    const normalizedEmail = email.toLowerCase().trim();
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
      setError("Access denied. This email is not authorized for admin access.");
      setLoading(false);
      return;
    }
    
    try {
      // First, trigger Firebase auth link generation
      const firebaseResult = await sendPasswordlessEmail(email);
      
      if (!firebaseResult.success) {
        throw new Error(firebaseResult.error || "Failed to generate auth link");
      }

      // Then send the email via Resend for better deliverability
      const resendResponse = await fetch('/api/auth/admin-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: normalizedEmail, 
          origin: window.location.origin 
        })
      });

      const resendResult = await resendResponse.json();

      if (!resendResult.success) {
        throw new Error(resendResult.error || "Failed to send email");
      }

      setEmailSent(true);
    } catch (error: any) {
      setError(error.message || "Failed to send login link");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(request: Request) {
    if (!request.id || !user?.email) return;
    
    setProcessing(request.id);
    try {
      // Step 1: Update Firestore (client-side with auth)
      await approveRequest(request.id, request);
      
      // Step 2: Send email (server-side with Resend API key)
      await sendApprovalEmailAction(user.email, request.email, request.name);
      
      trackMembershipApproval(request.email);
      await loadData();
    } catch (error) {
      console.error("Approval error:", error);
      setError(error instanceof Error ? error.message : "Failed to approve");
    }
    setProcessing(null);
  }

  async function handleReject(requestId: string) {
    if (!user?.email) return;
    
    setProcessing(requestId);
    const request = requests.find(r => r.id === requestId);
    
    if (!request) {
      setError("Request not found");
      setProcessing(null);
      return;
    }

    // Optional: Prompt for rejection reason
    const reason = window.prompt("Optional: Enter a reason for rejection:");
    
    try {
      // Step 1: Update Firestore (client-side with auth)
      await rejectRequest(requestId, reason || undefined);
      
      // Step 2: Send email (server-side with Resend API key)
      await sendRejectionEmailAction(user.email, request.email, request.name, reason || undefined);
      
      trackMembershipRejection(request.email);
      await loadData();
    } catch (error) {
      console.error("Rejection error:", error);
      setError(error instanceof Error ? error.message : "Failed to reject");
    }
    setProcessing(null);
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  const exportCSV = () => {
    const headers = ["Name", "Email", "Company", "Role", "Status", "Created"];
    const rows = requests.map((r) => [
      r.name,
      r.email,
      r.company,
      r.role,
      r.status,
      new Date(r.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    downloadFile(csv, `${activeTab}-requests.csv`, "text/csv");
  };

  const exportJSON = () => {
    downloadFile(JSON.stringify(requests, null, 2), `${activeTab}-requests.json`, "application/json");
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-[#E5E3DE] p-8 md:p-12"
        >
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-[#1A1A1A] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#C5A059" strokeWidth="1.5" />
              <path d="M8 11V7a4 4 0 118 0v4" stroke="#C5A059" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className={`${serif.className} text-2xl md:text-3xl text-[#1A1A1A] mb-2 text-center`}>The Vault</h1>

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#C5A059]/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8l8 5 8-5M4 8v8a2 2 0 002 2h12a2 2 0 002-2V8" stroke="#C5A059" strokeWidth="1.5" />
                </svg>
              </div>
              <h3 className={`${serif.className} text-xl text-[#1A1A1A] mb-2`}>Check Your Email</h3>
              <p className={`${sans.className} text-[#6B6B6B] text-sm`}>
                We've sent a sign-in link to <strong>{email}</strong>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handlePasswordlessLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin email address"
                  required
                  className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors text-sm`}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${sans.className} text-sm text-red-600 text-center`}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-[0.15em] uppercase hover:bg-[#C5A059] transition-colors`}
              >
                Send Magic Link
              </button>
              
              <p className={`${sans.className} text-xs text-[#999] text-center mt-4`}>
                A secure sign-in link will be sent to your email
              </p>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA] p-4 md:p-8 lg:p-16">
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className={`${sans.className} text-xs md:text-sm tracking-[0.3em] uppercase text-[#C5A059]`}>
                Trader's Ledger
              </span>
              <h1 className={`${serif.className} text-3xl md:text-4xl text-[#1A1A1A] mt-2`}>Membership Portal</h1>
            </div>
            <div className="flex gap-2 md:gap-3 flex-wrap">
              <button
                onClick={exportCSV}
                className={`${sans.className} px-4 md:px-6 py-2 md:py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase hover:bg-[#1A1A1A] hover:text-[#F0EFEA] transition-colors`}
              >
                Export CSV
              </button>
              <button
                onClick={exportJSON}
                className={`${sans.className} px-4 md:px-6 py-2 md:py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase hover:bg-[#1A1A1A] hover:text-[#F0EFEA] transition-colors`}
              >
                Export JSON
              </button>
              <button
                onClick={handleSignOut}
                className={`${sans.className} px-4 md:px-6 py-2 md:py-3 bg-[#1A1A1A] text-[#F0EFEA] text-xs tracking-widest uppercase hover:bg-[#C5A059] transition-colors`}
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-b border-[#E5E3DE]">
            <button
              onClick={() => setActiveTab("pending")}
              className={`${sans.className} px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
                activeTab === "pending"
                  ? "text-[#1A1A1A] border-b-2 border-[#C5A059]"
                  : "text-[#6B6B6B]"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`${sans.className} px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
                activeTab === "approved"
                  ? "text-[#1A1A1A] border-b-2 border-[#C5A059]"
                  : "text-[#6B6B6B]"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setActiveTab("rejected")}
              className={`${sans.className} px-6 py-3 text-sm tracking-wider uppercase transition-colors ${
                activeTab === "rejected"
                  ? "text-[#1A1A1A] border-b-2 border-[#C5A059]"
                  : "text-[#6B6B6B]"
              }`}
            >
              Rejected
            </button>
          </div>
        </motion.header>

        {requests.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E5E3DE] p-16 text-center"
          >
            <p className={`${sans.className} text-[#6B6B6B]`}>
              No {activeTab} requests
            </p>
          </motion.div>
        )}

        {requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request, i) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-[#E5E3DE] p-6 md:p-8"
              >
                <div className="grid md:grid-cols-[1fr_auto] gap-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className={`${serif.className} text-xl md:text-2xl text-[#1A1A1A]`}>{request.name}</h3>
                      <p className={`${sans.className} text-sm text-[#6B6B6B]`}>{request.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className={`${sans.className} text-xs uppercase tracking-wider text-[#C5A059]`}>Company</span>
                        <p className={`${sans.className} text-[#1A1A1A]`}>{request.company}</p>
                      </div>
                      <div>
                        <span className={`${sans.className} text-xs uppercase tracking-wider text-[#C5A059]`}>Role</span>
                        <p className={`${sans.className} text-[#1A1A1A]`}>{request.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-3">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processing === request.id}
                      className={`${sans.className} flex-1 md:flex-none px-6 py-3 bg-[#C5A059] text-white text-xs tracking-widest uppercase hover:bg-[#A68942] transition-colors disabled:opacity-50`}
                    >
                      {processing === request.id ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => request.id && handleReject(request.id)}
                      disabled={processing === request.id}
                      className={`${sans.className} flex-1 md:flex-none px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-xs tracking-widest uppercase hover:bg-[#1A1A1A] hover:text-[#F0EFEA] transition-colors disabled:opacity-50`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab !== "pending" && requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#E5E3DE] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E3DE]">
                    {["Name", "Email", "Company", "Role", "Date"].map((h) => (
                      <th
                        key={h}
                        className={`${sans.className} px-6 py-4 text-left text-xs tracking-wider uppercase text-[#6B6B6B] font-medium`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, i) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-[#E5E3DE] last:border-b-0 hover:bg-[#F0EFEA]/50 transition-colors"
                    >
                      <td className={`${sans.className} px-6 py-5 text-[#1A1A1A] font-medium`}>{request.name}</td>
                      <td className={`${sans.className} px-6 py-5 text-[#6B6B6B]`}>{request.email}</td>
                      <td className={`${sans.className} px-6 py-5 text-[#1A1A1A]`}>{request.company}</td>
                      <td className={`${sans.className} px-6 py-5 text-[#6B6B6B]`}>{request.role}</td>
                      <td className={`${sans.className} px-6 py-5 text-[#6B6B6B] text-sm`}>
                        {request.updatedAt ? new Date(request.updatedAt.seconds * 1000).toLocaleDateString() : 
                         request.createdAt ? new Date(request.createdAt.seconds * 1000).toLocaleDateString() : 
                         "N/A"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${sans.className} text-center text-red-600 text-sm mt-4`}
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
