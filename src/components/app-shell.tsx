
'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Crown,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PanelLeft,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  User,
  Wand2,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/likes', label: 'Likes', icon: Heart },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { user, logout, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  }

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendVerificationEmail(user);
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the verification link.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to send verification email. Please try again later.",
        });
      }
    }
  };

  return (
    <SidebarProvider>
      <Sidebar
        className="border-r bg-card"
        collapsible="icon"
      >
        <SidebarContent className="p-2 flex flex-col">
          <div>
            <SidebarHeader className="p-2">
              <Link href="/home" className="flex items-center gap-2">
                <Logo className="size-8 w-auto text-primary" />
                <span className="font-headline text-xl font-semibold group-data-[collapsible=icon]:hidden">
                  UmmahMatch
                </span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    className={cn(
                      "data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
          <div className="mt-auto">
            <SidebarFooter>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL ?? undefined} />
                        <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/verify">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Verification</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/profile/ai-photo">
                      <Wand2 className="mr-2 h-4 w-4" />
                      <span>AI Photo Studio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/subscription">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/boost">
                      <Rocket className="mr-2 h-4 w-4" />
                      <span>Boost Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background">
        {isMobile && (
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:hidden">
            <Link href="/home" className="flex items-center gap-2 font-headline text-lg font-bold">
              <Logo className="h-6 w-auto" />
              UmmahMatch
            </Link>
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
          </header>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {user && !user.emailVerified && (
            <Alert variant="default" className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600">
                <AlertTitle className="font-bold">Verify Your Email Address</AlertTitle>
                <AlertDescription>
                    A verification link has been sent to your email. Please check your inbox to complete registration.
                    <Button variant="link" className="p-0 h-auto ml-2 text-yellow-800 font-semibold hover:text-yellow-900" onClick={handleResendVerification}>
                        Resend Email
                    </Button>
                </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
