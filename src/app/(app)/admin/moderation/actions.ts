

'use server';

import { revalidatePath } from 'next/cache';
import { updateReportStatus } from '@/services/report-service';
import { setUserProfile } from '@/services/user-service';

export async function resolveReport(reportId: string) {
  try {
    await updateReportStatus(reportId, 'resolved');
    revalidatePath('/admin/moderation');
    return { success: true };
  } catch (error) {
    console.error('Failed to resolve report:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function dismissReport(reportId: string) {
  try {
    await updateReportStatus(reportId, 'dismissed');
    revalidatePath('/admin/moderation');
    return { success: true };
  } catch (error) {
    console.error('Failed to dismiss report:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function suspendUserFromReport(userId: string, reportId: string) {
    try {
        // Using a Promise.all to do both in parallel
        await Promise.all([
            setUserProfile(userId, { status: 'Suspended' }),
            updateReportStatus(reportId, 'resolved'),
        ]);

        revalidatePath('/admin/moderation');
        revalidatePath('/admin/users'); // Also revalidate users page as status changes
        return { success: true };
    } catch (error) {
        console.error('Failed to suspend user:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
