

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function TermsPage() {
  return (
    <>
      <main className="container mx-auto max-w-4xl py-12 px-4 flex-grow">
        <header className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </header>
        <div className="prose prose-lg max-w-none text-muted-foreground">
          <h2 className="font-headline text-2xl mt-8 text-foreground">1. Introduction</h2>
          <p>Welcome to UmmahMatch. These terms and conditions outline the rules and regulations for the use of UmmahMatch's Website, located at ummahmatch.com. By accessing this website we assume you accept these terms and conditions. Do not continue to use UmmahMatch if you do not agree to take all of the terms and conditions stated on this page.</p>
          
          <h2 className="font-headline text-2xl mt-8 text-foreground">2. User Accounts</h2>
          <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>

          <h2 className="font-headline text-2xl mt-8 text-foreground">3. User Content</h2>
          <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness. By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</p>
          
          <h2 className="font-headline text-2xl mt-8 text-foreground">4. Prohibited Activities</h2>
          <p>You agree not to engage in any of the following prohibited activities: (i) copying, distributing, or disclosing any part of the Service in any medium; (ii) using any automated system, including without limitation "robots," "spiders," "offline readers," etc., to access the Service; (iii) transmitting spam, chain letters, or other unsolicited email; (iv) attempting to interfere with, compromise the system integrity or security or decipher any transmissions to or from the servers running the Service; (v) taking any action that imposes, or may impose at our sole discretion an unreasonable or disproportionately large load on our infrastructure.</p>

          <h2 className="font-headline text-2xl mt-8 text-foreground">5. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

          <h2 className="font-headline text-2xl mt-8 text-foreground">6. Disclaimers</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>

          <h2 className="font-headline text-2xl mt-8 text-foreground">7. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of Uganda, without regard to its conflict of law provisions.</p>
          
          <p className="mt-8 italic">This is a placeholder document. You should consult with a legal professional to draft your official Terms of Service.</p>
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
