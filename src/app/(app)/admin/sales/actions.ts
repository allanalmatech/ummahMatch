
'use server';

import { revalidatePath } from 'next/cache';
import { updatePurchaseStatus } from '@/services/purchase-service';
import { updateUserSubscription } from '@/app/(app)/subscription/actions';
import { addUserBoosts } from '@/app/(app)/boost/actions';

export async function approvePurchase(purchaseId: string, userId: string, itemId: string, itemName: string) {
  try {
    let entitlementResult;

    if (itemId.startsWith('boost-')) {
        const quantity = parseInt(itemId.split('-')[1], 10) || 1;
        entitlementResult = await addUserBoosts(userId, quantity);
    } else {
        // Assuming it's a subscription plan like 'premium', 'gold', 'platinum'.
        // The name from the item is better here: 'Premium', 'Gold', 'Platinum'
        entitlementResult = await updateUserSubscription(userId, itemName as 'Premium' | 'Gold' | 'Platinum');
    }
    
    if (!entitlementResult || !entitlementResult.success) {
      // If granting the entitlement fails, don't update the purchase status.
      // Let the admin retry.
      return { success: false, error: entitlementResult?.error || 'Failed to grant entitlement.' };
    }

    await updatePurchaseStatus(purchaseId, 'completed');
    
    revalidatePath('/admin/sales');
    // Also revalidate pages where the entitlement might be used.
    revalidatePath('/boost');
    revalidatePath('/subscription');
    revalidatePath('/likes');
    revalidatePath('/messages');

    return { success: true };
  } catch (error) {
    console.error('Failed to approve purchase:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function rejectPurchase(purchaseId: string) {
  try {
    await updatePurchaseStatus(purchaseId, 'rejected');
    revalidatePath('/admin/sales');
    return { success: true };
  } catch (error) {
    console.error('Failed to reject purchase:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
