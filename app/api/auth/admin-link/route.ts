import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordlessEmail as sendResendPasswordlessEmail } from '@/lib/resend-emails';

// Admin emails
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

export async function POST(request: NextRequest) {
  try {
    const { email, origin } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email is an admin
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim());
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. This email is not authorized for admin access.' },
        { status: 403 }
      );
    }

    // Generate the sign-in link (Firebase will handle this on client side)
    // We send a custom email via Resend with better deliverability
    const link = `${origin || process.env.NEXT_PUBLIC_SITE_URL}/auth/verify`;

    // Send via Resend
    const result = await sendResendPasswordlessEmail(email, link);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Send admin email error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
