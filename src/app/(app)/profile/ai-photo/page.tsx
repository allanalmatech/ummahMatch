'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Crown, Upload, Sparkles, Wand2, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { generateAiPhotoAction, setProfilePictureAction } from './actions';
import Link from 'next/link';

function PhotoUploader({ onFileSelect, disabled }: { onFileSelect: (file: File) => void, disabled: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    
    return (
        <div className="relative group">
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={disabled}
            />
            <Card 
                className="aspect-square w-full cursor-pointer rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors"
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <CardContent className="flex h-full w-full items-center justify-center p-6">
                    <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold text-lg">Click to upload a photo</p>
                        <p className="mt-1 text-sm">Choose a clear, well-lit headshot for best results.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AiPhotoPage() {
    const { user } = useAuth();
    const { toast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    
    const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
    const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            setLoadingProfile(true);
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                setProfile(userProfile as UserProfile);
            }
            setLoadingProfile(false);
        };
        fetchProfile();
    }, [user]);

    const handleFileSelect = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setOriginalPhoto(reader.result as string);
            setGeneratedPhoto(null); // Reset generated photo if a new one is uploaded
        };
        reader.readAsDataURL(file);
    };

    const handleGenerate = async () => {
        if (!originalPhoto) {
            toast({ variant: 'destructive', title: 'Please upload a photo first.' });
            return;
        }
        setIsGenerating(true);
        const result = await generateAiPhotoAction({ photoDataUri: originalPhoto });
        if (result.success && result.photo) {
            setGeneratedPhoto(result.photo);
            toast({ title: 'Photo Generated!', description: 'Your new AI-powered profile picture is ready.' });
        } else {
            toast({ variant: 'destructive', title: 'Generation Failed', description: result.error });
        }
        setIsGenerating(false);
    };

    const handleSave = async () => {
        if (!generatedPhoto || !user) return;
        setIsSaving(true);
        const result = await setProfilePictureAction(user.uid, generatedPhoto);
        if (result.success) {
            toast({ title: 'Profile Picture Updated!', description: 'Your new photo is now live.' });
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: result.error });
        }
        setIsSaving(false);
    };
    
    if (loadingProfile) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    // Gating the feature for Platinum users
    if (profile?.subscription !== 'Platinum') {
        return (
            <div className="container mx-auto max-w-2xl">
                <Card className="text-center">
                    <CardHeader>
                        <Crown className="mx-auto h-16 w-16 text-primary" />
                        <CardTitle className="font-headline text-3xl mt-4">AI Photo Studio</CardTitle>
                        <CardDescription>This is a Platinum-exclusive feature.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Upgrade to our Platinum plan to use the AI Photo Studio and create a stunning, professional profile picture that gets you noticed.</p>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" asChild className="w-full">
                            <Link href="/subscription">Upgrade to Platinum</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto max-w-5xl space-y-8">
             <header className="text-center">
                <h1 className="font-headline text-4xl font-bold md:text-5xl flex items-center justify-center gap-3"><Wand2 className="h-10 w-10 text-primary" /> AI Photo Studio</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Let our AI enhance your profile picture. Upload a clear photo of yourself to get started.</p>
            </header>

            {!generatedPhoto ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <PhotoUploader onFileSelect={handleFileSelect} disabled={isGenerating} />
                    </div>
                    <div>
                        {originalPhoto && (
                            <div className="space-y-4">
                                <Card>
                                    <CardContent className="p-4 text-center">
                                        <h3 className="font-headline text-xl mb-4">Ready to Transform?</h3>
                                        <Image src={originalPhoto} alt="Uploaded preview" width={300} height={300} className="rounded-lg mx-auto aspect-square object-cover" />
                                    </CardContent>
                                </Card>
                                 <Button size="lg" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2" />}
                                    {isGenerating ? 'Generating Your Photo...' : 'Generate AI Picture'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                 <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                         <Card>
                            <CardHeader className="items-center text-center pb-2">
                                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Your Photo</CardTitle>
                            </CardHeader>
                             <CardContent className="p-4">
                                 <Image src={originalPhoto!} alt="Original" width={400} height={400} className="rounded-lg mx-auto aspect-square object-cover" />
                             </CardContent>
                         </Card>
                          <div className="hidden md:flex flex-col items-center justify-center">
                            <ArrowRight className="h-12 w-12 text-muted-foreground" />
                          </div>
                         <Card className="ring-2 ring-primary border-primary">
                            <CardHeader className="items-center text-center pb-2">
                                <CardTitle className="flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5" /> AI Generated</CardTitle>
                            </CardHeader>
                             <CardContent className="p-4">
                                 <Image src={generatedPhoto} alt="Generated" width={400} height={400} className="rounded-lg mx-auto aspect-square object-cover" />
                             </CardContent>
                         </Card>
                     </div>
                     <Card>
                        <CardHeader>
                            <CardTitle>What's Next?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Happy with the result? You can set it as your main profile picture. Or, try generating a new one with a different source photo.</p>
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" variant="outline" className="w-full" onClick={() => { setOriginalPhoto(null); setGeneratedPhoto(null); }}>
                                Start Over
                            </Button>
                            <Button size="lg" className="w-full" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2" />}
                                {isSaving ? 'Saving...' : 'Use this Photo'}
                            </Button>
                        </CardFooter>
                    </Card>
                 </div>
            )}
        </div>
    );
}
