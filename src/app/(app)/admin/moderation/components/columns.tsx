"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { resolveReport, dismissReport, suspendUserFromReport } from "../actions"

export type ReportRow = {
  id: string; // report id
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string; // formatted date
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  reporterName: string;
}

export const columns: ColumnDef<ReportRow>[] = [
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
        accessorKey: "reportedUserName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Reported User
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
         cell: ({ row }) => (
            <Link href={`/users/${row.original.reportedUserId}`} className="hover:underline" prefetch={false} target="_blank">
                {row.original.reportedUserName}
            </Link>
        ),
    },
    {
        accessorKey: "reporterName",
        header: "Reporter",
        cell: ({ row }) => (
            <Link href={`/users/${row.original.reporterId}`} className="hover:underline" prefetch={false} target="_blank">
                {row.original.reporterName}
            </Link>
        ),
    },
    {
        accessorKey: "reason",
        header: "Reason",
    },
    {
        accessorKey: "details",
        header: "Details",
        cell: ({ row }) => {
            const details = row.original.details;
            if (!details) return <span className="text-muted-foreground">N/A</span>;
            
            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="truncate block max-w-xs">{details}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md bg-background border p-2 rounded-md shadow-lg">
                            <p>{details}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            if (status === "resolved") return <Badge variant="secondary">Resolved</Badge>
            if (status === "dismissed") return <Badge variant="outline">Dismissed</Badge>
            return <Badge variant="default">Pending</Badge>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date Reported"
    },
    {
        id: "actions",
        cell: function Actions({ row }) {
            const report = row.original;
            const { toast } = useToast();
            const [isPending, startTransition] = useTransition();

            const handleAction = (action: () => Promise<{success: boolean; error?: string | null}>, successMessage: string, errorMessage: string) => {
                startTransition(async () => {
                    const result = await action();
                    if (result.success) {
                        toast({ title: "Success", description: successMessage });
                    } else {
                        toast({ variant: "destructive", title: "Error", description: result.error || errorMessage });
                    }
                });
            };
            
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild><Link href={`/users/${report.reportedUserId}`} prefetch={false} target="_blank">View Reported Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/users/${report.reporterId}`} prefetch={false} target="_blank">View Reporter Profile</Link></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => handleAction(
                                () => resolveReport(report.id),
                                "Report has been marked as resolved.",
                                "Failed to resolve report."
                            )}
                            disabled={isPending || report.status !== 'pending'}
                        >
                            Mark as Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                             onClick={() => handleAction(
                                () => dismissReport(report.id),
                                "Report has been dismissed.",
                                "Failed to dismiss report."
                            )}
                            disabled={isPending || report.status !== 'pending'}
                        >
                            Dismiss Report
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleAction(
                                () => suspendUserFromReport(report.reportedUserId, report.id),
                                `User ${report.reportedUserName} has been suspended.`,
                                "Failed to suspend user."
                            )}
                            disabled={isPending}
                        >
                            Suspend User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
