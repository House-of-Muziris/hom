'use server';

import { submitMembershipRequest } from '@/lib/db';

export async function submitMembershipAction(data: {
  name: string;
  email: string;
  company: string;
  role: string;
}) {
  return await submitMembershipRequest(data);
}
