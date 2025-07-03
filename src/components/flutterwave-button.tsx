'use client';

import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { User } from 'firebase/auth';
import { createPurchaseRecord } from '@/services/purchase-service';

type PurchasableItem = {
  id: string;
  name: string;
  price: number;
  cta: string;
}

type FlutterwaveButtonProps = {
  item: PurchasableItem;
  user: User | null;
};

export function FlutterwaveButton({ item, user }: FlutterwaveButtonProps) {
  const { toast } = useToast();

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    tx_ref: `${user?.uid}-${item.id}-${Date.now()}`,
    amount: item.price,
    currency: 'USD',
    payment_options: 'card,mobilemoney,paypal,ussd',
    customer: {
      email: user?.email || '',
      name: user?.displayName || 'UmmahMatch User',
    },
    customizations: {
      title: 'UmmahMatch Purchase',
      description: `Payment for ${item.name}`,
      logo: 'https://placehold.co/100x100.png',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);
  
  const handleSuccess = async (response: any) => {
    console.log("Flutterwave Response:", response);
    
    // Create a purchase record for admin approval.
    // This is more secure than granting entitlements client-side.
    try {
        await createPurchaseRecord({
            userId: user!.uid,
            userName: user!.displayName || 'Anonymous',
            userEmail: user!.email!,
            itemId: item.id,
            itemName: item.name,
            itemPrice: item.price,
            flutterwaveRef: response.tx_ref
        });

        toast({
            title: 'Purchase Submitted!',
            description: `Your purchase of ${item.name} is being processed and will be reflected on your account shortly.`,
        });
    } catch(error) {
         toast({
            variant: 'destructive',
            title: 'Purchase Failed',
            description: `There was an issue recording your purchase. Please contact support.`,
        });
    }

    closePaymentModal();
  };

  const handleClick = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please log in to make a purchase.' });
      return;
    }
    if (!config.public_key) {
       toast({ variant: 'destructive', title: 'Payment gateway not configured.', description: "Please contact support." });
       console.error("Flutterwave public key is not set in environment variables.");
       return;
    }

    handleFlutterwavePayment({
      callback: handleSuccess,
      onClose: () => {
         toast({
            variant: 'default',
            title: 'Payment window closed',
            description: 'Your purchase was not completed.',
         });
      },
    });
  };

  return (
    <Button className="w-full" size="lg" onClick={handleClick}>
      {item.cta}
    </Button>
  );
}
