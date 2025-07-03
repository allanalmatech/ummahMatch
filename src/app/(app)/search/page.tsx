
'use client';

import { useState } from 'react';
import { SearchForm } from '@/components/search-form';
import { searchProfiles } from './actions';
import { ProfileCard } from '@/components/profile-card';
import { Loader2, Frown, Search as SearchIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile } from '@/types';

type DisplayUser = {
  id: string;
  name: string;
  age: number;
  location: string;
  imageUrl: string;
  aiHint: string;
  verificationStatus?: UserProfile['verificationStatus'];
};

export default function SearchPage() {
  const [results, setResults] = useState<DisplayUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSearch = async (formData: FormData) => {
    setLoading(true);
    setSearched(true);
    setError(null);
    setResults([]);
    
    if (user) {
        formData.append('currentUserId', user.uid);
    }

    const { users, error } = await searchProfiles(formData);

    if (error) {
      setError(error);
    } else if (users) {
      const formattedUsers: DisplayUser[] = users.map((user: any) => ({
        id: user.id,
        name: user.name || 'Anonymous',
        age: user.age || 0,
        location: (user.city && user.country) ? `${user.city}, ${user.country}` : 'Unknown Location',
        imageUrl: user.imageUrl || 'https://placehold.co/600x800.png',
        aiHint: user.gender === 'male' ? 'man portrait' : 'woman portrait',
        verificationStatus: user.verificationStatus || 'unverified',
      }));
      setResults(formattedUsers);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find your ideal partner using our advanced search filters.</p>
      </header>

      <form action={handleSearch}>
        <SearchForm />
      </form>
      
      <div className="mt-12">
        <h2 className="font-headline text-3xl font-bold mb-4">Results</h2>
        {loading && (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map(user => (
              <ProfileCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <Card className="flex flex-col items-center justify-center text-center h-48 bg-muted/30">
            <CardContent className="pt-6">
                <Frown className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                <h3 className="font-headline text-2xl font-bold">No Profiles Found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters to find more people.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !searched && (
            <Card className="flex flex-col items-center justify-center text-center h-48 bg-muted/30">
                <CardContent className="pt-6">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                    <h3 className="font-headline text-2xl font-bold">Find Your Match</h3>
                    <p className="text-muted-foreground">Adjust your filters above and start your search.</p>
                </CardContent>
            </Card>
        )}

        {!loading && error && (
          <Card className="flex flex-col items-center justify-center text-center h-48 bg-destructive/10">
            <CardContent className="pt-6">
                <Frown className="h-12 w-12 text-destructive mb-4 mx-auto" />
                <h3 className="font-headline text-2xl font-bold text-destructive">Search Failed</h3>
                <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
