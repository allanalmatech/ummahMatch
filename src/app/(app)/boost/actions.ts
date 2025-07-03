
'use server';

import { db } from '@/firebase/client';
import { doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export async function addUserBoosts(userId: string, quantity: number) {
  if (quantity <= 0) return { success: false, error: 'Invalid quantity.' };
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        return { success: false, error: 'User not found.' };
    }
    // Use increment to safely increase the number of boosts.
    await updateDoc(userRef, {
        boosts: increment(quantity)
    });
    revalidatePath('/boost'); // Revalidate the boost page to show updated count (if displayed)
    return { success: true };
  } catch (error) {
    console.error('Failed to add boosts:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function useBoost(userId: string) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { success: false, error: "User not found." };
        }

        const userData = userSnap.data();
        if (!userData.boosts || userData.boosts <= 0) {
            return { success: false, error: "You have no boosts left." };
        }

        const boostDurationMinutes = 30;
        const boostEndTime = new Date(Date.now() + boostDurationMinutes * 60 * 1000);

        await updateDoc(userRef, {
            boosts: increment(-1),
            boostActiveUntil: Timestamp.fromDate(boostEndTime)
        });
        
        revalidatePath('/boost');
        revalidatePath('/home'); // So the discovery feed can update

        return { success: true, message: `Your profile is boosted for the next ${boostDurationMinutes} minutes!` };
    } catch (error) {
        console.error("Failed to use boost:", error);
        return { success: false, error: "An unexpected error occurred while using the boost." };
    }
}
