'use server';

import { getAuth } from '@/lib/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';

/**
 * Creates a Firebase user account and sends a password setup email
 * This is called when an admin approves a member
 */
export async function createUserAndSendSetupEmail(email: string, name: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://houseofmuziris.com';
    
    // Generate sign-in link for password setup
    const auth = getAuth();
    const actionCodeSettings = {
      url: `${siteUrl}/auth/setup-password?email=${encodeURIComponent(normalizedEmail)}`,
      handleCodeInApp: true,
    };

    // Send the email with sign-in link
    await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);

    // Send custom welcome email via Resend
    const { sendMembershipApprovalWithSetup } = await import('@/lib/resend-emails');
    const setupLink = actionCodeSettings.url;
    await sendMembershipApprovalWithSetup(normalizedEmail, name, setupLink);

    return { success: true };
  } catch (error: any) {
    console.error('Create user error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create user and send setup email' 
    };
  }
}
