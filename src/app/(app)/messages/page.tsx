
'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Search, ShieldCheck, Loader2, MessageSquare, Crown, Sparkles, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getMyMatches } from '@/services/like-service';
import { sendMessage, generateIcebreakersAction } from './actions';
import { db } from '@/firebase/client';
import { collection, query, onSnapshot, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/types';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';


// This is the shape of user data we get from getMyMatches
type MatchUser = {
  id: string;
  name: string;
  imageUrl: string;
  aiHint: string;
  verificationStatus?: UserProfile['verificationStatus'];
};

// This is the shape of a single message from Firestore
type Message = {
    id: string;
    senderId: string;
    text: string;
    createdAt: Timestamp | null;
};

// A helper to generate the unique ID for a conversation
const getConversationId = (userId1: string, userId2: string) => {
  return [userId1, userId2].sort().join('_');
};


export default function MessagesPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<MatchUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isGeneratingIcebreakers, setIsGeneratingIcebreakers] = useState(false);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [isIcebreakerDialogOpen, setIsIcebreakerDialogOpen] = useState(false);


  // 1. Fetch current user's subscription status and matches
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoadingMatches(true);
      try {
        const [profileData, fetchedMatches] = await Promise.all([
            getUserProfile(currentUser.uid) as Promise<UserProfile | null>,
            getMyMatches(currentUser.uid)
        ]);

        if (profileData) {
            setCurrentUserProfile(profileData);
        }

        const formattedMatches: MatchUser[] = fetchedMatches.map((match: any) => ({
            id: match.id,
            name: match.name || 'Anonymous',
            imageUrl: match.imageUrl || 'https://placehold.co/100x100.png',
            aiHint: match.gender === 'male' ? 'man portrait' : 'woman portrait',
            verificationStatus: match.verificationStatus || 'unverified',
        }));
        setMatches(formattedMatches);
        
        if (formattedMatches.length > 0 && !selectedConversation) {
            setSelectedConversation(formattedMatches[0]);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast({ variant: 'destructive', title: 'Could not load your matches.' });
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchData();
  }, [currentUser, toast]);

  // 2. Listen for messages in the selected conversation
  useEffect(() => {
    if (!currentUser || !selectedConversation) {
        setMessages([]);
        return;
    };

    setLoadingMessages(true);
    const conversationId = getConversationId(currentUser.uid, selectedConversation.id);
    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoadingMessages(false);
      toast({ variant: 'destructive', title: 'Could not load messages for this chat.' });
    });

    // Cleanup subscription on component unmount or conversation change
    return () => unsubscribe();
  }, [currentUser, selectedConversation, toast]);
  
  // 3. Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedConversation) return;

    const textToSend = newMessage;
    setNewMessage(""); // Optimistically clear the input

    const result = await sendMessage(currentUser.uid, selectedConversation.id, textToSend);

    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Message Failed',
        description: result.error,
      });
      setNewMessage(textToSend); // Restore input on failure
    }
  };

  const handleGenerateIcebreakers = async () => {
    if (!currentUser || !selectedConversation) return;
    
    setIsGeneratingIcebreakers(true);
    setIcebreakers([]);
    setIsIcebreakerDialogOpen(true);

    const result = await generateIcebreakersAction(currentUser.uid, selectedConversation.id);
    
    if (result.success && result.icebreakers) {
      setIcebreakers(result.icebreakers);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not generate suggestions.'
      });
      setIsIcebreakerDialogOpen(false);
    }
    
    setIsGeneratingIcebreakers(false);
  };
  
  const handleUseIcebreaker = (icebreaker: string) => {
    setNewMessage(icebreaker);
    setIsIcebreakerDialogOpen(false);
    toast({ title: 'Icebreaker added!', description: 'Your message is ready to send.' });
  };
  
  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  }
  
  const hasSubscription = currentUserProfile?.subscription && currentUserProfile.subscription !== 'Free';

  // --- RENDER LOGIC ---

  if (loadingMatches) {
    return (
        <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  if (matches.length === 0) {
     return (
        <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm text-center p-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="font-headline text-3xl font-bold">No Messages Yet</h2>
            <p className="text-muted-foreground max-w-sm">When you match with someone, you can start a conversation with them here.</p>
        </div>
     )
  }


  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] w-full rounded-lg border bg-card text-card-foreground shadow-sm">
        <aside className="w-full max-w-xs border-r">
          <div className="p-4">
            <h2 className="font-headline text-2xl font-bold">Chats</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-8rem)]">
              <div className="flex flex-col">
              {matches.map((match) => (
                  <button
                  key={match.id}
                  onClick={() => setSelectedConversation(match)}
                  className={cn(
                      'flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50',
                      selectedConversation?.id === match.id && 'bg-muted'
                  )}
                  >
                  <Avatar className="h-12 w-12">
                      <AvatarImage src={match.imageUrl} alt={match.name} data-ai-hint={match.aiHint} />
                      <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate flex items-center gap-1">{match.name} {match.verificationStatus === 'verified' && <ShieldCheck className="h-4 w-4 text-primary" title="Verified Profile" />}</p>
                      {/* In a real app, you'd show last message preview from the conversation doc */}
                      <p className="text-sm text-muted-foreground truncate">Start chatting...</p>
                  </div>
                  </button>
              ))}
              </div>
          </ScrollArea>
        </aside>

        <section className="flex flex-1 flex-col">
          {selectedConversation ? (
            <>
              <header className="flex items-center gap-3 border-b p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.imageUrl} alt={selectedConversation.name} data-ai-hint={selectedConversation.aiHint} />
                  <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold flex items-center gap-1.5">{selectedConversation.name} {selectedConversation.verificationStatus === 'verified' && <ShieldCheck className="h-4 w-4 text-primary" title="Verified Profile" />}</h3>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </header>
              <div className="relative flex-1">
                  <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  <div className="space-y-4">
                      {loadingMessages ? (
                          <div className="flex justify-center items-center h-full">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                      ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                          <MessageSquare className="h-12 w-12 mb-4" />
                          <p className="font-medium">No messages yet.</p>
                          <p className="text-sm">Be the first to say something!</p>
                          </div>
                      ) : (
                          messages.map((message) => (
                          <div
                              key={message.id}
                              className={cn(
                              'flex items-end gap-2',
                              message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                              )}
                          >
                              {message.senderId !== currentUser?.uid && (
                                  <Avatar className="h-8 w-8">
                                      <AvatarImage src={selectedConversation.imageUrl} alt={selectedConversation.name} />
                                      <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                              )}
                              <div className={cn(
                                  'max-w-xs rounded-lg p-3 lg:max-w-md',
                                  message.senderId === currentUser?.uid
                                  ? 'rounded-br-none bg-primary text-primary-foreground'
                                  : 'rounded-bl-none bg-muted'
                              )}>
                              <p className="text-sm">{message.text}</p>
                              <p className="mt-1 text-right text-xs text-muted-foreground/80">{formatMessageTime(message.createdAt)}</p>
                              </div>
                          </div>
                          ))
                      )}
                  </div>
                  </ScrollArea>
                  {!hasSubscription && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/95 via-background/90 to-background/80 backdrop-blur-sm z-10">
                          <Card className="p-8 text-center shadow-2xl max-w-sm">
                              <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
                              <h2 className="font-headline text-3xl font-bold">Unlock Messaging</h2>
                              <p className="text-muted-foreground mt-2 mb-6">You've found a match! Upgrade to a Premium subscription to send messages and get to know them better.</p>
                              <Button size="lg" asChild>
                                  <Link href="/subscription">
                                      Upgrade Your Plan
                                  </Link>
                              </Button>
                          </Card>
                      </div>
                  )}
              </div>
              <footer className="border-t p-4">
                <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
                  <Button variant="outline" size="icon" type="button" onClick={handleGenerateIcebreakers} disabled={!hasSubscription || isGeneratingIcebreakers} title="Generate AI Icebreakers">
                    <Sparkles className="h-4 w-4" />
                    <span className="sr-only">Generate AI Icebreakers</span>
                  </Button>
                  <Input placeholder="Type a message..." autoComplete="off" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={!hasSubscription} />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || !hasSubscription}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex h-full flex-1 items-center justify-center">
              <div className="text-center">
                <h2 className="font-headline text-2xl">Select a conversation</h2>
                <p className="text-muted-foreground">Choose one of your matches to start chatting.</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <Dialog open={isIcebreakerDialogOpen} onOpenChange={setIsIcebreakerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Icebreakers</DialogTitle>
            <DialogDescription>
              Here are a few suggestions to get the conversation started.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGeneratingIcebreakers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                  {icebreakers.map((suggestion, index) => (
                      <Card key={index} className="p-4 bg-muted/50">
                          <p className="text-sm text-foreground">{suggestion}</p>
                          <div className="flex justify-end mt-2">
                              <Button size="sm" variant="ghost" onClick={() => handleUseIcebreaker(suggestion)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Use this
                              </Button>
                          </div>
                      </Card>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
