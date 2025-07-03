
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Check, Rocket, Loader2 } from "lucide-react";
import { FlutterwaveButton } from "@/components/flutterwave-button";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/services/user-service';
import { useBoost } from './actions';
import type { UserProfile } from '@/types';

const boostPackages = [
    {
        id: "boost-1",
        name: "Single Boost",
        price: 1.99,
        priceText: "$1.99",
        features: [
            "1 Profile Boost",
            "Appear at the top for 30 minutes",
            "Get up to 10x more profile views",
        ],
        cta: "Get 1 Boost"
    },
    {
        id: "boost-5",
        name: "5 Boosts Pack",
        price: 7.99,
        priceText: "$7.99",
        features: [
            "5 Profile Boosts",
            "Save 20%",
            "Use anytime you want",
            "Great for prime time visibility",
        ],
        cta: "Get 5 Boosts",
        popular: true
    },
    {
        id: "boost-10",
        name: "10 Boosts Pack",
        price: 12.99,
        priceText: "$12.99",
        features: [
            "10 Profile Boosts",
            "Save over 30%",
            "Maximize your matches",
            "Best value for serious searchers",
        ],
        cta: "Get 10 Boosts"
    }
];

function BoostBalanceCard({ initialProfile, onBoostUsed }: { initialProfile: UserProfile | null, onBoostUsed: () => void }) {
    const { toast } = useToast();
    const [isUsingBoost, setIsUsingBoost] = useState(false);
    const boostCount = initialProfile?.boosts || 0;
    const isBoostActive = initialProfile?.boostActiveUntil && initialProfile.boostActiveUntil.toDate() > new Date();

    const handleUseBoost = async () => {
        if (!initialProfile?.id) return;
        setIsUsingBoost(true);
        const result = await useBoost(initialProfile.id);
        if (result.success) {
            toast({
                title: "Boost Activated!",
                description: result.message,
            });
            onBoostUsed(); // Trigger re-fetch on parent
        } else {
            toast({
                variant: 'destructive',
                title: "Failed to Activate Boost",
                description: result.error,
            });
        }
        setIsUsingBoost(false);
    };

    return (
        <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-6 w-6 text-primary" />
                    Your Boost Balance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold">{boostCount}</p>
                <p className="text-muted-foreground">Boosts available to use.</p>
                {isBoostActive && (
                     <p className="mt-2 text-sm text-accent font-semibold">
                        Your profile is currently boosted!
                    </p>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleUseBoost}
                    disabled={boostCount === 0 || isUsingBoost || isBoostActive}
                    className="w-full sm:w-auto"
                >
                    {isUsingBoost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Use a Boost Now
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function BoostPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
            setProfile(userProfile as UserProfile);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) {
        return (
             <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto">
            <header className="mb-12 text-center">
                <h1 className="font-headline text-4xl font-bold md:text-5xl">Boost Your Profile</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Get noticed by more people. A Boost shows your profile to more people in your area for 30 minutes.</p>
            </header>
            
            <BoostBalanceCard initialProfile={profile} onBoostUsed={fetchProfile} />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {boostPackages.map((pkg) => (
                    <Card key={pkg.name} className={`flex flex-col shadow-lg ${pkg.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
                         {pkg.popular && (
                            <div className="py-2 px-4 bg-primary text-primary-foreground text-center font-semibold text-sm rounded-t-lg">
                                Most Popular
                            </div>
                        )}
                        <CardHeader className="items-center text-center">
                            <CardTitle className="font-headline text-3xl">{pkg.name}</CardTitle>
                            <CardDescription className="text-4xl font-bold text-foreground">{pkg.priceText}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-3 mt-1 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <FlutterwaveButton item={pkg} user={user} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
             <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>Boosts are a one-time purchase and are not subscriptions. Payments are processed securely.</p>
            </div>
        </div>
    );
}
