
'use server';
import { db } from '@/firebase/client';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';

/**
 * Creates a block record from a blocker to a blocked user,
 * and removes any existing match between them.
 * @param blockerId The user initiating the block.
 * @param blockedId The user being blocked.
 */
export async function createBlock(blockerId: string, blockedId: string) {
  try {
    const batch = writeBatch(db);

    // 1. Add the block document
    const blocksCollectionRef = collection(db, 'blocks');
    const newBlockRef = doc(blocksCollectionRef); // Create a ref with a new ID
    batch.set(newBlockRef, {
      blockerId,
      blockedId,
      createdAt: serverTimestamp(),
    });

    // 2. Find and delete any match between them.
    // Since we don't know the order of users in the 'userIds' array, we query for both possibilities.
    const sortedIds = [blockerId, blockedId].sort();
    const matchesQuery = query(
      collection(db, 'matches'),
      where('userIds', '==', sortedIds)
    );

    const matchSnapshot = await getDocs(matchesQuery);
    if (!matchSnapshot.empty) {
      matchSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    await batch.commit();

  } catch (error) {
    console.error('Error creating block:', error);
    throw error;
  }
}

/**
 * Gets a list of all user IDs that the given user has either blocked or been blocked by.
 * @param userId The user to check for blocks.
 * @returns An array of user IDs to be excluded from view.
 */
export async function getBlockedIds(userId: string): Promise<string[]> {
  const blocksRef = collection(db, 'blocks');
  
  // Query for users I have blocked
  const iBlockedQuery = query(blocksRef, where('blockerId', '==', userId));
  
  // Query for users who have blocked me
  const blockedMeQuery = query(blocksRef, where('blockedId', '==', userId));

  const [iBlockedSnapshot, blockedMeSnapshot] = await Promise.all([
      getDocs(iBlockedQuery),
      getDocs(blockedMeQuery),
  ]);

  const blockedIds = new Set<string>();
  iBlockedSnapshot.forEach(doc => blockedIds.add(doc.data().blockedId));
  blockedMeSnapshot.forEach(doc => blockedIds.add(doc.data().blockerId));
  
  return Array.from(blockedIds);
}
