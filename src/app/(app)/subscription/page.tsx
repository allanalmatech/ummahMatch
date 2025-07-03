
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Check } from "lucide-react";
import { FlutterwaveButton } from "@/components/flutterwave-button";

const plans = [
    {
        id: "premium",
        name: "Premium",
        price: 9.99,
        priceText: "$9.99/month",
        features: [
            "Unlock Basic Messaging",
            "Use Advanced Search Filters",
            "A great starting point!",
        ],
        cta: "Choose Premium"
    },
    {
        id: "gold",
        name: "Gold",
        price: 19.99,
        priceText: "$19.99/month",
        features: [
            "All Premium features",
            "See who liked & viewed you",
            "Unlimited Likes",
            "1 Profile Boost per month",
            "No ads"
        ],
        cta: "Choose Gold",
        popular: true
    },
    {
        id: "platinum",
        name: "Platinum",
        price: 29.99,
        priceText: "$29.99/month",
        features: [
            "All Gold features",
            "AI Photo Studio Access",
            "Featured in Top Picks",
            "5 Profile Boosts per month",
            "See read receipts in messages"
        ],
        cta: "Choose Platinum"
    }
];

export type Plan = typeof plans[0];

export default function SubscriptionPage() {
    const { user } = useAuth();

    return (
        <div className="container mx-auto">
            <header className="mb-12 text-center">
                <h1 className="font-headline text-4xl font-bold md:text-5xl">Upgrade Your Experience</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Choose a plan that fits your needs and increase your chances of finding the one.</p>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.name} className={`flex flex-col shadow-lg ${plan.popular ? 'border-primary ring-2 ring-primary' : ''}`}>
                         {plan.popular && (
                            <div className="py-2 px-4 bg-primary text-primary-foreground text-center font-semibold text-sm rounded-t-lg">
                                Most Popular
                            </div>
                        )}
                        <CardHeader className="items-center text-center">
                            <CardTitle className="font-headline text-3xl">{plan.name}</CardTitle>
                            <CardDescription className="text-4xl font-bold text-foreground">{plan.priceText}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <Check className="h-5 w-5 text-green-500 mr-3 mt-1 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <FlutterwaveButton item={plan} user={user} />
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-12 text-center text-muted-foreground text-sm">
                <p>Payments are processed securely. You can cancel your subscription at any time.</p>
                <p>We accept Visa, MasterCard, PayPal, and Mobile Money.</p>
            </div>
        </div>
    );
}
