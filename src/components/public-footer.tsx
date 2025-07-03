

'use client';

import Link from "next/link";
import { Logo } from "@/components/icons";
import { Facebook, Instagram, Youtube } from 'lucide-react';

export function PublicFooter() {
    return (
         <footer className="bg-muted/30">
            <div className="container mx-auto py-6 text-center text-muted-foreground text-sm border-t">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <Logo className="size-6 w-auto text-muted-foreground" />
                    <span className="font-headline text-lg font-semibold">UmmahMatch</span>
                </div>
                <div className="flex justify-center gap-6 mb-4">
                    <Link href="https://facebook.com/ummahmatch" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                    <Link href="https://instagram.com/ummahmatch" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
                    <Link href="https://youtube.com/ummahmatch" target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
                    <Link href="https://tiktok.com/@ummahmatch" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="font-semibold text-muted-foreground hover:text-primary text-sm flex items-center">TikTok</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} UmmahMatch. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <Link href="/about" className="hover:underline">About</Link>
                    <Link href="/terms" className="hover:underline">Terms</Link>
                    <Link href="/privacy" className="hover:underline">Privacy</Link>
                    <Link href="/faqs" className="hover:underline">FAQs</Link>
                </div>
            </div>
        </footer>
    )
}
