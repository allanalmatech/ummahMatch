
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown, ShieldCheck, ShieldOff, ShieldAlert, ShieldQuestion, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { updateUserVerificationStatus, updateUserStatus, deleteUserAction } from "../actions"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

export type User = {
  id: string
  name: string
  email: string
  status: "Active" | "Suspended" | "Flagged"
  subscription: "Free" | "Gold" | "Platinum"
  joined: string
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationPhotoUrl?: string | null;
}

export const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "verificationStatus",
        header: "Verified",
        cell: ({ row }) => {
            const status = row.getValue("verificationStatus")
            switch (status) {
                case "verified":
                    return <ShieldCheck className="h-5 w-5 text-primary" title="Verified" />;
                case "pending":
                    return <ShieldAlert className="h-5 w-5 text-yellow-500" title="Pending Review" />;
                case "rejected":
                    return <ShieldOff className="h-5 w-5 text-destructive" title="Rejected" />;
                default:
                    return <ShieldQuestion className="h-5 w-5 text-muted-foreground" title="Unverified" />;
            }
        }
    },
    {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => {
            const plan = row.getValue("subscription") as string
            if (plan === "Gold") return <Badge>Gold</Badge>
            if (plan === "Platinum") return <Badge variant="secondary">Platinum</Badge>
            return <Badge variant="outline">Free</Badge>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            if (status === "Active") return <Badge variant="secondary">Active</Badge>
            if (status === "Flagged") return <Badge variant="destructive">Flagged</Badge>
            return <Badge variant="destructive">{status}</Badge>
        },
    },
    {
        accessorKey: "joined",
        header: "Date Joined"
    },
    {
        id: "actions",
        cell: function Actions({ row }) {
            const user = row.original;
            const router = useRouter();
            const { toast } = useToast();
            const [isPending, startTransition] = useTransition();
            const [isAlertOpen, setIsAlertOpen] = useState(false);

            const handleStatusChange = () => {
                const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
                const actionText = newStatus === 'Suspended' ? 'suspending' : 'reactivating';
                const successText = `User has been ${newStatus.toLowerCase()}.`;
                
                startTransition(async () => {
                    const result = await updateUserStatus(user.id, newStatus);
                    if (result.success) {
                        toast({ title: "Success", description: successText });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: result.error || `Failed while ${actionText} user.`
                        });
                    }
                });
            };

            const handleVerificationChange = (status: 'verified' | 'rejected' | 'unverified') => {
                 startTransition(async () => {
                    const result = await updateUserVerificationStatus(user.id, status);
                    if (result.success) {
                        toast({
                            title: "Success",
                            description: `User verification status set to ${status}.`,
                        });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: result.error,
                        });
                    }
                });
            };
            
            const handleDeleteUser = () => {
                startTransition(async () => {
                    const result = await deleteUserAction(user.id);
                     if (result.success) {
                        toast({ title: "User Deleted", description: "The user account has been permanently deleted." });
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: result.error || `Failed to delete user.`
                        });
                    }
                    setIsAlertOpen(false);
                });
            }

            return (
                <>
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(user.email)}
                    >
                        Copy email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/users/${user.id}`)}>View profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuLabel>Verification</DropdownMenuLabel>
                     {user.verificationStatus === 'pending' && user.verificationPhotoUrl && (
                        <DropdownMenuItem onClick={() => window.open(user.verificationPhotoUrl, '_blank')}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review Photo
                        </DropdownMenuItem>
                     )}
                     <DropdownMenuItem
                        disabled={isPending || user.verificationStatus === 'verified'}
                        onClick={() => handleVerificationChange('verified')}
                    >
                        Mark as Verified
                    </DropdownMenuItem>
                     <DropdownMenuItem
                        disabled={isPending || user.verificationStatus === 'rejected'}
                        onClick={() => handleVerificationChange('rejected')}
                    >
                        Mark as Rejected
                    </DropdownMenuItem>
                     <DropdownMenuItem
                        disabled={isPending || user.verificationStatus === 'unverified'}
                        onClick={() => handleVerificationChange('unverified')}
                    >
                        Reset to Unverified
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        disabled={isPending}
                        onClick={handleStatusChange}
                    >
                        {user.status === 'Active' ? 'Suspend user' : 'Reactivate user'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        onClick={() => setIsAlertOpen(true)}
                        disabled={isPending}
                    >
                        Delete user
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user's
                            account and remove their data from our servers.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            Continue
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </>
            )
        },
    },
]
