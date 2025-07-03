import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getReports } from '@/services/report-service';
import { getUserProfile } from '@/services/user-service';
import { DataTable } from './components/data-table';
import { columns, type ReportRow } from './components/columns';
import type { Timestamp } from 'firebase/firestore';

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

async function getReportData(): Promise<ReportRow[]> {
  const reports = await getReports();

  const userIds = new Set<string>();
  reports.forEach(report => {
    userIds.add(report.reporterId);
    userIds.add(report.reportedUserId);
  });

  const userProfiles = new Map<string, any>();
  await Promise.all(
    Array.from(userIds).map(async (userId) => {
      const profile = await getUserProfile(userId);
      if (profile) {
        userProfiles.set(userId, profile);
      }
    })
  );

  return reports.map((report: any) => {
    const reportedUser = userProfiles.get(report.reportedUserId);
    const reporter = userProfiles.get(report.reporterId);
    
    return {
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: formatTimestamp(report.createdAt),
      reportedUserId: report.reportedUserId,
      reportedUserName: reportedUser?.name || 'Unknown User',
      reporterId: report.reporterId,
      reporterName: reporter?.name || 'Unknown User',
    };
  });
}


export default async function ModerationPage() {
    const data = await getReportData();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>Review and manage user-submitted reports.</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
    );
}
