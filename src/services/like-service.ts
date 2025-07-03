
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
  writeBatch,
  documentId,
} from 'firebase/firestore';
import { createNotification } from './notification-service';
import type { UserProfile } from '@/types';
import { getBlockedIds } from './block-service';

export type LikeResult = {
  success: boolean;
  isMatch: boolean;
  error?: string;
};

// Records a "like" from one user to another and checks for a match.
export async function createLike(
  liker: UserProfile,
  liked: UserProfile
): Promise<LikeResult> {
  try {
    const likerId = liker.id;
    const likedId = liked.id;

    // 1. Add the like document
    const likesCollectionRef = collection(db, 'likes');
    await addDoc(likesCollectionRef, {
      likerId,
      likedId,
      createdAt: serverTimestamp(),
    });

    // 2. Check if the other user has already liked us (a match)
    if (await checkIfMatchExists(likerId, likedId)) {
      // It's a match!
      const matchesCollectionRef = collection(db, 'matches');
      const sortedIds = [likerId, likedId].sort();
      
      // Check if match already exists to prevent duplicates
      const matchQuery = query(matchesCollectionRef, where('userIds', '==', sortedIds));
      const matchSnapshot = await getDocs(matchQuery);

      if (matchSnapshot.empty) {
          await addDoc(matchesCollectionRef, {
            userIds: sortedIds,
            createdAt: serverTimestamp(),
          });
          
          const likerAsFrom = { id: liker.id, name: liker.name || 'Someone', avatarUrl: liker.imageUrl || '', aiHint: liker.aiHint || '' };
          const likedAsFrom = { id: liked.id, name: liked.name || 'Someone', avatarUrl: liked.imageUrl || '', aiHint: liker.aiHint || '' };
          
          // Notify BOTH users of the match
          await Promise.all([
            createNotification(likedId, {
              type: 'match',
              title: "It's a Match!",
              description: `You and ${liker.name} have liked each other.`,
              from: likerAsFrom,
              link: `/messages`
            }),
            createNotification(likerId, {
              type: 'match',
              title: "It's a Match!",
              description: `You and ${liked.name} have liked each other.`,
              from: likedAsFrom,
              link: `/messages`
            })
          ]);
      }
      return { success: true, isMatch: true };
    } else {
        // It's just a like, notify the liked user
        const likerAsFrom = { id: liker.id, name: liker.name || 'Someone', avatarUrl: liker.imageUrl || '', aiHint: liker.aiHint || '' };
        await createNotification(likedId, {
            type: 'like',
            title: `New Like!`,
            description: `${liker.name} liked your profile.`,
            from: likerAsFrom,
            link: `/users/${liker.id}`
        });
        return { success: true, isMatch: false };
    }

  } catch (error) {
    console.error('Error creating like:', error);
    if (error instanceof Error) {
      return { success: false, isMatch: false, error: error.message };
    }
    return { success: false, isMatch: false, error: 'An unknown error occurred.' };
  }
}

// Records a "dislike" from one user to another.
export async function createDislike(dislikerId: string, dislikedId: string) {
    try {
        const dislikesCollectionRef = collection(db, 'dislikes');
        await addDoc(dislikesCollectionRef, {
            dislikerId,
            dislikedId,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error creating dislike:', error);
        throw error; // Re-throw to be handled by the server action
    }
}

// Helper function to get user profiles based on a list of IDs, handling batching.
async function getProfilesByIds(userIds: string[]) {
    if (userIds.length === 0) return [];

    // Firestore 'in' queries are limited to 30 items. We batch requests to handle this.
    const userProfiles: any[] = [];
    for (let i = 0; i < userIds.length; i += 30) {
        const batchIds = userIds.slice(i, i + 30);
        const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', batchIds));
        const usersSnapshot = await getDocs(usersQuery);
        usersSnapshot.docs.forEach(doc => userProfiles.push({ id: doc.id, ...doc.data() }));
    }
    return userProfiles;
}

// Function to get users that a specific user has liked
export async function getUsersILiked(userId: string) {
  const likesQuery = query(collection(db, 'likes'), where('likerId', '==', userId), limit(500));
  const likesSnapshot = await getDocs(likesQuery);
  const likedIds = likesSnapshot.docs.map(doc => doc.data().likedId);
  
  const profiles = await getProfilesByIds(likedIds);
  const blockedIds = await getBlockedIds(userId);
  const blockedSet = new Set(blockedIds);
  return profiles.filter((p: any) => !blockedSet.has(p.id));
}

// Function to get users who have liked a specific user
export async function getUsersWhoLikedMe(userId: string) {
  const likesQuery = query(collection(db, 'likes'), where('likedId', '==', userId), limit(50));
  const likesSnapshot = await getDocs(likesQuery);
  const likerIds = likesSnapshot.docs.map(doc => doc.data().likerId);
  
  const profiles = await getProfilesByIds(likerIds);
  const blockedIds = await getBlockedIds(userId);
  const blockedSet = new Set(blockedIds);
  return profiles.filter((p: any) => !blockedSet.has(p.id));
}

// Function to get users a specific user has disliked
export async function getUsersIDisliked(userId: string) {
    const dislikesQuery = query(collection(db, 'dislikes'), where('dislikerId', '==', userId), limit(500)); // Increased limit
    const dislikesSnapshot = await getDocs(dislikesQuery);
    const dislikedIds = dislikesSnapshot.docs.map(doc => doc.data().dislikedId);
    return getProfilesByIds(dislikedIds);
}

// Function to get all matches for a user
export async function getMyMatches(userId: string) {
    const matchesQuery = query(collection(db, 'matches'), where('userIds', 'array-contains', userId));
    const matchesSnapshot = await getDocs(matchesQuery);

    if (matchesSnapshot.empty) {
        return [];
    }

    const otherUserIds = matchesSnapshot.docs.flatMap(doc => {
        const userIds = doc.data().userIds as string[];
        return userIds.filter(id => id !== userId);
    });
    
    const profiles = await getProfilesByIds(otherUserIds);
    const blockedIds = await getBlockedIds(userId);
    const blockedSet = new Set(blockedIds);
    return profiles.filter((p: any) => !blockedSet.has(p.id));
}

// Checks if a mutual like (match) exists between two users
export async function checkIfMatchExists(userId1: string, userId2: string) {
    const likesRef = collection(db, 'likes');
    
    // Check if user1 liked user2
    const query1 = query(
      likesRef,
      where('likerId', '==', userId1),
      where('likedId', '==', userId2),
      limit(1)
    );
    
    // Check if user2 liked user1
    const query2 = query(
      likesRef,
      where('likerId', '==', userId2),
      where('likedId', '==', userId1),
      limit(1)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(query1), getDocs(query2)]);

    return !snapshot1.empty && !snapshot2.empty;
}
