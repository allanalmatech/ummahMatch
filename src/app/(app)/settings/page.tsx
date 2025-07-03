
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile } from '@/services/user-service';
import { updateUserSettings } from './actions';
import type { UserProfile } from '@/types';
import Link from 'next/link';

const settingsFormSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  privacy: z.object({
    showInSearch: z.boolean().default(true),
    onlyMatchesCanMessage: z.boolean().default(false),
    profileVisibility: z.enum(['everyone', 'subscribers', 'matches']).default('everyone'),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function SettingsPage() {
  const { user, changePassword } = useAuth();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      privacy: {
        showInSearch: true,
        onlyMatchesCanMessage: false,
        profileVisibility: 'everyone',
      },
    },
  });
  
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        setLoading(true);
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile as UserProfile);
          form.reset({
            notifications: (userProfile as any).notifications || form.getValues('notifications'),
            privacy: (userProfile as any).privacy || form.getValues('privacy'),
          });
        }
        setLoading(false);
      };
      fetchSettings();
    }
  }, [user, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user) return;
    const result = await updateUserSettings(user.uid, data);
    if (result.success) {
      toast({
        title: 'Settings Saved',
        description: 'Your notification and privacy settings have been updated.',
      });
      form.reset(data); // Resets the dirty state
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
      });
    }
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
        await changePassword(data.currentPassword, data.newPassword);
        toast({
            title: 'Password Updated',
            description: 'Your password has been changed successfully.',
        });
        passwordForm.reset();
        setIsPasswordDialogOpen(false);
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error Changing Password',
            description: 'Failed to change password. Your current password may be incorrect.',
        });
    }
  };

  const handleDeactivate = () => {
    toast({
        title: "Account Deactivated",
        description: "Your account has been temporarily deactivated. You can reactivate it by logging in again.",
    });
    // In a real app, you would call logout and set a flag in the database.
  };
  
  const handleDelete = () => {
     toast({
        variant: "destructive",
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
    });
     // In a real app, you would call a backend function to delete the user and their data.
  }
  
  const hasSubscription = profile?.subscription && profile.subscription !== 'Free';

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, notifications, and privacy.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Email</FormLabel>
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" type="button">Change Password</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Change Your Password</DialogTitle>
                            <DialogDescription>
                                Enter your current password and a new password. Your new password must be at least 8 characters long.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                               <FormField
                                    control={passwordForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={passwordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={passwordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter className="pt-4">
                                    <Button variant="outline" type="button" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                        {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save new password
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notifications.email"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <FormLabel htmlFor="email-notifications">Email Notifications</FormLabel>
                    <FormControl>
                      <Switch id="email-notifications" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notifications.push"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <FormLabel htmlFor="push-notifications">Push Notifications</FormLabel>
                    <FormControl>
                      <Switch id="push-notifications" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notifications.sms"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <FormLabel htmlFor="sms-notifications">SMS Notifications</FormLabel>
                    <FormControl>
                      <Switch id="sms-notifications" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who sees your profile and how they can interact with you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <FormField
                control={form.control}
                name="privacy.showInSearch"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel htmlFor="show-in-search" className="flex-1 pr-4">Show my profile in search results</FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch id="show-in-search" checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privacy.profileVisibility"
                render={({ field }) => (
                  <FormItem className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                        <FormLabel>Who can see my profile</FormLabel>
                        {!hasSubscription && (
                            <p className="text-xs text-muted-foreground">
                            More options available for subscribers. <Link href="/subscription" className="text-primary hover:underline">Upgrade now.</Link>
                            </p>
                        )}
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!hasSubscription}>
                            <FormControl>
                                <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="everyone">Everyone</SelectItem>
                                <SelectItem value="subscribers">Subscribers Only</SelectItem>
                                <SelectItem value="matches">Matches Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="privacy.onlyMatchesCanMessage"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel htmlFor="only-matches-can-message" className="flex-1 pr-4">Only allow matches to send me messages</FormLabel>
                      {!hasSubscription && (
                        <p className="text-xs text-muted-foreground">
                          This is a premium feature. <Link href="/subscription" className="text-primary hover:underline">Upgrade now.</Link>
                        </p>
                      )}
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch id="only-matches-can-message" checked={field.value} onCheckedChange={field.onChange} disabled={!hasSubscription} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end border-t px-6 py-4">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2"><ShieldAlert /> Danger Zone</CardTitle>
          <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">Deactivate Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to deactivate your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your profile and matches will be hidden until you log back in. Your data will not be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">Delete Account Permanently</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to permanently delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All of your data, including matches and messages, will be permanently erased.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete Permanently</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

    </div>
  );
}
