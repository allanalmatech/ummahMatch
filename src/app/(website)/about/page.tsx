

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { ScrollToTop } from '@/components/scroll-to-top';

const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.33,12.2c-0.05-2.23,1.68-3.33,1.85-3.43c-1.48-1.7-3.63-1.93-4.48-1.93c-1.85,0-3.5,1.08-4.5,1.08 c-1.03,0-2.33-1.05-3.83-1.05c-1.88,0-3.63,1-4.7,2.55c-2.13,3.08-0.55,7.5,1.53,10.03c1.03,1.25,2.23,2.6,3.7,2.58 c1.43-0.03,1.98-0.95,3.78-0.95c1.8,0,2.3,0.95,3.83,0.95c1.58,0,2.65-1.28,3.63-2.6c1.1-1.45,1.6-2.9,1.68-3 c-0.05-0.03-3.08-1.23-3.13-4.78V12.2z M16.6,6.95c0.83-1.03,1.35-2.45,1.25-3.85c-1.4,0.1-2.9,0.98-3.75,2 c-0.75,0.9-1.4,2.33-1.25,3.73C14.25,8.8,15.75,7.95,16.6,6.95z"/></svg>
);

const GooglePlayIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.64,10.37,5.36,1.45a2.38,2.38,0,0,0-1.23.33,2.44,2.44,0,0,0-1.21,2.12V20.1a2.44,2.44,0,0,0,1.21,2.12,2.38,2.38,0,0,0,1.23.33L20.64,13.63a2.44,2.44,0,0,0,0-3.26ZM5,20.11V3.89L18.2,12Z"/></svg>
);


export default function AboutPage() {
  return (
    <>
    <main className="container mx-auto max-w-5xl py-12 px-4 flex-grow">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl font-bold md:text-5xl">About UmmahMatch</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Connecting Muslims for purposeful relationships leading to marriage.
        </p>
      </header>

      <div className="space-y-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              UmmahMatch is dedicated to helping single Muslims find their life partner in a safe, secure, and faith-aligned environment. We understand the importance of shared values, beliefs, and life goals in a successful marriage. Our platform is designed to facilitate meaningful connections based on deep compatibility, not just superficial swipes.
            </p>
            <p>
              We believe in the beauty of Nikah and are committed to providing a modern tool that respects traditional Islamic principles. Our goal is to be the most trusted platform for Muslims worldwide who are serious about marriage.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Contact Us</CardTitle>
                    <CardDescription>Send us a message directly.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactForm />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Visit Us</CardTitle>
                     <CardDescription>Our office is open for inquiries.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex items-start gap-4">
                        <MapPin className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Our Address</p>
                            <p className="text-muted-foreground">
                                Wakiso, Kira Municipality<br/>
                                Kungu Nanteza Rd, after Kungu Masgid Noor<br/>
                                Uganda
                            </p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <MessageCircle className="h-6 w-6 text-green-500 mt-1" />
                        <div>
                            <p className="font-semibold">WhatsApp & Socials</p>
                            <p className="text-muted-foreground">
                                You can also reach us via{" "}
                                <a href="https://wa.me/256123456789" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WhatsApp</a>
                                {" "}or our social media channels.
                            </p>
                             <div className="flex items-center gap-4 mt-2">
                                <Link href="https://facebook.com/ummahmatch" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
                                <Link href="https://instagram.com/ummahmatch" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
                                <Link href="https://youtube.com/ummahmatch" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
                                <Link href="https://tiktok.com/@ummahmatch" target="_blank" rel="noopener noreferrer" className="font-semibold text-muted-foreground hover:text-primary text-sm">TikTok</Link>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>

      <div className="mt-16 text-center">
        <h2 className="font-headline text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
            <Button size="lg" asChild className="h-14 px-6 bg-black text-white hover:bg-gray-800">
            <Link href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <AppleIcon />
                <div className="text-left ml-2">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold -mt-1">App Store</div>
                </div>
            </Link>
            </Button>
            <Button size="lg" asChild className="h-14 px-6 bg-black text-white hover:bg-gray-800">
            <Link href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
                <GooglePlayIcon />
                <div className="text-left ml-2">
                <div className="text-xs">GET IT ON</div>
                <div className="text-lg font-semibold -mt-1">Google Play</div>
                </div>
            </Link>
            </Button>
        </div>
      </div>
    </main>
    <ScrollToTop />
    </>
  );
}
