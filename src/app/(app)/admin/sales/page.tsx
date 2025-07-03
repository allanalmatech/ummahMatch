import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getPurchaseRecords } from '@/services/purchase-service';
import { DataTable } from './components/data-table';
import { columns, type PurchaseRow } from './components/columns';
import type { Timestamp } from 'firebase/firestore';

const formatTimestamp = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    }
    return 'Invalid Date';
};

async function getSalesData(): Promise<PurchaseRow[]> {
  const purchases = await getPurchaseRecords();

  return purchases.map((purchase: any) => {
    return {
      id: purchase.id,
      userId: purchase.userId,
      userName: purchase.userName,
      userEmail: purchase.userEmail,
      itemId: purchase.itemId,
      itemName: purchase.itemName,
      itemPrice: purchase.itemPrice,
      status: purchase.status,
      createdAt: formatTimestamp(purchase.createdAt),
    };
  });
}


export default async function SalesPage() {
    const data = await getSalesData();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sales & Purchases</CardTitle>
                <CardDescription>Review and approve pending user purchases.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
    );
}
