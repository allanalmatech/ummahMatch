
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import { ShieldCheck, CheckCircle, Camera, UserCheck, Loader2, PartyPopper } from "lucide-react";
import { requestManualVerification } from './actions';

export default function VerificationPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        const getCameraPermission = async () => {
            if (profile && profile.verificationStatus !== 'unverified' && profile.verificationStatus !== 'rejected') {
                return; // No need for camera if already pending/verified
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
            }
        };
        if (!loadingProfile) {
            getCameraPermission();
        }

        return () => {
            // Cleanup: stop video stream when component unmounts
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [loadingProfile, profile]);

    const handleTakeSnapshot = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setSnapshot(canvas.toDataURL('image/jpeg'));
        }
    };

    const handleSubmitVerification = async () => {
        if (!snapshot || !user) return;
        setIsSubmitting(true);
        const result = await requestManualVerification(user.uid, snapshot);
        if (result.success) {
            toast({
                title: 'Verification Request Sent',
                description: "Our team will review your photo. You'll be notified of the result.",
            });
            // Refetch profile to update status
            const updatedProfile = await getUserProfile(user.uid);
            setProfile(updatedProfile as UserProfile);
        } else {
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: result.error || 'Could not submit your request. Please try again.',
            });
        }
        setIsSubmitting(false);
    };

    if (loadingProfile) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    const verificationStatus = profile?.verificationStatus || 'unverified';

    return (
        <div className="container mx-auto max-w-2xl">
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <ShieldCheck className="mx-auto h-16 w-16 text-primary" />
                    <CardTitle className="font-headline text-3xl mt-4">Profile Verification</CardTitle>
                    <CardDescription>
                        Increase trust and get more matches by verifying your profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {verificationStatus === 'verified' && (
                        <Alert variant="default" className="border-green-500 bg-green-50 text-green-800 [&>svg]:text-green-600">
                             <PartyPopper className="h-4 w-4" />
                            <AlertTitle>You're Verified!</AlertTitle>
                            <AlertDescription>
                                Your profile has the verification badge. You're all set!
                            </AlertDescription>
                        </Alert>
                    )}
                     {verificationStatus === 'pending' && (
                        <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600">
                             <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertTitle>Verification Pending</AlertTitle>
                            <AlertDescription>
                                Your request is under review. We'll notify you once it's processed, usually within 24 hours.
                            </AlertDescription>
                        </Alert>
                    )}
                    {verificationStatus === 'rejected' && (
                         <Alert variant="destructive">
                            <AlertTitle>Verification Request Denied</AlertTitle>
                            <AlertDescription>
                                Unfortunately, we couldn't verify your last submission. Please ensure your photo is clear and try again.
                            </AlertDescription>
                        </Alert>
                    )}

                    {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
                        <>
                            {snapshot ? (
                                <div className="space-y-4 text-center">
                                    <h3 className="font-headline text-xl">Your Snapshot</h3>
                                    <Image src={snapshot} alt="Verification snapshot" width={480} height={360} className="rounded-lg mx-auto" />
                                    <p className="text-sm text-muted-foreground">Looks good? Submit it for review.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-headline text-xl font-semibold text-center">Take a Live Photo</h3>
                                    <p className="text-muted-foreground text-center">To verify you're a real person, please take a clear photo of your face.</p>
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                        {!hasCameraPermission && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4 text-center">
                                                <Camera className="h-10 w-10 mb-2" />
                                                <p className="font-semibold">Camera Access Required</p>
                                                <p className="text-sm">Please enable camera permissions in your browser to continue.</p>
                                            </div>
                                        )}
                                    </div>
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            )}
                        </>
                    )}

                </CardContent>
                {(verificationStatus === 'unverified' || verificationStatus === 'rejected') && (
                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        {snapshot ? (
                            <>
                                <Button size="lg" variant="outline" className="w-full" onClick={() => setSnapshot(null)}>
                                    Retake Photo
                                </Button>
                                <Button size="lg" className="w-full" onClick={handleSubmitVerification} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit for Verification
                                </Button>
                            </>
                        ) : (
                            <Button size="lg" className="w-full" onClick={handleTakeSnapshot} disabled={!hasCameraPermission}>
                                <Camera className="mr-2" />
                                Take Snapshot
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
