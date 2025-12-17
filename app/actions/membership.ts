'use server';

import { submitMembershipRequest } from '@/lib/db';

export async function submitMembershipAction(data: {
  memberType: 'private' | 'trade';
  name: string;
  email: string;
  phone?: string;
  message?: string;
  company?: string;
  role?: string;
  businessType?: 'restaurant' | 'hotel' | 'corporate' | 'retailer';
  monthlyVolume?: '<1kg' | '1-10kg' | '10+kg';
}) {
  return await submitMembershipRequest(data);
}
