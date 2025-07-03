
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
  doc,
  deleteDoc,
  documentId,
} from 'firebase/firestore';
import { createNotification } from './notification-service';
import type { UserProfile } from '@/types';
import { getBlockedIds } from './block-service';

// Records a "favorite" from one user to another.
export async function createFavorite(favoriter: UserProfile, favoritedId: string) {
  try {
    const favoritesCollectionRef = collection(db, 'favorites');
    await addDoc(favoritesCollectionRef, {
      favoriterId: favoriter.id,
      favoritedId,
      createdAt: serverTimestamp(),
    });

    const favoriterAsFrom = { id: favoriter.id, name: favoriter.name || 'Someone', avatarUrl: favoriter.imageUrl || '', aiHint: favoriter.aiHint || '' };
    await createNotification(favoritedId, {
      type: 'favorite',
      title: 'You have a new admirer!',
      description: `${favoriter.name} added you to their favorites.`,
      from: favoriterAsFrom,
      link: `/users/${favoriter.id}`
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating favorite:', error);
    throw error;
  }
}

// Removes a "favorite".
export async function removeFavorite(favoriterId: string, favoritedId: string) {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('favoriterId', '==', favoriterId),
      where('favoritedId', '==', favoritedId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docToDelete = querySnapshot.docs[0];
      await deleteDoc(doc(db, 'favorites', docToDelete.id));
    }
    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
}

// Checks if a user has favorited another user.
export async function checkIsFavorited(favoriterId: string, favoritedId: string): Promise<boolean> {
  if (!favoriterId || !favoritedId) return false;
  const q = query(
    collection(db, 'favorites'),
    where('favoriterId', '==', favoriterId),
    where('favoritedId', '==', favoritedId),
    limit(1)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Helper function to get user profiles based on a list of IDs.
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

// Function to get users that a specific user has favorited
export async function getMyFavorites(userId: string) {
  const favoritesQuery = query(collection(db, 'favorites'), where('favoriterId', '==', userId), limit(500));
  const favoritesSnapshot = await getDocs(favoritesQuery);
  const favoritedIds = favoritesSnapshot.docs.map(doc => doc.data().favoritedId);
  
  const profiles = await getProfilesByIds(favoritedIds);
  const blockedIds = await getBlockedIds(userId);
  const blockedSet = new Set(blockedIds);
  return profiles.filter((p: any) => !blockedSet.has(p.id));
}

    
