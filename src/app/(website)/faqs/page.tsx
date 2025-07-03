

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollToTop } from "@/components/scroll-to-top";

const faqs = [
    {
        question: "How does UmmahMatch work?",
        answer: "UmmahMatch helps you find compatible partners based on your profile and preferences. You can create a detailed profile, search for other users, like profiles, and once you have a mutual match and a premium subscription, you can start messaging.",
    },
    {
        question: "Is UmmahMatch free to use?",
        answer: "You can sign up, create a profile, and browse other profiles for free. However, to send messages and access premium features like seeing who liked you, you will need to subscribe to one of our plans.",
    },
    {
        question: "How do I verify my profile?",
        answer: "You can verify your profile by going to the 'Verification' page from your account menu. You'll be asked to take a live photo to prove you are a real person. Our team will review the photo and apply a verification badge to your profile upon approval.",
    },
    {
        question: "How can I report a user or content?",
        answer: "If you encounter a profile or message that violates our terms of service, you can report it directly from the user's profile page. Click the 'Report' button and provide the necessary details. Our moderation team takes all reports seriously.",
    },
    {
        question: "What are your subscription plans?",
        answer: "We offer several subscription plans, including Premium, Gold, and Platinum. Each plan unlocks different features to enhance your experience. You can find detailed information about each plan on our 'Subscription' page.",
    },
    {
        question: "How can I delete my account?",
        answer: "You can deactivate or permanently delete your account from the 'Settings' page. Please be aware that deleting your account is an irreversible action and will remove all your data from our platform.",
    },
];


export default function FaqPage() {
  return (
    <>
        <main className="container mx-auto max-w-4xl py-12 px-4 flex-grow">
        <header className="mb-8 text-center">
            <h1 className="font-headline text-4xl font-bold">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mt-2">Find answers to common questions about UmmahMatch.</p>
        </header>
        <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-semibold text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                {faq.answer}
                </AccordionContent>
            </AccordionItem>
            ))}
        </Accordion>
        <div className="mt-12 text-center">
            <p className="text-muted-foreground">Can't find the answer you're looking for?</p>
            <Button asChild className="mt-4">
            <Link href="/about">Contact Us</Link>
            </Button>
        </div>
        </main>
      <ScrollToTop />
    </>
  );
}
