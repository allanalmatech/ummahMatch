
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Upload, Sparkles, Loader2, Copy } from 'lucide-react';
import { getProfileSuggestions } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import type { ProfilePromptInput } from '@/ai/flows/profile-prompt-generator';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { setUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import Image from 'next/image';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(18, 'You must be at least 18.').max(100),
  gender: z.string().min(1, 'Please select a gender.'),
  occupation: z.string().min(2, 'Occupation is required.'),
  city: z.string().min(1, 'City is required.'),
  country: z.string().min(1, 'Country is required.'),
  homeStatus: z.string().optional(),
  children: z.coerce.number().min(0).optional(),
  education: z.string().optional(),
  languages: z.string().min(2, 'Please list languages you speak.'),
  height: z.coerce.number().min(100, 'Height in cm.').max(250).optional(),
  weight: z.coerce.number().min(30, 'Weight in kg.').max(300).optional(),
  drinking: z.string().optional(),
  smoking: z.string().optional(),
  religion: z.string().min(1, 'Religion is required.'),
  denomination: z.string().optional(),
  tribe: z.string().optional(),
  lifestyle: z.string().optional(),
  relationshipGoals: z.string().min(1, 'Relationship goals are required.'),
  moods: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required.'),
  maritalStatus: z.string().optional(),
  acceptsPolygamy: z.string().optional(),
  appearance: z.string().optional(),
  interests: z.string().optional(),
  description: z.string().min(50, 'Description must be at least 50 characters.').max(1000),
  verificationStatus: z.string().optional(),
  subscription: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const PhotoUpload = ({ imageUrl, onFileSelect }: { imageUrl?: string | null; onFileSelect: (file: File) => void; }) => {
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
            />
            <div 
                className="aspect-square w-full cursor-pointer rounded-lg border-2 border-dashed bg-muted/50 hover:bg-muted/80 transition-colors overflow-hidden"
                onClick={() => inputRef.current?.click()}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt="Profile photo preview"
                        width={400}
                        height={400}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <Upload className="mx-auto h-8 w-8" />
                            <p className="mt-2 text-sm">Click to upload</p>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-semibold">Change Photo</p>
                </div>
            </div>
        </div>
    );
};


