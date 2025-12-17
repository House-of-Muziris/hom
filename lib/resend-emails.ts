import { Resend } from 'resend';

// Lazy initialization to avoid loading API key on client side
let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured in environment variables');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@houseofmuziris.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const resend = getResendClient();
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

// Museum-themed email template
function getEmailTemplate(content: string, ctaText?: string, ctaLink?: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500&display=swap');
          body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, sans-serif;
            background-color: #F0EFEA;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 2px solid #1A1A1A;
          }
          .header {
            background-color: #1A1A1A;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 3px solid #C5A059;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 700;
            color: #F0EFEA;
            margin: 0;
            letter-spacing: 1px;
          }
          .subtitle {
            font-size: 12px;
            color: #C5A059;
            margin: 8px 0 0 0;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .content {
            padding: 50px 40px;
            color: #1A1A1A;
            line-height: 1.8;
          }
          .content p {
            margin: 0 0 20px 0;
            font-size: 16px;
          }
          .cta-button {
            display: inline-block;
            margin: 30px 0;
            padding: 16px 40px;
            background-color: #C5A059;
            color: #1A1A1A;
            text-decoration: none;
            font-weight: 500;
            font-size: 16px;
            border: 2px solid #1A1A1A;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            background-color: #1A1A1A;
            color: #F0EFEA;
          }
          .footer {
            padding: 30px 40px;
            background-color: #F0EFEA;
            border-top: 2px solid #1A1A1A;
            text-align: center;
            font-size: 13px;
            color: #666;
          }
          .footer-links {
            margin: 15px 0 0 0;
          }
          .footer-links a {
            color: #C5A059;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">House of Muziris</h1>
            <p class="subtitle">Premium Spices from Kerala</p>
          </div>
          <div class="content">
            ${content}
            ${ctaLink && ctaText ? `
              <div style="text-align: center;">
                <a href="${ctaLink}" class="cta-button">${ctaText}</a>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} House of Muziris. All rights reserved.</p>
            <p>This email was sent to ${'{recipient_email}'} as part of your interaction with House of Muziris.</p>
            <div class="footer-links">
              <a href="https://houseofmuziris.com">Visit Our Shop</a>
              <a href="https://houseofmuziris.com/contact">Contact Us</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordlessEmail(email: string, link: string) {
  const content = `
    <p>Welcome back to House of Muziris!</p>
    <p>Click the button below to securely sign in to your account. This link will expire in 60 minutes for your security.</p>
  `;
  
  const html = getEmailTemplate(content, 'Sign In to Your Account', link);
  
  return sendEmail({
    to: email,
    subject: 'Your Sign-In Link for House of Muziris',
    html,
  });
}

export async function sendMembershipApprovalEmail(email: string, name: string) {
  const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://houseofmuziris.com'}/member/login`;
  
  const content = `
    <p>Dear ${name},</p>
    <p>Congratulations! Your application to join House of Muziris Guild has been approved.</p>
    <p>As a Guild member, you now have exclusive access to:</p>
    <ul style="line-height: 2; margin: 20px 0;">
      <li>Premium spice collections before public release</li>
      <li>Special member-only pricing on all products</li>
      <li>Quarterly spice tasting events and workshops</li>
      <li>Direct sourcing stories from Kerala's finest farms</li>
      <li>Priority access to limited edition releases</li>
      <li>Exclusive recipes from renowned chefs</li>
    </ul>
    <p>Click the button below to access your member portal and start exploring the finest spices from Kerala.</p>
  `;
  
  const html = getEmailTemplate(content, 'Access Your Guild Portal', loginLink);
  
  return sendEmail({
    to: email,
    subject: 'Welcome to the House of Muziris Guild! 🌶️',
    html,
  });
}

export async function sendMembershipRejectionEmail(email: string, name: string, reason?: string) {
  const content = `
    <p>Dear ${name},</p>
    <p>Thank you for your interest in joining the House of Muziris Guild.</p>
    <p>After careful review, we regret to inform you that we are unable to approve your Guild membership application at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>If you have any questions or would like to reapply in the future, please don't hesitate to contact us.</p>
    <p>You can still shop our premium spice collection as a retail customer at houseofmuziris.com</p>
  `;
  
  const html = getEmailTemplate(content);
  
  return sendEmail({
    to: email,
    subject: 'Update on Your House of Muziris Guild Application',
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    <p>Dear ${name},</p>
    <p>Thank you for your interest in joining the House of Muziris Guild!</p>
    <p>We have received your Guild membership application and our team is currently reviewing it. You will receive an email notification once your application has been processed.</p>
    <p>In the meantime, feel free to explore our premium spice collection and follow us on social media for the latest updates on new releases and spice stories from Kerala.</p>
    <p>We appreciate your patience and look forward to welcoming you to our exclusive Guild!</p>
  `;
  
  const html = getEmailTemplate(content);
  
  return sendEmail({
    to: email,
    subject: 'Thank You for Applying to the House of Muziris Guild',
    html,
  });
}
