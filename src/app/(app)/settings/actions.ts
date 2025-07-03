
'use server';

import { setUserProfile } from '@/services/user-service';
import { revalidatePath } from 'next/cache';

export async function updateUserSettings(userId: string, settings: any) {
  try {
    await setUserProfile(userId, settings);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user settings:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
