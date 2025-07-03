
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/services/user-service';
import type { User } from 'firebase/auth';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async (currentUser: User) => {
      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      } catch (error) {
        console.error("Redirect failed:", error);
        router.push('/home'); // Default redirect on error
      }
    };

    if (!loading && user) {
      checkUserAndRedirect(user);
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
