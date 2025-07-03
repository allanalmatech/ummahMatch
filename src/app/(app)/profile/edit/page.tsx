
'use client';

import { ProfileForm } from '@/app/(app)/profile/create/profile-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/user-service';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ProfileFormValues } from '@/app/(app)/profile/create/profile-form';

export default function EditProfilePage() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<Partial<ProfileFormValues> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then(data => {
                if (data) {
                    setProfileData(data as Partial<ProfileFormValues>);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
        } else if (!user && !loading) {
            // If there's no user and we're not in an initial loading state, stop loading.
            setLoading(false);
        }
    }, [user, loading]);

    return (
        <div className="mx-auto max-w-4xl">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{profileData ? 'Edit Your Profile' : 'Create Your Profile'}</CardTitle>
                    <CardDescription>
                       {profileData ? 'Keep your profile up to date to attract the best matches.' : "Tell us about yourself to find the best matches. Your journey to finding a partner starts here."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ProfileForm profile={profileData} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
