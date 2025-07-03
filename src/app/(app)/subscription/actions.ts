
'use server';

import { setUserProfile } from '@/services/user-service';
import { revalidatePath } from 'next/cache';

export async function updateUserSubscription(userId: string, plan: 'Premium' | 'Gold' | 'Platinum') {
  try {
    await setUserProfile(userId, { subscription: plan });
    // Revalidate paths that have subscription-gated features
    revalidatePath('/messages');
    revalidatePath('/likes');
    return { success: true };
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