export function ProfileForm({ profile }: { profile?: Partial<UserProfile> | null }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      age: 18,
      gender: '',
      occupation: '',
      city: '',
      country: '',
      languages: '',
      religion: 'Islam',
      relationshipGoals: '',
      description: '',
      children: 0,
      ...(profile || {}),
    },
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isSubmitting } = form.formState;

  const [photoPreviews, setPhotoPreviews] = useState({
      main: profile?.imageUrl || null,
      photo1: profile?.photos?.[0] || null,
      photo2: profile?.photos?.[1] || null,
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile as ProfileFormValues);
      setPhotoPreviews({
          main: profile.imageUrl || null,
          photo1: profile.photos?.[0] || null,
          photo2: profile.photos?.[1] || null,
      });
    }
  }, [profile, form]);

  const handlePhotoSelect = (file: File, photoKey: keyof typeof photoPreviews) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setPhotoPreviews(prev => ({ ...prev, [photoKey]: reader.result as string }));
    };
    reader.readAsDataURL(file);
    toast({
        title: "Photo Ready",
        description: "Your photo has been selected and is ready to be saved.",
    });
  };

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a profile.",
      });
      return;
    }

    try {
      const profileDataWithRole = { 
        ...data, 
        role: 'user', 
        status: profile?.status || 'Active',
        verificationStatus: profile?.verificationStatus || 'unverified',
        subscription: profile?.subscription || 'Free',
        imageUrl: photoPreviews.main || 'https://placehold.co/600x800.png',
        photos: [
            photoPreviews.photo1 || 'https://placehold.co/600x800.png',
            photoPreviews.photo2 || 'https://placehold.co/600x800.png',
        ],
      };
      await setUserProfile(user.uid, profileDataWithRole);
      toast({
        title: profile ? "Profile Updated!" : "Profile Saved!",
        description: profile ? "Your changes have been successfully saved." : "Your profile has been created successfully. Welcome!",
      });
      
      if (profile) {
        router.refresh();
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "There was a problem saving your profile. Please try again.",
      });
    }
  }
  
  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setIsDialogOpen(true);
    setSuggestions([]);
    
    const aiInput: ProfilePromptInput = {
        currentDescription: form.getValues('description'),
        relationshipGoals: form.getValues('relationshipGoals'),
        lifestyle: form.getValues('lifestyle') || 'Not specified',
        moods: form.getValues('moods') || 'Not specified',
        interests: form.getValues('interests') || 'Not specified',
    };

    const result = await getProfileSuggestions(aiInput);

    setIsGenerating(false);

    if (result.error || !result.suggestions) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not generate suggestions.',
      });
      setIsDialogOpen(false);
    } else {
      setSuggestions(result.suggestions);
    }
  };
  
  const useSuggestion = (suggestion: string) => {
    form.setValue('description', suggestion);
    setIsDialogOpen(false);
    toast({
      title: "Suggestion applied!",
      description: "Your description has been updated.",
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className='font-headline text-xl'>Personal Details</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-1 gap-6 p-1 md:grid-cols-2">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="age" render={({ field }) => ( <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="18" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="height" render={({ field }) => ( <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="175" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="70" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="nationality" render={({ field }) => ( <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g. British" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="tribe" render={({ field }) => ( <FormItem><FormLabel>Tribe / Ethnicity</FormLabel><FormControl><Input placeholder="e.g. Yoruba, Punjabi" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="maritalStatus" render={({ field }) => ( <FormItem><FormLabel>Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your marital status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="children" render={({ field }) => ( <FormItem><FormLabel>Number of Children</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="appearance" render={({ field }) => ( <FormItem><FormLabel>Appearance</FormLabel><FormControl><Input placeholder="e.g. Slim, Athletic" {...field} /></FormControl><FormDescription>A word or two about your build.</FormDescription><FormMessage /></FormItem> )} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className='font-headline text-xl'>Lifestyle, Vocation & Location</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-1 gap-6 p-1 md:grid-cols-2">
                        <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g. London" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g. United Kingdom" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="homeStatus" render={({ field }) => ( <FormItem><FormLabel>Home Status</FormLabel><FormControl><Input placeholder="e.g. Live with family" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="occupation" render={({ field }) => ( <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input placeholder="e.g. Doctor, Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="education" render={({ field }) => ( <FormItem><FormLabel>Education Level</FormLabel><FormControl><Input placeholder="e.g. Bachelor's Degree" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="languages" render={({ field }) => ( <FormItem><FormLabel>Languages Spoken</FormLabel><FormControl><Input placeholder="e.g. English, Arabic, Urdu" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="smoking" render={({ field }) => ( <FormItem><FormLabel>Smoking</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Do you smoke?" /></SelectTrigger></FormControl><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="sometimes">Sometimes</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="drinking" render={({ field }) => ( <FormItem><FormLabel>Drinking</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Do you drink?" /></SelectTrigger></FormControl><SelectContent><SelectItem value="no">No</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="religion" render={({ field }) => ( <FormItem><FormLabel>Religion</FormLabel><FormControl><Input disabled {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="denomination" render={({ field }) => ( <FormItem><FormLabel>Denomination / Sect</FormLabel><FormControl><Input placeholder="e.g. Sunni, Shia, Just Muslim" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="acceptsPolygamy" render={({ field }) => ( <FormItem><FormLabel>Accepts Polygamy</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Are you open to polygamy?" /></SelectTrigger></FormControl><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className='font-headline text-xl'>About You & Preferences</AccordionTrigger>
                    <AccordionContent className="space-y-6 p-1">
                        <FormField control={form.control} name="relationshipGoals" render={({ field }) => ( <FormItem><FormLabel>Relationship Goals</FormLabel><FormControl><Input placeholder="e.g. Marriage, Serious Relationship" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="lifestyle" render={({ field }) => ( <FormItem><FormLabel>Lifestyle</FormLabel><FormControl><Input placeholder="e.g. Active, Homebody, Social" {...field} /></FormControl><FormDescription>Used for AI suggestions.</FormDescription><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="moods" render={({ field }) => ( <FormItem><FormLabel>Current Moods</FormLabel><FormControl><Input placeholder="e.g. Optimistic, Thoughtful" {...field} /></FormControl><FormDescription>Used for AI suggestions.</FormDescription><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="interests" render={({ field }) => ( <FormItem><FormLabel>Interests</FormLabel><FormControl><Input placeholder="e.g. Reading, hiking, cooking" {...field} /></FormControl><FormDescription>Separate with commas. Used for AI suggestions.</FormDescription><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Describe Yourself (Bio)</FormLabel><FormControl><Textarea placeholder="Tell us about your personality, what you're passionate about, and what you're looking for in a partner..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem> )} />
                         <Button type="button" variant="outline" size="sm" onClick={handleGenerateSuggestions} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Get AI Suggestions
                        </Button>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-4">
                    <AccordionTrigger className='font-headline text-xl'>Upload Photos</AccordionTrigger>
                    <AccordionContent className="p-1">
                        <p className="text-sm text-muted-foreground mb-4">Upload a main profile picture and up to two additional photos.</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <PhotoUpload imageUrl={photoPreviews.main} onFileSelect={(file) => handlePhotoSelect(file, 'main')} />
                            <PhotoUpload imageUrl={photoPreviews.photo1} onFileSelect={(file) => handlePhotoSelect(file, 'photo1')} />
                            <PhotoUpload imageUrl={photoPreviews.photo2} onFileSelect={(file) => handlePhotoSelect(file, 'photo2')} />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          
          <div className="flex justify-end pt-8">
            <Button type="submit" size="lg" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {profile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Form>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">AI Profile Suggestions</DialogTitle>
            <DialogDescription>
              Here are a few suggestions to make your profile stand out. Click one to use it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGenerating && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                    <Card key={index} className="p-4 bg-muted/50">
                        <p className="text-sm text-foreground">{suggestion}</p>
                        <div className="flex justify-end mt-2">
                             <Button size="sm" variant="ghost" onClick={() => useSuggestion(suggestion)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Use this
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
