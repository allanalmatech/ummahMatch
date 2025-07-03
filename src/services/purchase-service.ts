'use server';
import { db } from '@/firebase/client';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

export type PurchaseRecordData = {
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  flutterwaveRef: string;
};

export async function createPurchaseRecord(data: PurchaseRecordData) {
  const purchasesCollectionRef = collection(db, 'purchases');
  await addDoc(purchasesCollectionRef, {
    ...data,
    status: 'pending', // 'pending', 'completed', 'rejected'
    createdAt: serverTimestamp(),
  });
}

export async function getPurchaseRecords() {
    const purchasesCollectionRef = collection(db, 'purchases');
    const q = query(purchasesCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const purchases = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return purchases;
}

export async function updatePurchaseStatus(purchaseId: string, status: 'completed' | 'rejected') {
  const purchaseRef = doc(db, 'purchases', purchaseId);
  await updateDoc(purchaseRef, { status });
}
