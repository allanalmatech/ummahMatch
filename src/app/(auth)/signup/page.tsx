import Link from 'next/link';
import { SignUpForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from '@/components/icons';

export default function SignUpPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-12 w-auto text-primary" />
        </Link>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
          <CardDescription>
            Join UmmahMatch today to start your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
