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
            <p>This email was sent as part of your interaction with House of Muziris.</p>
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

export async function sendMembershipApprovalWithSetup(email: string, name: string, verificationToken: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://houseofmuziris.com'}/auth/verify-email?token=${verificationToken}`;
  const content = `
    <p style="font-size: 18px; margin-bottom: 10px;">Dear <strong>${name}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.8; margin-bottom: 25px;">Congratulations! Your application to join the <strong>House of Muziris Guild</strong> has been approved.</p>
    
    <div style="background-color: #F0EFEA; border-left: 4px solid #C5A059; padding: 20px; margin: 30px 0;">
      <p style="margin: 0 0 10px 0; font-weight: 600; color: #1A1A1A; font-size: 15px;">Your Login Email</p>
      <p style="margin: 0; color: #1A1A1A; font-size: 16px; font-family: monospace;">${email}</p>
    </div>

    <div style="padding: 20px 0; margin: 25px 0; border-top: 1px solid #E5E3DE; border-bottom: 1px solid #E5E3DE;">
      <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #1A1A1A;">Important: Verify Your Email</p>
      <p style="margin: 0; line-height: 1.7;">Click the button below to verify your email and activate your membership. After verification, you'll create your password and access the member portal.</p>
    </div>
    
    <p style="margin: 20px 0; line-height: 1.7;">As a Guild member, you'll enjoy:</p>
    <ul style="line-height: 1.8; margin: 0 0 25px 20px; padding: 0;">
      <li>Premium spice collections before public release</li>
      <li>Member-only pricing on all products</li>
      <li>Quarterly tasting events and workshops</li>
      <li>Direct farm sourcing stories from Kerala</li>
      <li>Priority access to limited editions</li>
    </ul>
    
    <p style="font-size: 13px; color: #6B6B6B; line-height: 1.6; padding: 15px; background-color: #F0EFEA; margin-top: 25px;">
      This verification link remains active until you use it – no expiration.
    </p>
  `;
  
  const html = getEmailTemplate(content, 'Verify Email & Activate Membership', verifyUrl);
  
  return sendEmail({
    to: email,
    subject: 'Welcome to House of Muziris Guild - Verify Your Email',
    html,
  });
}

export async function sendMembershipRejectionEmail(email: string, name: string, reason?: string) {
  const content = `
    <p style="font-size: 18px; margin-bottom: 10px;">Dear <strong>${name}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.8;">Thank you for your interest in joining the House of Muziris Guild.</p>
    
    <div style="background-color: #F0EFEA; border: 2px solid #1A1A1A; padding: 25px; margin: 35px 0;">
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #1A1A1A; line-height: 1.8;">
        After careful review, we regret to inform you that we are unable to approve your Guild membership application at this time.
      </p>
      ${reason ? `
        <div style="background-color: white; padding: 15px; border: 1px solid #E5E3DE; margin-top: 15px;">
          <p style="margin: 0; color: #6B6B6B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Feedback</p>
          <p style="margin: 5px 0 0 0; color: #1A1A1A; font-size: 15px; line-height: 1.6;">${reason}</p>
        </div>
      ` : ''}
    </div>

    <div style="border-top: 2px solid #E5E3DE; padding-top: 25px; margin-top: 35px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1A1A1A;">Still Interested?</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">You may reapply in the future if your circumstances change</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">Shop our premium spice collection as a retail customer at houseofmuziris.com</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">Contact us if you have questions about this decision</span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 13px; color: #6B6B6B; line-height: 1.6; padding: 20px; background-color: #F0EFEA; border-left: 3px solid #C5A059; margin-top: 35px;">
      We appreciate your understanding and wish you the best in your culinary endeavors. Our curated spice collection remains available to all who appreciate quality and authenticity.
    </p>
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
    <p style="font-size: 18px; margin-bottom: 10px;">Dear <strong>${name}</strong>,</p>
    <p style="font-size: 16px; line-height: 1.8;">Thank you for your interest in joining the <strong>House of Muziris Guild</strong>.</p>
    
    <div style="background-color: #F0EFEA; border: 2px solid #1A1A1A; padding: 25px; margin: 35px 0; text-align: center;">
      <p style="margin: 0; font-size: 16px; color: #1A1A1A; line-height: 1.8;">
        <span style="color: #C5A059; font-size: 24px; font-weight: bold;">✦</span><br/>
        <strong style="font-size: 18px;">Application Received</strong>
      </p>
      <p style="margin: 15px 0 0 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
        Our team is currently reviewing your membership application with care. You'll receive an email notification once your application has been processed.
      </p>
    </div>

    <div style="border-top: 2px solid #E5E3DE; padding-top: 25px; margin-top: 35px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; font-weight: 600; color: #1A1A1A;">While You Wait</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">Explore our premium spice collection</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">Follow us on social media for spice stories from Kerala</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; line-height: 1.6;">
            <span style="color: #C5A059; font-weight: bold; margin-right: 8px;">→</span>
            <span style="color: #1A1A1A;">Learn about our sourcing process and quality standards</span>
          </td>
        </tr>
      </table>
    </div>
    
    <p style="font-size: 13px; color: #6B6B6B; line-height: 1.6; padding: 20px; background-color: #F0EFEA; border-left: 3px solid #C5A059; margin-top: 35px;">
      We appreciate your patience and look forward to welcoming you to our exclusive Guild of discerning culinary professionals and spice enthusiasts.
    </p>
  `;
  
  const html = getEmailTemplate(content);
  
  return sendEmail({
    to: email,
    subject: '✦ Thank You for Applying to House of Muziris Guild',
    html,
  });
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  loyaltyPoints: number
) {
  try {
    const { getOrderConfirmationEmailTemplate } = await import('./order-email');
    const template = getOrderConfirmationEmailTemplate(name, email, orderNumber, items, total, loyaltyPoints);
    
    return sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error };
  }
}
