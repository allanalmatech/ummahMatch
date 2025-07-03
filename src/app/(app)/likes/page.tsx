

'use client';

import { useState, useEffect } from 'react';
import { ProfileCard } from '@/components/profile-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Heart, UserCheck, UserPlus, Frown, Loader2, Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getUsersWhoLikedMe, getUsersILiked, getMyMatches } from '@/services/like-service';
import { getProfileViewers } from '@/services/view-service';
import { getMyFavorites } from '@/services/favorite-service';
import { getUserProfile } from '@/services/user-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserProfile } from '@/types';

// Define a common user type for this page
type DisplayUser = {
  id: string;
  name: string;
  age: number;
  location: string;
  imageUrl: string;
  aiHint: string;
  verificationStatus?: UserProfile['verificationStatus'];
};

// Map Firestore data to DisplayUser
const formatUser = (user: any): DisplayUser => ({
  id: user.id,
  name: user.name || 'Anonymous',
  age: user.age || 0,
  location: (user.city && user.country) ? `${user.city}, ${user.country}` : 'Unknown Location',
  imageUrl: user.imageUrl || 'https://placehold.co/600x800.png',
  aiHint: user.gender === 'male' ? 'man portrait' : 'woman portrait',
  verificationStatus: user.verificationStatus || 'unverified',
});

function ProfileGrid({ users, emptyTitle, emptyDescription }: { users: DisplayUser[], emptyTitle: string, emptyDescription: string }) {
    if (users.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center text-center h-48 bg-muted/30 col-span-full">
                <Frown className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-headline text-2xl font-bold">{emptyTitle}</h3>
                <p className="text-muted-foreground">{emptyDescription}</p>
            </Card>
        )
    }

    return (
        <>
            {users.map(user => (
              <ProfileCard key={user.id} user={user} />
            ))}
        </>
    )
}


export default function LikesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<DisplayUser[]>([]);
  const [likedBy, setLikedBy] = useState<DisplayUser[]>([]);
  const [liked, setLiked] = useState<DisplayUser[]>([]);
  const [viewers, setViewers] = useState<DisplayUser[]>([]);
  const [favorites, setFavorites] = useState<DisplayUser[]>([]);
  const [subscription, setSubscription] = useState<UserProfile['subscription']>('Free');
  const [loading, setLoading] = useState(true);

  const isPremiumTier = subscription === 'Gold' || subscription === 'Platinum';
  const ungatedPreviewLimit = 2;

  const hiddenLikesCount = Math.max(0, likedBy.length - ungatedPreviewLimit);
  const hiddenViewersCount = Math.max(0, viewers.length - ungatedPreviewLimit);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
            profileData,
            matchesData,
            likedByData,
            likedData,
            viewersData,
            favoritesData
        ] = await Promise.all([
          getUserProfile(user.uid),
          getMyMatches(user.uid),
          getUsersWhoLikedMe(user.uid),
          getUsersILiked(user.uid),
          getProfileViewers(user.uid),
          getMyFavorites(user.uid),
        ]);
        
        if (profileData) {
            setSubscription((profileData as UserProfile).subscription || 'Free');
        }
        
        setMatches(matchesData.map(formatUser));
        setLikedBy(likedByData.map(formatUser));
        setLiked(likedData.map(formatUser));
        setViewers(viewersData.map(formatUser));
        setFavorites(favoritesData.map(formatUser));

      } catch (error) {
        console.error("Failed to fetch connections data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user]);

  return (
    <div className="container mx-auto">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-5xl flex items-center justify-center gap-3"><Heart className="h-10 w-10 text-destructive" /> Connections</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Manage your matches, likes, and profile viewers.</p>
      </header>

      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="matches"><UserCheck className="mr-2" /> Matches ({matches.length})</TabsTrigger>
          <TabsTrigger value="likes-received"><Heart className="mr-2" /> Likes Received ({likedBy.length})</TabsTrigger>
          <TabsTrigger value="likes-sent"><UserPlus className="mr-2" /> Likes Sent ({liked.length})</TabsTrigger>
          <TabsTrigger value="favorites"><Star className="mr-2" /> Favorites ({favorites.length})</TabsTrigger>
          <TabsTrigger value="viewers"><Eye className="mr-2" /> Viewers ({viewers.length})</TabsTrigger>
        </TabsList>
        
        {loading ? (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : (
            <>
                <TabsContent value="matches" className="mt-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProfileGrid users={matches} emptyTitle="No Matches Yet" emptyDescription="Keep liking profiles! A mutual like will appear here as a match." />
                    </div>
                </TabsContent>
                <TabsContent value="likes-received" className="mt-6">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProfileGrid 
                          users={isPremiumTier ? likedBy : likedBy.slice(0, ungatedPreviewLimit)} 
                          emptyTitle="No Likes Received Yet" 
                          emptyDescription="When someone likes your profile, they will show up here." 
                        />

                        {!isPremiumTier && hiddenLikesCount > 0 && (
                          <div className="relative col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2">
                             <Card className="flex flex-col items-center justify-center text-center p-8 bg-muted/30 h-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-md z-10 rounded-lg" />
                                <div className="relative z-20">
                                    <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <h2 className="font-headline text-3xl font-bold">Unlock {hiddenLikesCount} More Likes</h2>
                                    <p className="text-muted-foreground mt-2 mb-6">Someone's interested! Upgrade to Gold to see everyone who has liked you and match instantly.</p>
                                    <Button size="lg" asChild>
                                        <Link href="/subscription">
                                            Upgrade to Gold
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                          </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="likes-sent" className="mt-6">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProfileGrid users={liked} emptyTitle="No Likes Sent" emptyDescription="Profiles you like will appear here so you can keep track." />
                    </div>
                </TabsContent>
                 <TabsContent value="favorites" className="mt-6">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProfileGrid users={favorites} emptyTitle="No Favorites Yet" emptyDescription="Profiles you add to your favorites will appear here." />
                    </div>
                </TabsContent>
                <TabsContent value="viewers" className="mt-6">
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        <ProfileGrid 
                          users={isPremiumTier ? viewers : viewers.slice(0, ungatedPreviewLimit)} 
                          emptyTitle="No Profile Views Yet" 
                          emptyDescription="When someone views your profile, they'll appear here." 
                        />
                        
                        {!isPremiumTier && hiddenViewersCount > 0 && (
                             <div className="relative col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-2">
                             <Card className="flex flex-col items-center justify-center text-center p-8 bg-muted/30 h-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-md z-10 rounded-lg" />
                                <div className="relative z-20">
                                    <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
                                    <h2 className="font-headline text-3xl font-bold">See Who Viewed You</h2>
                                    <p className="text-muted-foreground mt-2 mb-6">Upgrade to Gold to see all {hiddenViewersCount} people who viewed your profile and get more attention.</p>
                                    <Button size="lg" asChild>
                                        <Link href="/subscription">
                                            See All Viewers
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                          </div>
                        )}
                    </div>
                </TabsContent>
            </>
        )}
      </Tabs>
    </div>
  );
}

    
