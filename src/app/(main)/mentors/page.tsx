
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Bot, CornerDownLeft } from 'lucide-react';
import { getMentorResponse, getUserData } from '@/lib/actions';
import { LoadingSpinner } from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import type { CareerSuggestion, GoalPlan, MentorMessage } from '@/lib/types';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

export default function MentorsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<MentorMessage[]>([]);
  const initialMessage: MentorMessage = {
    role: 'model',
    content: "Hello! I am your MentorSuite AI, a Socratic mirror designed to help you reflect on your career path. What's on your mind today?",
  };
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [studentProfile, setStudentProfile] = React.useState('');
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!user) {
        setIsDataLoading(false);
        return;
      }
      
      setIsDataLoading(true);
      try {
        const res = await getUserData(user.uid);
        if (res.success && res.data) {
            let profile = "Student's Path-GeniX Profile:\n\n";
            if (res.data.careerSuggestions) {
                const results: CareerSuggestion[] = res.data.careerSuggestions;
                profile += "=== PathXplore Career Suggestions ===\n";
                results.slice(0, 3).forEach((career, index) => {
                    profile += `${index + 1}. ${career.careerName} (Top Match: ${index === 0})\n`;
                    profile += `   - Match Explanation: ${career.matchExplanation}\n`;
                });
                profile += "\n";
            }

            if (res.data.goalPlan) {
                const goals: GoalPlan = res.data.goalPlan;
                profile += "=== GoalMint Plan ===\n";
                Object.entries(goals).forEach(([timeframe, goalList]) => {
                    profile += `**${timeframe.replace('-', ' ')} Goals:**\n`;
                    goalList.forEach(goal => {
                    profile += `   - [${goal.category}] ${goal.title}\n`;
                    });
                });
                profile += "\n";
            }
            setStudentProfile(profile);

            if (res.data.mentorChat) {
                setMessages(res.data.mentorChat);
            }
        }
      } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Could not load data',
            description: 'There was a problem loading your profile data.',
        });
        setStudentProfile("Could not load student profile data.");
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, [user, authLoading, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: MentorMessage = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    const result = await getMentorResponse({ messages: currentMessages, studentProfile, userId: user.uid });
    
    if (result.success && result.data) {
        const modelMessage: MentorMessage = { role: 'model', content: result.data };
        setMessages(prev => [...prev, modelMessage]);
    } else {
        const errorMessage: MentorMessage = { role: 'model', content: "I'm sorry, I encountered an error and couldn't process your message. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
         toast({
            variant: 'destructive',
            title: 'Mentor AI Error',
            description: result.error || 'Failed to get a response.',
        });
    }

    setIsLoading(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };
  
  if (authLoading || isDataLoading) {
      return (
        <div className="flex min-h-0 flex-1 flex-col">
            <AppHeader title="MentorSuite AI" />
            <main className="flex-1 flex items-center justify-center">
                <LoadingSpinner className="h-10 w-10" />
            </main>
        </div>
      )
  }
  
  const displayMessages = messages.length > 0 ? [initialMessage, ...messages] : [initialMessage];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="MentorSuite AI" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
              <CardHeader>
                  <CardTitle className="font-headline">Your Socratic Mirror</CardTitle>
                  <CardDescription>
                      Engage in a reflective conversation to explore your career and educational path.
                  </CardDescription>
              </CardHeader>
            <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                <div className="flex-1 space-y-6 overflow-y-auto pr-4 -mr-4">
                    {displayMessages.map((message, index) => (
                        <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                            {message.role === 'model' && <Bot className="h-8 w-8 text-primary flex-shrink-0" />}
                            <div className={cn("max-w-lg rounded-xl p-4 text-sm whitespace-pre-wrap", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                {message.content}
                            </div>
                            {message.role === 'user' && <User className="h-8 w-8 text-muted-foreground flex-shrink-0" />}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                     {isLoading && (
                        <div className="flex items-center gap-4 p-4">
                            <Bot className="h-8 w-8 text-primary flex-shrink-0 animate-pulse" />
                            <div className="bg-muted p-4 rounded-xl">
                                <LoadingSpinner className="h-5 w-5" />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={user ? "Ask me anything about your career path..." : "Please log in to chat with the mentor."}
                        className="pr-20 min-h-[52px] resize-none"
                        disabled={isLoading || !user}
                    />
                    <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
                        <p className="text-xs text-muted-foreground hidden md:block">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">Shift +</span><CornerDownLeft className="h-3 w-3" />
                            </kbd> for new line
                        </p>
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !user}>
                            <Send className="h-5 w-5" />
                            <span className="sr-only">Send Message</span>
                        </Button>
                    </div>
                </form>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

    