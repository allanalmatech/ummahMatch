

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartHandshake, ShieldCheck, Lock } from 'lucide-react';
import { ScrollToTop } from '@/components/scroll-to-top';

const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.33,12.2c-0.05-2.23,1.68-3.33,1.85-3.43c-1.48-1.7-3.63-1.93-4.48-1.93c-1.85,0-3.5,1.08-4.5,1.08 c-1.03,0-2.33-1.05-3.83-1.05c-1.88,0-3.63,1-4.7,2.55c-2.13,3.08-0.55,7.5,1.53,10.03c1.03,1.25,2.23,2.6,3.7,2.58 c1.43-0.03,1.98-0.95,3.78-0.95c1.8,0,2.3,0.95,3.83,0.95c1.58,0,2.65-1.28,3.63-2.6c1.1-1.45,1.6-2.9,1.68-3 c-0.05-0.03-3.08-1.23-3.13-4.78V12.2z M16.6,6.95c0.83-1.03,1.35-2.45,1.25-3.85c-1.4,0.1-2.9,0.98-3.75,2 c-0.75,0.9-1.4,2.33-1.25,3.73C14.25,8.8,15.75,7.95,16.6,6.95z"/></svg>
);

const GooglePlayIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.64,10.37,5.36,1.45a2.38,2.38,0,0,0-1.23.33,2.44,2.44,0,0,0-1.21,2.12V20.1a2.44,2.44,0,0,0,1.21,2.12,2.38,2.38,0,0,0,1.23.33L20.64,13.63a2.44,2.44,0,0,0,0-3.26ZM5,20.11V3.89L18.2,12Z"/></svg>
);

const features = [
  {
    icon: <HeartHandshake className="h-10 w-10 text-primary" />,
    title: "Purposeful Connections",
    description: "Connect with Muslims who share your values and are serious about finding a life partner.",
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Verified Profiles",
    description: "Our verification process helps build a trusted community, so you can connect with confidence.",
  },
  {
    icon: <Lock className="h-10 w-10 text-primary" />,
    title: "Private & Secure",
    description: "Your privacy is our priority. Control who sees your profile and communicate securely.",
  },
];

const testimonials = [
  {
    name: "Aisha & Yusuf",
    location: "London, UK",
    avatar: "https://placehold.co/100x100.png",
    aiHint: "happy couple",
    quote: "We found each other on UmmahMatch and couldn't be happier. The focus on shared values made all the difference. Alhamdulillah!",
  },
  {
    name: "Fatima",
    location: "Toronto, CA",
    avatar: "https://placehold.co/100x100.png",
    aiHint: "woman portrait",
    quote: "As a busy professional, I appreciated the serious and respectful community on UmmahMatch. I met my husband here after just a few months.",
  },
];

export default function LandingPage() {
  return (
    <>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center bg-muted/30">
          <div className="container">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter">
              Your Journey to Nikah Starts Here
            </h1>
            <p className="mt-4 mx-auto max-w-2xl text-lg text-muted-foreground">
              The modern, halal way to meet single Muslims who are serious about commitment and marriage, guided by Islamic principles.
            </p>
            <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
              <Button size="lg" asChild className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                  <AppleIcon />
                  <div className="text-left ml-2">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </Link>
              </Button>
              <Button size="lg" asChild className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer">
                  <GooglePlayIcon />
                  <div className="text-left ml-2">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold -mt-1">Google Play</div>
                  </div>
                </Link>
              </Button>
            </div>
             <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <Image src="https://placehold.co/400x500.png" alt="Happy Muslim user 1" data-ai-hint="happy man prayer" width={400} height={500} className="rounded-xl shadow-lg object-cover w-full h-full" />
                <Image src="https://placehold.co/400x500.png" alt="Happy Muslim user 2" data-ai-hint="happy woman hijab" width={400} height={500} className="rounded-xl shadow-lg object-cover w-full h-full mt-8" />
                <Image src="https://placehold.co/400x500.png" alt="Happy Muslim user 3" data-ai-hint="smiling woman coffee" width={400} height={500} className="rounded-xl shadow-lg object-cover w-full h-full" />
                <Image src="https://placehold.co/400x500.png" alt="Happy Muslim user 4" data-ai-hint="smiling man outside" width={400} height={500} className="rounded-xl shadow-lg object-cover w-full h-full mt-8" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="font-headline text-4xl font-bold">Why UmmahMatch?</h2>
                <p className="mt-4 text-lg text-muted-foreground">We built a platform focused on trust, privacy, and meaningful connections to help you find your life partner.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center shadow-md hover:shadow-xl transition-shadow p-6">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
            <div className="container text-center">
                <h2 className="font-headline text-4xl font-bold">Start Your Journey in 3 Simple Steps</h2>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">1</div>
                            <h3 className="font-headline text-2xl font-semibold">Create Your Profile</h3>
                        </div>
                        <p className="mt-4 text-muted-foreground">Sign up for free and build a detailed profile that truly represents you, your values, and what you're looking for in a partner.</p>
                    </div>
                     <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">2</div>
                            <h3 className="font-headline text-2xl font-semibold">Find Your Match</h3>
                        </div>
                        <p className="mt-4 text-muted-foreground">Use our search filters to browse profiles, discover compatible matches, and express your interest securely and privately.</p>
                    </div>
                     <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">3</div>
                            <h3 className="font-headline text-2xl font-semibold">Begin Your Story</h3>
                        </div>
                        <p className="mt-4 text-muted-foreground">Once you match, start a conversation. Get to know each other with the intention of marriage, insha'Allah.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="font-headline text-4xl font-bold">Success Stories</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Alhamdulillah, many have found their life partners through UmmahMatch. Here’s what they have to say.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {testimonials.map((testimonial) => (
                        <Card key={testimonial.name} className="p-6 shadow-md">
                            <CardContent className="p-0">
                                <p className="text-muted-foreground italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div className="flex items-center gap-4 mt-6">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} data-ai-hint={testimonial.aiHint} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

         {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto text-center">
                 <h2 className="font-headline text-3xl font-bold">Ready to Find Your Partner?</h2>
                <p className="mt-2 text-muted-foreground">Join thousands of single Muslims on the same journey. Download the app today.</p>
                 <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
                  <Button size="lg" asChild className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                      <AppleIcon />
                      <div className="text-left ml-2">
                        <div className="text-xs">Download on the</div>
                        <div className="text-lg font-semibold -mt-1">App Store</div>
                      </div>
                    </Link>
                  </Button>
                  <Button size="lg" asChild className="h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
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
        </section>

      </main>

      <ScrollToTop />
    </>
  )
}
