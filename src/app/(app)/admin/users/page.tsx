
import { User, columns } from './components/columns';
import { DataTable } from './components/data-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getUsers as fetchUsersFromDb } from '@/services/user-service';
import { getPendingReportsCount } from '@/services/report-service';
import type { Timestamp } from 'firebase/firestore';

// Helper to format Firestore Timestamp
const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
    return 'Invalid Date';
};

async function getUsers(): Promise<User[]> {
  const [rawUsers, pendingReportsCount] = await Promise.all([
    fetchUsersFromDb(),
    getPendingReportsCount(),
  ]);

  const flaggedUserThreshold = 3;

  return rawUsers.map((user: any) => {
    const reportCount = pendingReportsCount[user.id] || 0;
    let status: "Active" | "Suspended" | "Flagged" = user.status || "Active";

    if (status === 'Active' && reportCount >= flaggedUserThreshold) {
        status = 'Flagged';
    }
    
    return {
        id: user.id,
        name: user.name || 'No Name',
        email: user.email || 'No Email',
        status: status,
        subscription: user.subscription || "Free",
        joined: formatTimestamp(user.createdAt as Timestamp),
        verificationStatus: user.verificationStatus || 'unverified',
        verificationPhotoUrl: user.verificationPhotoUrl || null,
    };
  });
}

export default async function AdminUsersPage() {
    const data = await getUsers();

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, manage, and moderate user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
    );
}
