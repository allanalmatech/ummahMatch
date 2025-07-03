
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { useTransition } from "react"
import { useToast } from "@/hooks/use-toast"
import { approvePurchase, rejectPurchase } from "../actions"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export type PurchaseRow = {
  id: string; // purchase id
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string; // formatted date
}

export const columns: ColumnDef<PurchaseRow>[] = [
    {
        accessorKey: "userName",
        header: "User",
    },
    {
        accessorKey: "userEmail",
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
        accessorKey: "itemName",
        header: "Item Purchased",
    },
    {
        accessorKey: "itemPrice",
        header: "Price",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("itemPrice"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            if (status === "completed") return <Badge variant="secondary">Completed</Badge>
            if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>
            return <Badge variant="outline">Pending</Badge>
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date"
    },
    {
        id: "actions",
        cell: function Actions({ row }) {
            const purchase = row.original;
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
                        <DropdownMenuItem 
                            onClick={() => handleAction(
                                () => approvePurchase(purchase.id, purchase.userId, purchase.itemId, purchase.itemName),
                                "Purchase approved and entitlement granted.",
                                "Failed to approve purchase."
                            )}
                            disabled={isPending || purchase.status !== 'pending'}
                        >
                            Approve Purchase
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                             onClick={() => handleAction(
                                () => rejectPurchase(purchase.id),
                                "Purchase has been rejected.",
                                "Failed to reject purchase."
                            )}
                            disabled={isPending || purchase.status !== 'pending'}
                        >
                            Reject Purchase
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
