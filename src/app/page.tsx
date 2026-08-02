'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, ClipboardCheck, Compass, Goal } from 'lucide-react';
import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';

const featureCards = [
    {
        icon: <ClipboardCheck className="w-8 h-8 text-primary" />,
        title: 'InsightX Assessment',
        description: 'Understand who you are. Take our scientific diagnostic tests to uncover your personality, interests, and skills.',
        link: '/assessment',
        linkText: 'Start Assessment',
    },
    {
        icon: <Compass className="w-8 h-8 text-primary" />,
        title: 'PathXplore Career',
        description: 'Explore careers that truly fit. Our matching engine maps your profile to the top 5 career options.',
        link: '/pathxplore',
        linkText: 'Explore Careers',
    },
    {
        icon: <Goal className="w-8 h-8 text-primary" />,
        title: 'GoalMint Planner',
        description: 'Design your SMART career plan. Convert your chosen career path into actionable 1, 3, and 5-year plans.',
        link: '/goals',
        linkText: 'Plan Your Goals',
    },
    {
        icon: <Bot className="w-8 h-8 text-primary" />,
        title: 'MentorSuite AI',
        description: 'Grow with expert guidance. Chat with our Mentor to get reflective questions and career advice.',
        link: '/mentors',
        linkText: 'Chat with Mentor',
    },
]

export default function Home() {

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="Home" showAuthButtons={true} />
      <main className="flex-1 p-8 md:p-10 lg:p-12">
            <div className="mx-auto max-w-7xl space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">Welcome to Your Career Journey</h1>
                    <p className="text-xl font-medium text-primary">Your Blueprint for Career Excellence. Design Your Future Today!</p>
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        Path-GeniX™ is here to guide you through a structured, personalized, and metacognitive career discovery journey. Let's build your future, Today.
                    </p>
                    <Button size="lg" asChild className="font-semibold">
                       <Link href="/assessment">Begin Your Journey <ArrowRight /></Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {featureCards.map((card) => (
                        <Card key={card.title} className="flex flex-col">
                            <CardHeader className="flex-row items-start gap-4">
                                {card.icon}
                                <CardTitle className="font-headline text-xl">{card.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <CardDescription>{card.description}</CardDescription>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={card.link}>
                                        {card.linkText} <ArrowRight className="ml-2"/>
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
      </main>
    </div>
  );
}
