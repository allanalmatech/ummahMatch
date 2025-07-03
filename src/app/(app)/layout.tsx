
'use client';

import { AppShell } from '@/components/app-shell';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Loading state is now handled by the global splash screen in AuthProvider
  if (loading || !user) {
    return null; // Return null to prevent flicker, splash screen is shown at a higher level
  }

  return <AppShell>{children}</AppShell>;
}
