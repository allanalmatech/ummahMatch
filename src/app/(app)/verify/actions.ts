
'use server';

import { setUserProfile, getUserProfile } from '@/services/user-service';
import { revalidatePath } from 'next/cache';

export async function requestManualVerification(userId: string, photoDataUrl: string) {
  if (!userId || !photoDataUrl) {
    return { success: false, error: 'User ID and photo are required.' };
  }
  
  try {
    const userProfile = await getUserProfile(userId);
    if (userProfile?.verificationStatus === 'pending' || userProfile?.verificationStatus === 'verified') {
        return { success: false, error: 'A verification request is already pending or approved.' };
    }

    // In a real app, this data URL would be uploaded to a secure storage bucket (e.g., Firebase Storage)
    // and you'd save the URL. For this prototype, we save the data URL directly to a field
    // which the admin can then see for manual review.
    await setUserProfile(userId, { 
      verificationStatus: 'pending',
      verificationPhotoUrl: photoDataUrl,
    });

    revalidatePath('/verify');
    revalidatePath(`/profile/edit`); // Revalidate profile in case it shows status
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting verification:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
