'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, ClipboardCheck, Compass, Goal, Sparkles, CheckCircle2, Award } from 'lucide-react';
import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';

const journeySteps = [
  {
    step: 'Step 01',
    phase: 'DIAGNOSE',
    icon: <ClipboardCheck className="w-6 h-6 text-[#6B4FE0]" />,
    iconBg: 'bg-[#6B4FE0]/10 border-[#6B4FE0]/20',
    title: 'InsightX Assessment',
    description: 'Uncover your natural style across OCEAN personality, RIASEC interests, 8 cognitive categories, and 21st-century skills.',
    badge: '90 Questions',
    link: '/assessment',
    linkText: 'Start Assessment',
    primary: true,
  },
  {
    step: 'Step 02',
    phase: 'MATCH',
    icon: <Compass className="w-6 h-6 text-[#2E7CE0]" />,
    iconBg: 'bg-[#2E7CE0]/10 border-[#2E7CE0]/20',
    title: 'PathXplore Career',
    description: 'Discover your top 5 matched career pathways mapped with psychometric confidence scores and eligibility requirements.',
    badge: 'Deterministic Match',
    link: '/pathxplore',
    linkText: 'Explore Careers',
    primary: false,
  },
  {
    step: 'Step 03',
    phase: 'PLAN',
    icon: <Goal className="w-6 h-6 text-[#16A34A]" />,
    iconBg: 'bg-[#16A34A]/10 border-[#16A34A]/20',
    title: 'GoalMint Planner',
    description: 'Transform matched career options into concrete, step-by-step 1, 3, and 5-year SMART milestone roadmaps.',
    badge: 'SMART Milestones',
    link: '/goals',
    linkText: 'Plan Your Goals',
    primary: false,
  },
  {
    step: 'Step 04',
    phase: 'GROW',
    icon: <Bot className="w-6 h-6 text-[#E9C46A]" />,
    iconBg: 'bg-[#E9C46A]/15 border-[#E9C46A]/30',
    title: 'MentorSuite AI',
    description: 'Engage with personalized AI career counselors to reflect on decisions, college queries, and preparation strategies.',
    badge: '24/7 Guidance',
    link: '/mentors',
    linkText: 'Chat with Mentor',
    primary: false,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <AppHeader title="Home" showAuthButtons={true} />
      <main className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="mx-auto max-w-7xl space-y-12 sm:space-y-16">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-8 sm:p-10 lg:p-12 shadow-sm">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-hero-gradient-subtle blur-3xl pointer-events-none" />
            
            <div className="relative max-w-3xl space-y-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-foreground leading-[1.12]">
                Discover Your Genius Path with{' '}
                <span className="text-hero-gradient">Scientific Precision</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Path-GeniX™ is India&apos;s authoritative diagnostic platform guiding students through a structured, four-step career discovery journey. Uncover your psychometric DNA and construct an actionable blueprint for university and beyond.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="bg-hero-gradient hover:opacity-95 text-white font-semibold shadow-md shadow-purple-900/15 rounded-xl px-7 py-6 text-base"
                >
                  <Link href="/assessment" className="inline-flex items-center gap-2">
                    Begin InsightX Assessment <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-border hover:bg-secondary text-foreground font-semibold rounded-xl px-6 py-6 text-base"
                >
                  <Link href="/pathxplore">Explore Top Careers</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-border/70">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground">90</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Diagnostic Metrics</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground">6</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Core Dimensions</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground">Top 5</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Matched Careers</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-headline text-foreground">1/3/5 Yr</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Actionable Milestones</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Step Journey Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-primary tracking-wider uppercase font-headline">The 4-Step Framework</p>
                <h2 className="text-2xl sm:text-3xl font-bold font-headline tracking-tight text-foreground mt-1">
                  How Path-GeniX Works
                </h2>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                From self-awareness to concrete goal execution, each module builds directly on your diagnostic scores.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {journeySteps.map((card) => (
                <Card
                  key={card.title}
                  className="flex flex-col rounded-2xl border-border/80 bg-card hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground tracking-wider uppercase font-headline">
                        {card.step} · {card.phase}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {card.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${card.iconBg}`}>
                        {card.icon}
                      </div>
                      <CardTitle className="font-headline text-lg text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow pt-0 pb-4">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      asChild
                      variant={card.primary ? 'default' : 'secondary'}
                      className={`w-full rounded-xl font-semibold text-sm transition-all ${
                        card.primary ? 'bg-hero-gradient text-white hover:opacity-95' : ''
                      }`}
                    >
                      <Link href={card.link} className="flex items-center justify-center gap-2">
                        {card.linkText} <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
