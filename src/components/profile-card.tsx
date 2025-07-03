
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartIcon, BrokenHeartIcon } from '@/components/icons';
import { MapPin, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { likeUser, dislikeUser } from '@/app/(app)/home/actions';
import type { UserProfile as UserProfileType } from '@/types';

type UserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  imageUrl: string;
  aiHint: string;
  verificationStatus?: UserProfileType['verificationStatus'];
};

type ProfileCardProps = {
  user: UserProfile;
  onDismiss?: (userId: string) => void;
};

export function ProfileCard({ user, onDismiss }: ProfileCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const handleAction = (actionPromise: Promise<any>) => {
    setIsDismissed(true); // Start animation immediately
    actionPromise.finally(() => {
        // After server action is complete, remove from DOM
        setTimeout(() => {
          onDismiss?.(user.id);
        }, 300); // match animation duration
    });
  };
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isProcessing || !currentUser) {
      if (!currentUser) {
         toast({ variant: 'destructive', title: 'You must be logged in to like profiles.' });
      }
      return;
    };
    setIsProcessing(true);

    const result = await likeUser(currentUser.uid, user.id);

    if (result.success) {
      if (result.isMatch) {
         toast({
          title: "It's a Match!",
          description: `You and ${user.name} have liked each other.`,
          action: (
            <div className="flex items-center text-accent">
                <Heart className="mr-2 h-5 w-5 fill-current" /> Match
            </div>
          ),
        });
      } else {
        toast({
          title: "Liked!",
          description: `You've liked ${user.name}'s profile.`,
        });
      }
      handleAction(Promise.resolve());
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not process like. Please try again.',
      });
    }
    
    setIsProcessing(false);
  }
  
  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
     if (isProcessing || !currentUser) {
      if (!currentUser) {
         toast({ variant: 'destructive', title: 'You must be logged in.' });
      }
      return;
    };
    setIsProcessing(true);
    
    handleAction(dislikeUser(currentUser.uid, user.id));

    // No toast for dislike to keep UI clean
    
    setIsProcessing(false);
  }

  return (
    <Card
      className={cn(
        "group/card overflow-hidden rounded-xl border-0 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        isDismissed && "opacity-0 scale-95 -translate-y-4"
      )}
    >
        <Link href={`/users/${user.id}`} className="block">
            <CardContent className="p-0">
                <div className="relative aspect-[3/4]">
                <Image
                    src={user.imageUrl}
                    alt={user.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                    data-ai-hint={user.aiHint}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-headline text-2xl font-bold text-white">{user.name}, {user.age}</h3>
                        {user.verificationStatus === 'verified' && <ShieldCheck className="h-6 w-6 text-white" title="Verified Profile" />}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-gray-200">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                    </p>
                </div>
                </div>
            </CardContent>
        </Link>
      {onDismiss && (
        <CardFooter className="flex justify-around bg-card p-2">
          <Button
            variant="ghost"
            size="icon"
            className="group/action text-muted-foreground hover:bg-transparent hover:text-destructive"
            onClick={handleDislike}
            aria-label="Dislike"
            disabled={isProcessing}
          >
            <BrokenHeartIcon className="h-8 w-8 transition-transform group-hover/action:scale-110" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="group/action text-muted-foreground hover:bg-transparent hover:text-green-500"
            onClick={handleLike}
            aria-label="Like"
            disabled={isProcessing}
          >
            <HeartIcon className="h-10 w-10 fill-current text-green-500 opacity-20 transition-all group-hover/action:scale-110 group-hover/action:opacity-100" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
