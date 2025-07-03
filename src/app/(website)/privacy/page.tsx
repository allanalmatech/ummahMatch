

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function PrivacyPage() {
  return (
     <>
    <main className="container mx-auto max-w-4xl py-12 px-4 flex-grow">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>
      <div className="prose prose-lg max-w-none text-muted-foreground">
        <p>Your privacy is important to us. It is UmmahMatch's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>

        <h2 className="font-headline text-2xl mt-8 text-foreground">1. Information We Collect</h2>
        <p>To provide our services, we collect information that you provide directly to us, such as when you create your profile. This includes:</p>
        <ul>
            <li><strong>Profile Information:</strong> Your name, email, age, gender, location, photos, and other details you add to your profile.</li>
            <li><strong>Communications:</strong> Messages you send and receive through our platform, and communications with our customer support team.</li>
            <li><strong>Technical Data:</strong> We collect technical information from your device, including IP address, browser type, and operating system, to ensure the security and functionality of our services.</li>
            <li><strong>Verification Data:</strong> If you choose to verify your profile, we will collect a photo or video for the purpose of confirming your identity. This data is used solely for verification.</li>
        </ul>

        <h2 className="font-headline text-2xl mt-8 text-foreground">2. How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including:</p>
        <ul>
            <li>To create and manage your account.</li>
            <li>To provide, maintain, and improve our services, including showing you profiles of other members.</li>
            <li>To facilitate communication between users.</li>
            <li>To provide customer support and respond to your requests.</li>
            <li>To monitor and analyze trends, usage, and activities in connection with our Services.</li>
            <li>To detect and prevent fraudulent or unauthorized activity.</li>
        </ul>
        
        <h2 className="font-headline text-2xl mt-8 text-foreground">3. Sharing Your Information</h2>
        <p>We do not share your personal information with third parties except in the following cases:</p>
        <ul>
            <li><strong>With other users:</strong> Your profile information is visible to other users of the service as part of the normal operation of the app.</li>
            <li><strong>For legal reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>With service providers:</strong> We may share information with vendors and service providers who need access to such information to carry out work on our behalf (e.g., payment processing, cloud hosting).</li>
        </ul>

        <h2 className="font-headline text-2xl mt-8 text-foreground">4. Data Security</h2>
        <p>We use commercially reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

        <h2 className="font-headline text-2xl mt-8 text-foreground">5. Your Choices</h2>
        <p>You have the right to access, update, or delete the information we have on you. You can update your profile information at any time through your account settings. If you wish to delete your account, you can do so from the settings page.</p>

        <h2 className="font-headline text-2xl mt-8 text-foreground">6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us through the form on our <Link href="/about" className="text-primary hover:underline">About</Link> page.</p>

        <p className="mt-8 italic">This is a placeholder document. You should consult with a legal professional to draft your official Privacy Policy.</p>
      </div>
      <div className="mt-12">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </main>
    <ScrollToTop />
    </>
  );
}
