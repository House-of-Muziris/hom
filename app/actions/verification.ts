'use server';

import { verifyEmailWithToken } from '@/lib/db';

export async function verifyEmailAction(token: string) {
  try {
    console.log('=== SERVER: VERIFYING EMAIL TOKEN ===');
    console.log('Token:', token);
    
    const result = await verifyEmailWithToken(token);
    
    console.log('Verification result:', result);
    
    return result;
  } catch (error: any) {
    console.error('Verification action error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify email'
    };
  }
}
