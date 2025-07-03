
'use server';
import { db } from '@/firebase/client';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  documentId,
} from 'firebase/firestore';
import { getBlockedIds } from './block-service';

// Re-implementing a simple getProfilesByIds to avoid circular dependencies.
// In a larger app, this would live in a shared 'user-service' utility.
async function getProfilesByIds(userIds: string[]) {
    if (userIds.length === 0) return [];
    const userProfiles: any[] = [];
    for (let i = 0; i < userIds.length; i += 30) {
        const batchIds = userIds.slice(i, i + 30);
        const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', batchIds));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.docs.forEach(doc => userProfiles.push({ id: doc.id, ...doc.data() }));
    }
    return userProfiles;
}


/**
 * Tracks when a user views another user's profile.
 * @param viewerId The ID of the user viewing the profile.
 * @param viewedId The ID of the user whose profile is being viewed.
 */
export async function trackProfileView(viewerId: string, viewedId:string) {
    if (viewerId === viewedId) return; // Users don't view their own profile in this context.

    // This simple implementation allows for multiple view records from the same person,
    // which can be useful to show repeated interest. A more complex implementation might
    // limit views to one per day per unique viewer-viewed pair.
    const viewsCollectionRef = collection(db, 'profileViews');
    await addDoc(viewsCollectionRef, {
        viewerId,
        viewedId,
        viewedAt: serverTimestamp(),
    });
}

/**
 * Gets a list of users who have viewed a specific user's profile.
 * @param userId The ID of the user whose viewers are to be fetched.
 * @returns A list of user profiles who viewed the user.
 */
export async function getProfileViewers(userId: string) {
  const viewsQuery = query(
    collection(db, 'profileViews'), 
    where('viewedId', '==', userId), 
    orderBy('viewedAt', 'desc'),
    limit(100) // Get the most recent 100 views to work with.
  );
  
  const viewsSnapshot = await getDocs(viewsQuery);
  if (viewsSnapshot.empty) return [];

  // Create a list of unique viewer IDs, preserving the order of the most recent view.
  const viewerIdsMap = new Map<string, boolean>();
  const uniqueViewerIds: string[] = [];
  viewsSnapshot.docs.forEach(doc => {
    const viewerId = doc.data().viewerId as string;
    if (!viewerIdsMap.has(viewerId)) {
      viewerIdsMap.set(viewerId, true);
      uniqueViewerIds.push(viewerId);
    }
  });

  const profiles = await getProfilesByIds(uniqueViewerIds);
  const blockedIds = await getBlockedIds(userId);
  const blockedSet = new Set(blockedIds);
  return profiles.filter((p: any) => !blockedSet.has(p.id));
}
