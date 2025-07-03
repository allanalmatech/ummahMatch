
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProfileCard } from '@/components/profile-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getDiscoverFeed } from '@/services/user-service';
import { Loader2, Frown, Sparkles, BrainCircuit, ShieldCheck, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { getAiMatches } from './actions';
import type { UserProfile } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// This is the shape the ProfileCard and carousels expect
type DisplayUser = {
  id: string;
  name: string;
  age: number;
  location: string;
  imageUrl: string;
  aiHint: string;
  verificationStatus?: UserProfile['verificationStatus'];
};

// Define the shape for AI matches
type AiMatch = UserProfile & {
  score: number;
  reason: string;
};

// NEW COMPONENT: TopPickCard
function TopPickCard({ match }: { match: AiMatch }) {
  return (
    <Card className="group/card overflow-hidden rounded-xl border-0 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-full flex flex-col">
       <Link href={`/users/${match.id}`} className="block flex-grow">
          <CardContent className="p-0 h-full">
            <div className="relative aspect-[3/4] h-full">
               <Image
                  src={match.imageUrl || 'https://placehold.co/600x800.png'}
                  alt={match.name || 'Profile photo'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                  data-ai-hint={match.aiHint}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-2">
                      <h3 className="font-headline text-2xl font-bold text-white">{match.name}, {match.age}</h3>
                      {match.verificationStatus === 'verified' && <ShieldCheck className="h-6 w-6 text-white" title="Verified Profile" />}
                  </div>
              </div>
            </div>
          </CardContent>
      </Link>
      <CardFooter className="flex flex-col items-start gap-2 bg-card p-4 border-t">
        <div className="flex items-center justify-between w-full">
          <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
            <Sparkles className="h-4 w-4 mr-1.5 text-accent" />
            {match.score}% Match
          </Badge>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {match.location}
          </p>
        </div>
        <p className="text-sm text-muted-foreground italic">&quot;{match.reason}&quot;</p>
      </CardFooter>
    </Card>
  )
}


// NEW COMPONENT: TopPicksSection
function TopPicksSection() {
    const { user: currentUser } = useAuth();
    const [aiMatches, setAiMatches] = useState<AiMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        async function fetchAiMatches() {
            setLoading(true);
            const result = await getAiMatches(currentUser!.uid);
            if (result.success) {
                setAiMatches(result.matches as AiMatch[]);
            } else {
                console.error("Failed to fetch AI matches:", result.error);
            }
            setLoading(false);
        }

        fetchAiMatches();
    }, [currentUser]);

    if (loading) {
        return (
            <section>
                <header className="mb-8">
                    <h2 className="font-headline text-3xl font-bold flex items-center gap-2">
                        <BrainCircuit className="h-8 w-8 text-primary"/> Top Picks For You
                    </h2>
                    <p className="text-muted-foreground">AI-powered recommendations based on your profile.</p>
                </header>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="rounded-xl shadow-lg">
                             <CardContent className="p-0">
                                <div className="relative aspect-[3/4]">
                                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 animate-spin text-primary" />
                                </div>
                             </CardContent>
                             <CardFooter className="h-[108px] bg-card p-4 border-t" />
                        </Card>
                    ))}
                </div>
            </section>
        )
    }

    if (aiMatches.length === 0) {
        return null; // Don't show the section if there are no matches
    }

    return (
        <section>
             <header className="mb-8">
                <h2 className="font-headline text-3xl font-bold flex items-center gap-2">
                     <BrainCircuit className="h-8 w-8 text-primary"/> Top Picks For You
                </h2>
                <p className="text-muted-foreground">AI-powered recommendations based on your profile.</p>
            </header>
            <Carousel
                opts={{ align: "start", loop: aiMatches.length > 3 }}
                className="w-full"
            >
                <CarouselContent className="-ml-1">
                    {aiMatches.map((match) => (
                        <CarouselItem key={match.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-1">
                            <div className="p-1 h-full">
                                <TopPickCard match={match} />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>
    );
}


export default function HomePage() {
  const { user: currentUser } = useAuth();
  const [visibleUsers, setVisibleUsers] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
        setLoading(false);
        return;
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getDiscoverFeed(currentUser.uid);
        
        // Map Firestore data to the format needed by the UI
        const formattedUsers: DisplayUser[] = fetchedUsers.map((user: any) => ({
          id: user.id,
          name: user.name || 'Anonymous',
          age: user.age || 0,
          location: (user.city && user.country) ? `${user.city}, ${user.country}` : 'Unknown Location',
          imageUrl: user.imageUrl || 'https://placehold.co/600x800.png', // Use placeholder
          aiHint: user.gender === 'male' ? 'man portrait' : 'woman portrait', // Use gender for hint
          verificationStatus: user.verificationStatus || 'unverified',
        }));

        setVisibleUsers(formattedUsers);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Could not load profiles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleDismiss = (userId: string) => {
    // This just hides the user from the main grid for a smooth animation
    // The actual dislike/like is persisted via server action in the card
    setVisibleUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };
  
  // Create subsets for carousels from the fetched users
  const newestUsers = [...visibleUsers].slice(0, 8);


  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
       <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="container mx-auto space-y-12">
      <section>
        <header className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Discover</h1>
          <p className="text-muted-foreground">Browse profiles of Muslims seeking serious relationships.</p>
        </header>
        {visibleUsers.length > 0 ? (
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleUsers.map(user => (
              <ProfileCard key={user.id} user={user} onDismiss={handleDismiss} />
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center text-center h-[30vh] border rounded-lg bg-muted/20">
            <Frown className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-headline text-3xl font-bold">That's everyone for now!</h2>
            <p className="text-muted-foreground">You've reviewed all the current profiles. Check back later for new members.</p>
          </div>
        )}
      </section>

      <TopPicksSection />

      {newestUsers.length > 0 && (
        <section>
            <header className="mb-8">
            <h2 className="font-headline text-3xl font-bold">Newest Members</h2>
            <p className="text-muted-foreground">Be the first to connect with new members.</p>
            </header>
            <Carousel
            opts={{ align: "start", loop: newestUsers.length > 3 }}
            className="w-full"
            >
            <CarouselContent>
                {newestUsers.map((user) => (
                <CarouselItem key={user.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                    <div className="p-1">
                    <ProfileCard user={user} onDismiss={handleDismiss} />
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>
      )}

    </div>
  );
}
