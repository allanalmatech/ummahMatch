
'use server';

import { setUserProfile, deleteUserProfile } from '@/services/user-service';
import { revalidatePath } from 'next/cache';

export async function updateUserVerificationStatus(userId: string, status: 'verified' | 'rejected' | 'unverified') {
  try {
    // If an admin approves or rejects, we can clear the photo to save space.
    // A user would need to resubmit a new one if they were rejected and want to try again.
    await setUserProfile(userId, { verificationStatus: status, verificationPhotoUrl: '' });
    revalidatePath('/admin/users');
    revalidatePath(`/users/${userId}`); // Revalidate public profile too
    return { success: true };
  } catch (error) {
    console.error('Failed to update user verification status:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}


export async function updateUserStatus(userId: string, status: 'Active' | 'Suspended') {
  try {
    await setUserProfile(userId, { status });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to update user status:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function deleteUserAction(userId: string) {
    try {
        // This will delete the user's profile document from Firestore.
        // In a full production app, a Firebase Function would be triggered
        // to delete the user's Auth record and all associated data (likes, messages, etc.).
        await deleteUserProfile(userId);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, error: 'An unexpected error occurred while deleting the user.' };
    }
}
