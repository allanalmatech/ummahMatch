
'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#testimonials', label: 'Success Stories' },
    { href: '/about', label: 'About' },
    { href: '/faqs', label: 'FAQs' },
];

export function PublicHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="container mx-auto flex h-20 items-center justify-between px-4">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="size-8 w-auto text-primary" />
        <span className="font-headline text-2xl font-bold">UmmahMatch</span>
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            {link.label}
          </Link>
        ))}
         <ThemeToggle />
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
         <ThemeToggle />
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="sr-only">
              <SheetTitle>Main Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-6">
                <Link href="/" className="flex items-center gap-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo className="size-8 w-auto text-primary" />
                    <span className="font-headline text-2xl font-bold">UmmahMatch</span>
                </Link>
                {navLinks.map((link) => (
                <Link 
                    key={link.href} 
                    href={link.href} 
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {link.label}
                </Link>
                ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
