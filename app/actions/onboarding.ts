'use server';

/**
 * Sends approval email with verification link to member
 * This is called when an admin approves a member
 */
export async function createUserAndSendSetupEmail(email: string, name: string, verificationToken: string) {
  try {
    console.log('=== SENDING APPROVAL EMAIL ===');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Token:', verificationToken);
    
    const normalizedEmail = email.toLowerCase().trim();

    // Send approval email with verification link via Resend
    const { sendMembershipApprovalWithSetup } = await import('@/lib/resend-emails');
    const result = await sendMembershipApprovalWithSetup(normalizedEmail, name, verificationToken);
    
    console.log('Email send result:', result);

    if (!result.success) {
      const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to send email';
      throw new Error(errorMessage);
    }

    console.log('=== APPROVAL EMAIL SENT SUCCESSFULLY ===');
    return { success: true };
  } catch (error: any) {
    console.error('=== SEND APPROVAL EMAIL ERROR ===');
    console.error('Error details:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send approval email' 
    };
  }
}
