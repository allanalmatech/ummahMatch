
import { db } from '@/firebase/client';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc, where } from 'firebase/firestore';

export type ReportData = {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
};

export async function createReport(reportData: ReportData) {
  const reportsCollectionRef = collection(db, 'reports');
  await addDoc(reportsCollectionRef, {
    ...reportData,
    status: 'pending', // 'pending', 'resolved', 'dismissed'
    createdAt: serverTimestamp(),
  });
}

export async function getReports() {
    const reportsCollectionRef = collection(db, 'reports');
    const q = query(reportsCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const reports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return reports;
}

export async function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, { status });
}

// Gets a map of userId -> count of pending reports
export async function getPendingReportsCount(): Promise<{ [userId: string]: number }> {
    const reportsQuery = query(collection(db, 'reports'), where('status', '==', 'pending'));
    const snapshot = await getDocs(reportsQuery);

    if (snapshot.empty) {
        return {};
    }

    const counts: { [userId: string]: number } = {};
    snapshot.docs.forEach(doc => {
        const reportedUserId = doc.data().reportedUserId;
        if (reportedUserId) {
            counts[reportedUserId] = (counts[reportedUserId] || 0) + 1;
        }
    });

    return counts;
}

// Counts pending reports for a single user
export async function countPendingReportsForUser(userId: string): Promise<number> {
    const reportsQuery = query(
        collection(db, 'reports'), 
        where('reportedUserId', '==', userId), 
        where('status', '==', 'pending')
    );
    const snapshot = await getDocs(reportsQuery);
    return snapshot.size;
}
