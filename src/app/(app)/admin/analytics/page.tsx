
'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DollarSign, Users, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from 'react';
import { getUsers } from '@/services/user-service';
import { getPurchaseRecords } from '@/services/purchase-service';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';
import { Badge } from '@/components/ui/badge';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
};

type DisplayUser = {
    id: string;
    name: string;
    email: string;
    subscription: string;
    avatarUrl: string;
    aiHint: string;
    status: 'Active' | 'Suspended' | 'Flagged';
}

type Stats = {
    totalRevenue: number;
    totalSales: number;
    totalUsers: number;
}

type ChartData = {
    month: string;
    revenue: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<DisplayUser[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            const [users, purchases] = await Promise.all([
                getUsers(),
                getPurchaseRecords()
            ]);

            // Calculate Stats
            const completedPurchases = purchases.filter((p: any) => p.status === 'completed');
            const totalRevenue = completedPurchases.reduce((acc: number, p: any) => acc + p.itemPrice, 0);
            const totalSales = completedPurchases.length;
            const totalUsers = users.length;
            
            setStats({ totalRevenue, totalSales, totalUsers });

            // Format Recent Users
            const formattedRecent = users.slice(0, 5).map((user: UserProfile) => ({
                id: user.id,
                name: user.name || 'Anonymous User',
                email: user.email || 'no-email@example.com',
                subscription: user.subscription || 'Free',
                avatarUrl: user.imageUrl || 'https://placehold.co/100x100.png',
                aiHint: user.gender === 'male' ? 'man portrait' : 'woman portrait',
                status: user.status || 'Active'
            }));
            setRecentUsers(formattedRecent);
            
            // Calculate Monthly Revenue for Chart
            const now = new Date();
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const revenueByMonth: { [key: string]: number } = {};

            completedPurchases.forEach((p: any) => {
                if (p.createdAt && typeof p.createdAt.toDate === 'function') {
                    const purchaseDate = p.createdAt.toDate();
                    // Create a key like "2024-0" for January 2024
                    const monthKey = `${purchaseDate.getFullYear()}-${purchaseDate.getMonth()}`;
                    revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + p.itemPrice;
                }
            });

            const newChartData: ChartData[] = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = d.getFullYear();
                const monthIndex = d.getMonth();
                const monthKey = `${year}-${monthIndex}`;
                
                newChartData.push({
                    month: monthNames[monthIndex],
                    revenue: revenueByMonth[monthKey] || 0,
                });
            }
            setChartData(newChartData);

        } catch (error) {
            console.error("Failed to fetch analytics data", error);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  if (loading || !stats) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <p className="text-xs text-muted-foreground">From all completed purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All-time registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Total completed transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue from completed sales.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig}>
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
            <CardDescription>The latest users to join the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
                {recentUsers.map(user => (
                     <div key={user.id} className="flex items-center">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt="Avatar" data-ai-hint={user.aiHint} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                           <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                           <div className="font-medium">{user.subscription}</div>
                        </div>
                      </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
