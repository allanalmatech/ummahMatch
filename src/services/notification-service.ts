
import { db } from '@/firebase/client';
import { collection, query, where, orderBy, getDocs, limit, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

export type Notification = {
  id: string;
  userId: string; // The user who receives the notification
  type: 'like' | 'match' | 'message' | 'alert' | 'favorite';
  title: string;
  description: string;
  link?: string;
  from?: {
    id: string;
    name: string;
    avatarUrl: string;
    aiHint: string;
  };
  isRead: boolean;
  createdAt: Timestamp;
};

// Data required to create a new notification
type NotificationData = {
    type: Notification['type'];
    title: string;
    description: string;
    link?: string;
    from?: Notification['from'];
}

export async function createNotification(userId: string, data: NotificationData) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            ...data,
            isRead: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating notification:", error);
    }
}

export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
    const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(30)
    );

    const snapshot = await getDocs(notificationsQuery);
    if (snapshot.empty) {
        return [];
    }
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
}

export async function markNotificationAsRead(notificationId: string) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { isRead: true });
}

    
