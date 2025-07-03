import { ProfileForm } from './profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateProfilePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create Your Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to find the best matches. Your journey to finding a partner starts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
