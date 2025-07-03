
import { db } from '@/firebase/client';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit, where, Timestamp, deleteDoc } from 'firebase/firestore';
import { getUsersILiked, getUsersIDisliked } from './like-service';
import { getBlockedIds } from './block-service';
import { getPendingReportsCount } from './report-service';
import type { UserProfile } from '@/types';

export async function setUserProfile(userId: string, profileData: any) {
  const userProfileRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    // Update existing document
    await setDoc(userProfileRef, { 
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } else {
    // Create new document
    await setDoc(userProfileRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deleteUserProfile(userId: string) {
  const userProfileRef = doc(db, 'users', userId);
  await deleteDoc(userProfileRef);
  // In a real app, a Firebase Function would listen for this deletion
  // and proceed to delete the user's Auth record and all their other data.
}

export async function getUsers() {
  const usersCollectionRef = collection(db, 'users');
  const q = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(50));
  const querySnapshot = await getDocs(q);
  
  const users = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return users;
}

export async function getDiscoverFeed(currentUserId: string, count: number = 20) {
  // 1. Get IDs of users already interacted with or blocked
  const [likedProfiles, dislikedProfiles, blockedUserIds, pendingReports] = await Promise.all([
    getUsersILiked(currentUserId),
    getUsersIDisliked(currentUserId),
    getBlockedIds(currentUserId),
    getPendingReportsCount(),
  ]);

  const flaggedUserThreshold = 3;
  const flaggedUserIds = Object.keys(pendingReports).filter(userId => pendingReports[userId] >= flaggedUserThreshold);

  const excludeIds = new Set([currentUserId, ...likedIds, ...dislikedIds, ...blockedUserIds, ...flaggedUserIds]);

  const usersCollectionRef = collection(db, 'users');
  const now = Timestamp.now();

  // 2. Fetch boosted users first
  const boostedQuery = query(
      usersCollectionRef,
      where('boostActiveUntil', '>', now),
      orderBy('boostActiveUntil', 'desc')
  );
  const boostedSnapshot = await getDocs(boostedQuery);
  const boostedUsers = boostedSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
      .filter(user => !excludeIds.has(user.id) && user.privacy?.showInSearch !== false && user.status !== 'Suspended');

  // Add newly fetched boosted users to the exclude list so we don't fetch them again
  boostedUsers.forEach(u => excludeIds.add(u.id));

  // 3. Fetch a pool of regular users
  const regularQuery = query(
    usersCollectionRef, 
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const regularSnapshot = await getDocs(regularQuery);

  const regularUsers: UserProfile[] = [];
  for (const doc of regularSnapshot.docs) {
    if (!excludeIds.has(doc.id)) {
      const userData = { id: doc.id, ...doc.data() } as UserProfile;
      if (userData.privacy?.showInSearch !== false && userData.status !== 'Suspended') {
         regularUsers.push(userData);
      }
    }
  }

  // 4. Combine and return the feed
  const combinedFeed = [...boostedUsers, ...regularUsers];
  
  return combinedFeed.slice(0, count);
}


export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userProfileRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userProfileRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  } else {
    return null;
  }
}

export async function searchUsers(currentUserId: string, filters: { [key: string]: any }) {
  const usersCollectionRef = collection(db, 'users');
  
  let q;
  if (filters.gender) {
    q = query(usersCollectionRef, where('gender', '==', filters.gender), orderBy('createdAt', 'desc'), limit(500));
  } else {
    q = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(500));
  }
  
  const querySnapshot = await getDocs(q);
  const allUsers = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as UserProfile[];

  const [blockedIds, pendingReports] = await Promise.all([
    getBlockedIds(currentUserId),
    getPendingReportsCount(),
  ]);
  const flaggedUserThreshold = 3;
  const flaggedUserIds = Object.keys(pendingReports).filter(userId => pendingReports[userId] >= flaggedUserThreshold);

  const excludeIds = new Set([...blockedIds, ...flaggedUserIds]);
  
  // Apply the rest of the filters in-memory
  const filteredUsers = allUsers.filter(user => {
    if (user.id === currentUserId || excludeIds.has(user.id)) return false;
    
    // Filter out suspended users and those who have chosen to hide their profile
    if (user.status === 'Suspended') return false;
    if (user.privacy?.showInSearch === false) return false;

    if (filters.minAge && (user.age || 0) < parseInt(filters.minAge, 10)) return false;
    if (filters.maxAge && (user.age || 0) > parseInt(filters.maxAge, 10)) return false;
    
    if (filters.minHeight && (user.height || 0) < parseInt(filters.minHeight, 10)) return false;
    if (filters.maxHeight && (user.height || 0) > parseInt(filters.maxHeight, 10)) return false;

    if (filters.minWeight && (user.weight || 0) < parseInt(filters.minWeight, 10)) return false;
    if (filters.maxWeight && (user.weight || 0) > parseInt(filters.maxWeight, 10)) return false;

    if (filters.country && !user.country?.toLowerCase().includes(filters.country.toLowerCase())) return false;
    if (filters.city && !user.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    
    if (filters.description && !user.description?.toLowerCase().includes(filters.description.toLowerCase())) return false;
    
    if (filters.maritalStatus && user.maritalStatus !== filters.maritalStatus) return false;
    if (filters.smoking && user.smoking !== filters.smoking) return false;
    if (filters.drinking && user.drinking !== filters.drinking) return false;
    if (filters.polygamy && user.acceptsPolygamy !== filters.polygamy) return false;

    if (filters.nationality && !user.nationality?.toLowerCase().includes(filters.nationality.toLowerCase())) return false;
    if (filters.ethnicity && !user.tribe?.toLowerCase().includes(filters.ethnicity.toLowerCase())) return false;
    if (filters.occupation && !user.occupation?.toLowerCase().includes(filters.occupation.toLowerCase())) return false;
    if (filters.denomination && !user.denomination?.toLowerCase().includes(filters.denomination.toLowerCase())) return false;

    return true;
  });
  
  return filteredUsers.slice(0, 50);
}
