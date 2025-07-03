'use client';

import Link from 'next/link';
import { Users, Shield, Settings, BarChart, Loader2, CreditCard } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/services/user-service';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    if (loading) {
      return; // Wait for auth state
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminRole = async () => {
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.push('/home'); // Not an admin, redirect
        }
      } catch (error) {
         console.error("Error checking admin role:", error);
         router.push('/login'); // Redirect on error
      }
    };

    checkAdminRole();

  }, [user, loading, router]);
  
   if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin/analytics" className="flex items-center gap-2 font-semibold">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg">Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
            <Link href="/admin/analytics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <BarChart className="h-4 w-4" />
                Analytics
            </Link>
            <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Users className="h-4 w-4" />
                Users
            </Link>
            <Link href="/admin/moderation" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Shield className="h-4 w-4" />
                Moderation
            </Link>
            <Link href="/admin/sales" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <CreditCard className="h-4 w-4" />
                Sales
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                <Settings className="h-4 w-4" />
                Settings
            </Link>
            </nav>
        </div>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
             {/* Can add header content here, like a search bar or user menu */}
        </header>
        <main className="flex-1 p-6 bg-muted/40">
            {children}
        </main>
      </div>
    </div>
  )
}
