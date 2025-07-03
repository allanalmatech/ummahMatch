
'use server';

import { createReport, type ReportData } from '@/services/report-service';
import { trackProfileView } from '@/services/view-service';
import { createBlock } from '@/services/block-service';
import { revalidatePath } from 'next/cache';
import { createFavorite, removeFavorite, checkIsFavorited } from '@/services/favorite-service';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';

export async function submitReport(reportData: ReportData) {
  try {
    await createReport(reportData);
    return { success: true };
  } catch (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: 'Failed to submit report. Please try again.' };
  }
}

export async function recordProfileView(viewerId: string, viewedId: string) {
    if (!viewerId || !viewedId || viewerId === viewedId) {
        return { success: false, error: "Invalid view data." };
    }
    try {
        await trackProfileView(viewerId, viewedId);
        return { success: true };
    } catch (error) {
        console.error("Error tracking profile view:", error);
        return { success: false, error: "Could not record view." };
    }
}

export async function blockUser(blockerId: string, blockedId: string) {
    if (!blockerId || !blockedId || blockerId === blockedId) {
        return { success: false, error: "Invalid block request." };
    }
    try {
        await createBlock(blockerId, blockedId);
        // Revalidate core pages where the user might appear
        revalidatePath('/home');
        revalidatePath('/search');
        revalidatePath('/likes');
        revalidatePath('/messages');
        return { success: true };
    } catch (error) {
        console.error("Error blocking user:", error);
        return { success: false, error: "Could not block user." };
    }
}

export async function toggleFavorite(favoriterId: string, favoritedId: string) {
  try {
    const [isFavorited, favoriterProfile] = await Promise.all([
      checkIsFavorited(favoriterId, favoritedId),
      getUserProfile(favoriterId) as Promise<UserProfile | null>
    ]);

    if (!favoriterProfile) {
      return { success: false, error: 'Could not find your profile.' };
    }

    if (isFavorited) {
      await removeFavorite(favoriterId, favoritedId);
    } else {
      await createFavorite(favoriterProfile, favoritedId);
    }
    
    revalidatePath(`/users/${favoritedId}`);
    revalidatePath(`/likes`);
    
    return { success: true, newStatus: !isFavorited };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

    
