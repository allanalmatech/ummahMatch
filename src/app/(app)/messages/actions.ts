
'use server';

import { db } from '@/firebase/client';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createNotification } from '@/services/notification-service';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import { generateIcebreakers, type IcebreakerInput } from '@/ai/flows/icebreaker-generator';
import { checkIfMatchExists } from '@/services/like-service';

// A helper to create a consistent conversation ID
const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_');
};

export async function sendMessage(currentUserId: string, otherUserId: string, text: string) {
  if (!text.trim()) {
    return { success: false, error: "Message cannot be empty." };
  }
  if (!currentUserId || !otherUserId) {
    return { success: false, error: "User information is missing." };
  }

  const [senderProfile, otherUserProfile] = await Promise.all([
    getUserProfile(currentUserId) as Promise<UserProfile | null>,
    getUserProfile(otherUserId) as Promise<UserProfile | null>
  ]);

  if (!senderProfile || !otherUserProfile) {
    return { success: false, error: "Could not find user profiles." };
  }

  // Check for a valid subscription. 'Free' users cannot send messages.
  const subscription = senderProfile.subscription;
  if (!subscription || subscription === 'Free') {
      return { success: false, error: "You need a Premium subscription to send messages. Please upgrade your plan." };
  }
  
  // Check receiver's privacy settings
  const receiverPrivacy = otherUserProfile.privacy || { onlyMatchesCanMessage: false };
  if (receiverPrivacy.onlyMatchesCanMessage) {
    const areMatched = await checkIfMatchExists(currentUserId, otherUserId);
    if (!areMatched) {
        return { success: false, error: `${otherUserProfile.name} only accepts messages from their matches.` };
    }
  }


  const conversationId = getConversationId(currentUserId, otherUserId);
  
  try {
    const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesCollectionRef, {
      senderId: currentUserId,
      text: text,
      createdAt: serverTimestamp(),
    });

    const conversationDocRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationDocRef, {
      lastMessage: text,
      lastMessageTimestamp: serverTimestamp(),
      participants: [currentUserId, otherUserId],
    }, { merge: true });

    // Create notification for the receiver
    if (senderProfile) {
        const fromUser = {
            id: senderProfile.id,
            name: senderProfile.name || 'Someone',
            avatarUrl: senderProfile.imageUrl || '',
            aiHint: senderProfile.aiHint || ''
        };
        await createNotification(otherUserId, {
            type: 'message',
            title: `New message from ${senderProfile.name}`,
            description: text,
            from: fromUser,
            link: `/messages`
        });
    }

    return { success: true };

  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}

export async function generateIcebreakersAction(currentUserId: string, otherUserId: string) {
  try {
    const [currentUserProfile, otherUserProfile] = await Promise.all([
      getUserProfile(currentUserId) as Promise<UserProfile | null>,
      getUserProfile(otherUserId) as Promise<UserProfile | null>
    ]);

    if (!currentUserProfile || !otherUserProfile) {
      return { success: false, icebreakers: [], error: 'Could not find user profiles.' };
    }

    const input: IcebreakerInput = {
      sender: {
        name: currentUserProfile.name,
        description: currentUserProfile.description,
        interests: currentUserProfile.interests,
        occupation: currentUserProfile.occupation,
      },
      receiver: {
        name: otherUserProfile.name,
        description: otherUserProfile.description,
        interests: otherUserProfile.interests,
        occupation: otherUserProfile.occupation,
      }
    };

    const result = await generateIcebreakers(input);
    return { success: true, icebreakers: result.icebreakers, error: null };

  } catch (error) {
    console.error("Error generating icebreakers:", error);
    return { success: false, icebreakers: [], error: 'Failed to generate icebreakers. Please try again.' };
  }
}
