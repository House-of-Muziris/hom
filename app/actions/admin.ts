'use server';

import { sendMembershipApprovalEmail, sendMembershipRejectionEmail } from '@/lib/resend-emails';

// Admin emails from environment
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function sendApprovalEmailAction(adminEmail: string, memberEmail: string, memberName: string) {
  // Verify admin authorization
  if (!isAdmin(adminEmail)) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    await sendMembershipApprovalEmail(memberEmail, memberName);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sendRejectionEmailAction(adminEmail: string, memberEmail: string, memberName: string, reason?: string) {
  // Verify admin authorization
  if (!isAdmin(adminEmail)) {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    await sendMembershipRejectionEmail(memberEmail, memberName, reason);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
