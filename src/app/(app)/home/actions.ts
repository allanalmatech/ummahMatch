
'use server';

import { createLike, createDislike } from '@/services/like-service';
import { revalidatePath } from 'next/cache';
import { getUserProfile, getDiscoverFeed } from '@/services/user-service';
import { findCompatibleMatches, type MatchmakingInput } from '@/ai/flows/matchmaking-flow';
import type { UserProfile } from '@/types';

export async function likeUser(likerId: string, likedId: string) {
  if (!likerId || !likedId) {
    return { success: false, isMatch: false, error: 'User IDs are required.' };
  }

  try {
    const [likerProfile, likedProfile] = await Promise.all([
      getUserProfile(likerId),
      getUserProfile(likedId)
    ]);

    if (!likerProfile || !likedProfile) {
        return { success: false, isMatch: false, error: 'Could not find user profiles.' };
    }

    const result = await createLike(likerProfile, likedProfile);

    if (result.isMatch) {
      // If it's a match, we might want to revalidate pages that show matches
      revalidatePath('/home');
      revalidatePath('/likes');
      revalidatePath('/notifications');
    } else {
      revalidatePath('/notifications');
    }
    
    // Always revalidate home to get a new profile
    revalidatePath('/home');

    return result;

  } catch (error: any) {
    console.error("Error in likeUser action: ", error);
    return { success: false, isMatch: false, error: 'An unexpected error occurred.' };
  }
}


export async function dislikeUser(dislikerId: string, dislikedId: string) {
  if (!dislikerId || !dislikedId) {
    return { success: false, error: 'User IDs are required.' };
  }

  try {
    await createDislike(dislikerId, dislikedId);
    revalidatePath('/home'); // Revalidate to get a new profile
    return { success: true };
  } catch (error: any) {
    console.error("Error in dislikeUser action: ", error);
    return { success: false, error: 'An unexpected error occurred while disliking the user.' };
  }
}


export async function getAiMatches(currentUserId: string) {
  if (!currentUserId) {
    return { success: false, matches: [], error: 'User ID is required.' };
  }
  
  try {
    const [currentUserProfile, candidates] = await Promise.all([
      getUserProfile(currentUserId) as Promise<UserProfile | null>,
      getDiscoverFeed(currentUserId, 50) // Fetch a larger pool for the AI
    ]);

    if (!currentUserProfile) {
      return { success: false, matches: [], error: 'Could not find your profile.' };
    }
    
    if (candidates.length < 3) {
      // Not enough candidates for the AI to make meaningful suggestions
      return { success: true, matches: [], error: null };
    }

    // Prepare input for the AI flow
    const matchmakingInput: MatchmakingInput = {
      currentUser: {
        id: currentUserProfile.id,
        name: currentUserProfile.name,
        age: currentUserProfile.age,
        description: currentUserProfile.description,
        interests: currentUserProfile.interests,
        relationshipGoals: currentUserProfile.relationshipGoals,
        subscription: currentUserProfile.subscription,
      },
      candidates: candidates.map(c => ({
        id: c.id,
        name: c.name,
        age: c.age,
        description: c.description,
        interests: c.interests,
        relationshipGoals: c.relationshipGoals,
        subscription: c.subscription,
      })),
    };

    const aiResult = await findCompatibleMatches(matchmakingInput);
    
    if (!aiResult || aiResult.matches.length === 0) {
       return { success: true, matches: [], error: null };
    }

    // Get full profiles for the matched users
    const matchedUserIds = aiResult.matches.map(m => m.userId);
    const matchedProfiles = await Promise.all(
      matchedUserIds.map(id => getUserProfile(id))
    );

    // Combine AI data with full profile data
    const enrichedMatches = aiResult.matches.map(match => {
      const profile = matchedProfiles.find(p => p?.id === match.userId);
      return {
        ...profile,
        score: match.score,
        reason: match.reason,
      };
    }).filter(m => m.id); // Filter out any potential null profiles

    return { success: true, matches: enrichedMatches, error: null };

  } catch (error: any) {
    console.error("Error in getAiMatches action: ", error);
    return { success: false, matches: [], error: 'An unexpected error occurred while generating AI matches.' };
  }
}
