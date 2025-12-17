/**
 * Email Service for House of M
 * 
 * This module provides email sending functionality.
 * It's designed to be used with Firebase Cloud Functions or other email providers.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * Option 1: Firebase Cloud Functions + SendGrid
 * 1. Install Firebase Functions: npm install firebase-functions firebase-admin
 * 2. Install SendGrid: npm install @sendgrid/mail
 * 3. Set SendGrid API key in Firebase config: firebase functions:config:set sendgrid.key="YOUR_API_KEY"
 * 4. Deploy the function: firebase deploy --only functions
 * 
 * Option 2: Resend (recommended for modern apps)
 * 1. Sign up at https://resend.com
 * 2. Install: npm install resend
 * 3. Add to .env.local: RESEND_API_KEY=your_key_here
 * 4. Call sendEmail from your API routes
 * 
 * Option 3: Nodemailer (self-hosted SMTP)
 * 1. Install: npm install nodemailer
 * 2. Configure SMTP credentials in .env.local
 * 3. Use in API routes or server components
 */

import { getApprovalEmailTemplate, getRejectionEmailTemplate, getOrderConfirmationTemplate } from "./email-templates";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email using your preferred provider
 * This is a placeholder that should be replaced with actual implementation
 */
async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  // TODO: Implement with your chosen email provider
  // Example implementations below:
  
  /*
  // Resend Implementation:
  import { Resend } from 'resend';
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    await resend.emails.send({
      from: 'House of M <noreply@houseofm.com>',
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
  */
  
  /*
  // SendGrid Implementation:
  import sgMail from '@sendgrid/mail';
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  try {
    await sgMail.send({
      to: payload.to,
      from: 'House of M <noreply@houseofm.com>',
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
  */
  
  // For now, just log and return success
  console.log('Email to be sent:', payload.subject, 'to', payload.to);
  return { success: true };
}

/**
 * Send membership approval email with sign-in link
 */
export async function sendApprovalEmail(
  email: string,
  name: string,
  signInLink: string
): Promise<{ success: boolean; error?: string }> {
  const template = getApprovalEmailTemplate(name, email, signInLink);
  
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send membership rejection email
 */
export async function sendRejectionEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const template = getRejectionEmailTemplate(name, email);
  
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{name: string; quantity: number; price: number}>,
  total: number
): Promise<{ success: boolean; error?: string }> {
  const template = getOrderConfirmationTemplate(name, email, orderNumber, items, total);
  
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Firebase Cloud Function example for sending approval emails
 * Deploy this to your Firebase project:
 * 
 * // functions/src/index.ts
 * import * as functions from 'firebase-functions';
 * import * as admin from 'firebase-admin';
 * import { sendApprovalEmail } from './email-service';
 * import { sendPasswordlessEmail } from './auth';
 * 
 * admin.initializeApp();
 * 
 * export const onMembershipApproved = functions.firestore
 *   .document('approvedMembers/{memberId}')
 *   .onCreate(async (snap, context) => {
 *     const member = snap.data();
 *     
 *     // Generate passwordless sign-in link
 *     const actionCodeSettings = {
 *       url: `${functions.config().app.url}/auth/verify?redirect=/auth/create-password`,
 *       handleCodeInApp: true,
 *     };
 *     
 *     const link = await admin.auth().generateSignInWithEmailLink(
 *       member.email,
 *       actionCodeSettings
 *     );
 *     
 *     // Send approval email with sign-in link
 *     await sendApprovalEmail(member.email, member.name, link);
 *   });
 */
