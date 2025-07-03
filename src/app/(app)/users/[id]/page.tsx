
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Ban,
  ShieldAlert,
  MapPin,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Ruler,
  Users,
  Home,
  GraduationCap,
  Languages,
  CircleOff,
  Sparkles,
  Smile,
  Eye,
  Flag,
  Loader2,
  ShieldCheck,
  Star,
  Weight,
  BookUser,
  Lock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { submitReport, recordProfileView, blockUser, toggleFavorite } from './actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import { checkIfMatchExists } from '@/services/like-service';
import { checkIsFavorited } from '@/services/favorite-service';
import { cn } from '@/lib/utils';
import Link from 'next/link';


const reportReasons = [
  { id: 'spam', label: 'Spam or scam' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'fake', label: 'Fake profile' },
  { id: 'harassment', label: 'Harassment or hate speech' },
  { id: 'other', label: 'Other' },
];

function ReportDialog({ open, onOpenChange, userName, reporterId, reportedUserId }: { open: boolean; onOpenChange: (open: boolean) => void; userName: string; reporterId: string | undefined; reportedUserId: string }) {
  const { toast } = useToast();
  const [reason, setReason] = useState(reportReasons[0].id);
  const [details, setDetails] = useState('');

  const handleSubmit = async () => {
    if (!reporterId) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: `You must be logged in to report a user.`,
      });
      onOpenChange(false);
      return;
    }

    const result = await submitReport({
        reporterId,
        reportedUserId,
        reason,
        details
    });

    if (result.success) {
        toast({
            title: 'Report Submitted',
            description: `Your report about ${userName} has been received. Our team will review it shortly.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Report Failed",
            description: result.error,
        });
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {userName}</DialogTitle>
          <DialogDescription>Help us keep the community safe. What's the reason for your report?</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup defaultValue={reason} onValueChange={setReason} className="space-y-2">
            {reportReasons.map((r) => (
              <div key={r.id} className="flex items-center space-x-2">
                <RadioGroupItem value={r.id} id={`reason-${r.id}`} />
                <Label htmlFor={`reason-${r.id}`}>{r.label}</Label>
              </div>
            ))}
          </RadioGroup>
          <Textarea placeholder="Provide additional details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BlockDialog({ open, onOpenChange, userName, blockerId, blockedId }: { open: boolean; onOpenChange: (open: boolean) => void; userName: string; blockerId: string; blockedId: string; }) {
  const { toast } = useToast();
  const router = useRouter();

  const handleBlock = async () => {
    const result = await blockUser(blockerId, blockedId);
    if (result.success) {
        toast({
            title: `${userName} Blocked`,
            description: `You will no longer see ${userName}'s profile and they won't be able to see yours or contact you.`,
        });
        onOpenChange(false);
        router.push('/home');
    } else {
        toast({
            variant: 'destructive',
            title: 'Block Failed',
            description: result.error,
        });
        onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to block {userName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. You won't be able to see each other's profiles or communicate. If you are matched, you will be unmatched.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} className="bg-destructive hover:bg-destructive/90">Block User</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const ProfileDetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
};

function PrivateProfile({ privacyLevel }: { privacyLevel: 'subscribers' | 'matches' }) {
    const title = privacyLevel === 'matches' ? 'This Profile is Private' : 'This is a Private Profile';
    const description = privacyLevel === 'matches'
        ? "This user only shares their profile with their matches. Like their profile for a chance to connect!"
        : "This user only shares their full profile with subscribers. Upgrade to view their details.";

    return (
        <Card className="flex flex-col items-center justify-center text-center py-16 px-6 lg:col-span-3">
            <Lock className="h-16 w-16 text-primary mb-4" />
            <h2 className="font-headline text-3xl font-bold">{title}</h2>
            <p className="text-muted-foreground max-w-md mt-2 mb-6">{description}</p>
            {privacyLevel === 'subscribers' && (
                 <Button asChild>
                    <Link href="/subscription">Upgrade Your Plan</Link>
                </Button>
            )}
        </Card>
    )
}


export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isBlockOpen, setBlockOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(true);
  const { toast } = useToast();
  const [canViewProfile, setCanViewProfile] = useState(false);
  const [viewerProfile, setViewerProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    if (!params.id) return;
    if (!currentUser) return; // Wait for auth state

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [viewedUser, viewer] = await Promise.all([
                getUserProfile(params.id),
                getUserProfile(currentUser.uid)
            ]);

            if (!viewedUser) {
                setError('User profile not found.');
                setLoading(false);
                return;
            }

            setUser(viewedUser);
            setViewerProfile(viewer);
            
            const isOwnProfile = currentUser.uid === viewedUser.id;
            const visibility = viewedUser.privacy?.profileVisibility || 'everyone';
            let hasAccess = false;

            if (isOwnProfile || visibility === 'everyone') {
                hasAccess = true;
            } else if (visibility === 'subscribers') {
                hasAccess = viewer?.subscription !== 'Free';
            } else if (visibility === 'matches') {
                hasAccess = await checkIfMatchExists(currentUser.uid, viewedUser.id);
            }

            setCanViewProfile(hasAccess);

            if (hasAccess) {
                if (!isOwnProfile) {
                    recordProfileView(currentUser.uid, params.id);
                }
                checkIsFavorited(currentUser.uid, params.id)
                    .then(setIsFavorited)
                    .finally(() => setIsFavoriteLoading(false));
            }

        } catch (err) {
            console.error("Failed to fetch user profile:", err);
            setError("Could not load profile. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    fetchInitialData();
  }, [params.id, currentUser]);

  const handleToggleFavorite = async () => {
    if (!currentUser) return;
    setIsFavoriteLoading(true);
    const result = await toggleFavorite(currentUser.uid, params.id);
    if (result.success) {
      setIsFavorited(result.newStatus!);
      toast({
        title: result.newStatus ? 'Added to Favorites' : 'Removed from Favorites',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsFavoriteLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    notFound();
  }
  
  const isOwnProfile = currentUser?.uid === user.id;

  if (!isOwnProfile && !canViewProfile) {
      return (
        <div className="container mx-auto max-w-4xl">
           <PrivateProfile privacyLevel={user.privacy?.profileVisibility || 'matches'} />
        </div>
      )
  }

  return (
    <>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <Card className="overflow-hidden">
                <Image
                    src={user.imageUrl || 'https://placehold.co/600x800.png'}
                    alt={`Main photo of ${user.name}`}
                    width={600}
                    height={800}
                    className="object-cover aspect-[3/4] w-full"
                    data-ai-hint={user.aiHint}
                />
            </Card>
            <div className="grid grid-cols-2 gap-4">
                {(user.photos || []).map((photo, index) => (
                    <Card key={index} className="overflow-hidden">
                        <Image
                            src={photo}
                            alt={`Photo ${index + 2} of ${user.name}`}
                            width={300}
                            height={400}
                            className="object-cover aspect-[3/4] w-full"
                             data-ai-hint={user.aiHint}
                        />
                    </Card>
                ))}
            </div>
             <Alert variant="destructive" className="bg-destructive/10">
                <ShieldAlert className="h-4 w-4 !text-destructive" />
                <AlertDescription>
                    For your safety, do not share personal contact details until you are comfortable. Report any suspicious behavior.
                </AlertDescription>
            </Alert>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline text-4xl font-bold">{user.name}, {user.age}</h1>
                  {user.verificationStatus === 'verified' && (
                     <ShieldCheck className="h-8 w-8 text-primary" title="Verified Profile" />
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-2 mt-1"><MapPin className="h-5 w-5"/> {user.city}, {user.country}</p>
              </div>
              {!isOwnProfile && (
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" onClick={handleToggleFavorite} disabled={isFavoriteLoading}>
                        <Star className={cn("mr-2 h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-500")} />
                        {isFavorited ? 'Favorited' : 'Favorite'}
                    </Button>
                    <Button variant="outline" onClick={() => setBlockOpen(true)}><Ban className="mr-2 h-4 w-4"/> Block</Button>
                    <Button variant="destructive" onClick={() => setReportOpen(true)}><ShieldAlert className="mr-2 h-4 w-4"/> Report</Button>
                </div>
              )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">About {user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{user.description}</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   <ProfileDetailItem icon={Briefcase} label="Occupation" value={user.occupation} />
                   <ProfileDetailItem icon={Flag} label="Nationality" value={user.nationality} />
                   <ProfileDetailItem icon={Home} label="Home Status" value={user.homeStatus} />
                   <ProfileDetailItem icon={Users} label="Children" value={user.children} />
                   <ProfileDetailItem icon={GraduationCap} label="Education" value={user.education} />
                   <ProfileDetailItem icon={Languages} label="Languages" value={user.languages} />
                   <ProfileDetailItem icon={Ruler} label="Height" value={user.height ? `${user.height} cm` : undefined} />
                   <ProfileDetailItem icon={Weight} label="Weight" value={user.weight ? `${user.weight} kg` : undefined} />
                   <ProfileDetailItem icon={CircleOff} label="Smoking" value={user.smoking} />
                   <ProfileDetailItem icon={CircleOff} label="Drinking" value={user.drinking} />
                   <ProfileDetailItem icon={HeartHandshake} label="Religion" value={user.religion} />
                   <ProfileDetailItem icon={BookUser} label="Denomination" value={user.denomination} />
                   <ProfileDetailItem icon={Users} label="Tribe" value={user.tribe} />
                   <ProfileDetailItem icon={Eye} label="Appearance" value={user.appearance} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Lifestyle & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   <ProfileDetailItem icon={Sparkles} label="Lifestyle" value={user.lifestyle} />
                   <ProfileDetailItem icon={HeartHandshake} label="Relationship Goals" value={user.relationshipGoals} />
                   <ProfileDetailItem icon={Smile} label="Moods" value={user.moods} />
                   <ProfileDetailItem icon={BookOpen} label="Interests" value={user.interests} />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {currentUser && <ReportDialog open={isReportOpen} onOpenChange={setReportOpen} userName={user.name!} reporterId={currentUser?.uid} reportedUserId={user.id} />}
      {currentUser && <BlockDialog open={isBlockOpen} onOpenChange={setBlockOpen} userName={user.name!} blockerId={currentUser.uid} blockedId={user.id} />}
    </>
  );
}
