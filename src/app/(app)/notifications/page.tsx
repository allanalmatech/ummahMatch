

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Heart, MessageCircle, UserCheck, Loader2, Frown, Star } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { getNotificationsForUser, markNotificationAsRead, type Notification } from '@/services/notification-service';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'match':
            return <UserCheck className="h-6 w-6 text-accent" />;
        case 'like':
            return <Heart className="h-6 w-6 text-destructive" />;
        case 'message':
            return <MessageCircle className="h-6 w-6 text-primary" />;
        case 'favorite':
            return <Star className="h-6 w-6 text-yellow-500 fill-current" />;
        default:
            return <Bell className="h-6 w-6" />;
    }
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const fetchedNotifications = await getNotificationsForUser(user.uid);
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [user]);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id ? { ...n, isRead: true } : n
                    )
                );
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl">
            <header className="mb-8">
                <h1 className="font-headline text-4xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">Stay updated with your latest activity.</p>
            </header>
            <Card>
                <CardContent className="p-0">
                    {notifications.length > 0 ? (
                        <ul className="divide-y">
                            {notifications.map((notification) => {
                                const NotifWrapper = notification.link ? Link : 'div';
                                return (
                                    <li key={notification.id} onClick={() => handleNotificationClick(notification)}>
                                        <NotifWrapper href={notification.link || '#'} className={cn(
                                            "flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                                            !notification.isRead && "bg-primary/5"
                                        )}>
                                            <div className="relative">
                                                {notification.from ? (
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={notification.from.avatarUrl} alt={notification.from.name} data-ai-hint={notification.from.aiHint} />
                                                        <AvatarFallback>{notification.from.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                )}
                                                {!notification.isRead && (
                                                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{notification.title}</p>
                                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </NotifWrapper>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-48">
                            <Frown className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="font-headline text-2xl font-bold">No Notifications Yet</h3>
                            <p className="text-muted-foreground">When you get likes, matches, or messages, they'll show up here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    
