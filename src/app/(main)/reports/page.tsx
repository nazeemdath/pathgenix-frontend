'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InsightXReportData } from '@/lib/types';
import {
  ArrowRight,
  Brain,
  Compass,
  Zap,
  Download,
  Sparkles,
  GraduationCap,
  Wrench,
  Globe,
  FileText,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { downloadPdfReport, getLatestAssessmentResult } from '@/lib/actions';

// RIASEC Holland Code metadata matching Akshay's pathgenixTools.py
const RIASEC_CONFIG: Record<
  string,
  { label: string; tag: string; desc: string; icon: string; letter: string; color: string; tint: string }
> = {
  investigative: {
    label: 'Investigative',
    tag: 'Thinker',
    letter: 'I',
    desc: 'Enjoys intellectual challenges, analyzing data, research & discovering how things work.',
    icon: '🔬',
    color: '#4C3FCC',
    tint: '#EAE8FB',
  },
  realistic: {
    label: 'Realistic',
    tag: 'Doer',
    letter: 'R',
    desc: 'Prefers hands-on, practical, technical & physical problem solving.',
    icon: '🛠️',
    color: '#D6293D',
    tint: '#FBE2E4',
  },
  artistic: {
    label: 'Artistic',
    tag: 'Creator',
    letter: 'A',
    desc: 'Values self-expression, innovative ideas, design & unstructured creativity.',
    icon: '🎨',
    color: '#A78BFA',
    tint: '#F0ECFE',
  },
  social: {
    label: 'Social',
    tag: 'Helper',
    letter: 'S',
    desc: 'Thrives in collaborative environments, teaching, counseling & community impact.',
    icon: '🤝',
    color: '#E08B6B',
    tint: '#FBEBE3',
  },
  enterprising: {
    label: 'Enterprising',
    tag: 'Leader',
    letter: 'E',
    desc: 'Enjoys taking initiative, persuasion, business leadership & driving strategic outcomes.',
    icon: '🚀',
    color: '#7FA8D9',
    tint: '#E7EFF9',
  },
  conventional: {
    label: 'Conventional',
    tag: 'Organizer',
    letter: 'C',
    desc: 'Excels in systematic workflows, detail orientation, data management & precision.',
    icon: '📊',
    color: '#0F9D74',
    tint: '#DFF5EC',
  },
};

// Big Five Personality (OCEAN) metadata matching Akshay's pathgenixTools.py
const OCEAN_CONFIG: Record<
  string,
  { label: string; letter: string; subtitle: string; highDesc: string; lowDesc: string; color: string; tint: string }
> = {
  openness: {
    label: 'Openness to Experience',
    letter: 'O',
    subtitle: 'Intellectual curiosity, imagination & abstract thinking',
    highDesc: 'Broad-minded, inventive, highly adaptable to new concepts and novel challenges.',
    lowDesc: 'Pragmatic, structured, preferring concrete facts and proven approaches.',
    color: '#D9531E',
    tint: '#FBE3D3',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    letter: 'C',
    subtitle: 'Self-discipline, organization & goal-directed persistence',
    highDesc: 'Methodical, thorough, highly dependable and focused on long-term goals.',
    lowDesc: 'Flexible, spontaneous, preferring fast-paced and agile environments.',
    color: '#1C8FAE',
    tint: '#D8F0F5',
  },
  extraversion: {
    label: 'Extraversion',
    letter: 'E',
    subtitle: 'Energy from social interaction, assertiveness & expressiveness',
    highDesc: 'Outgoing, collaborative, energized by team dynamics and group initiatives.',
    lowDesc: 'Independent, reflective, thriving in deep and focused solo problem-solving.',
    color: '#D6295B',
    tint: '#FBDDE4',
  },
  agreeableness: {
    label: 'Agreeableness',
    letter: 'A',
    subtitle: 'Empathy, cooperativeness, compassion & trust',
    highDesc: 'Team-oriented, empathetic, naturally skilled in constructive collaboration.',
    lowDesc: 'Direct, analytical, candid, and objective in critical decision making.',
    color: '#16A34A',
    tint: '#DCFCE7',
  },
  neuroticism: {
    label: 'Emotional Stability',
    letter: 'N',
    subtitle: 'Stress resilience, calm under pressure & emotional poise',
    highDesc: 'Calm under pressure, resilient, and composed during ambiguity or exam stress.',
    lowDesc: 'Emotionally alert, vigilant to details, and responsive to urgent demands.',
    color: '#7C3AED',
    tint: '#EDE4FF',
  },
};

export default function ReportsPage() {
  const [insightXData, setInsightXData] = React.useState<InsightXReportData | null>(null);
  const [skillScores, setSkillScores] = React.useState<Record<string, number> | null>(null);
  const [cvqScores, setCvqScores] = React.useState<Record<string, number> | null>(null);
  const [generalInfo, setGeneralInfo] = React.useState<any>(null);
  const [hasAssessmentData, setHasAssessmentData] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    async function loadData() {
      if (authLoading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await getLatestAssessmentResult();
        if (res.success && res.data) {
          setHasAssessmentData(true);
          setGeneralInfo(res.data.generalInfo);
          setInsightXData(res.data.insightXReport);
          setSkillScores(res.data.insightXReport.skillProfile);
          setCvqScores(res.data.insightXReport.cvqProfile);
        } else {
          setHasAssessmentData(false);
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Could not load report',
          description: 'There was a problem loading your diagnostic scoring data.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, authLoading, toast]);

  const handleGenerateReport = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'Please log in to download your report.',
      });
      return;
    }

    setIsGeneratingReport(true);
    try {
      toast({
        title: 'Generating Report...',
        description: 'Preparing your official InsightX PDF scoring report.',
      });

      const result = await downloadPdfReport(user.uid);

      if (result.success) {
        toast({
          title: 'Report Downloaded!',
          description: 'Your official InsightX PDF report has been downloaded.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error || 'Could not generate PDF report.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader title="InsightX™ Diagnostic Report" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading your diagnostic report & metrics...</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate RIASEC Top Code
  const topRiasecLetters = insightXData?.interestProfile
    ? Object.entries(insightXData.interestProfile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  const riasecCode = topRiasecLetters
    .map(([key]) => key.charAt(0).toUpperCase())
    .join('');

  // PIC Score & Classification
  const picScore = insightXData?.picIndex ?? 0;
  const getScoreClassification = (score: number) => {
    if (score >= 85)
      return {
        label: 'Exceptional Alignment',
        color: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    if (score >= 75)
      return {
        label: 'Strong Alignment',
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    if (score >= 60)
      return {
        label: 'Moderate Alignment',
        color: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    return {
      label: 'Developing Alignment',
      color: 'text-purple-600 dark:text-purple-400',
      badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };
  };
  const picCategory = getScoreClassification(picScore);

  const piccComponents = insightXData?.piccComponents ?? {};
  const hasCompleteScoreBreakdown = Object.keys(piccComponents).length > 0;
  const personalityComponent = piccComponents['Personality Alignment (P)'];
  const interestComponent = piccComponents['Interest Alignment (I)'];
  const cognitiveComponent = piccComponents['Cognitive & Skills (C)'];
  const cvqComponent = piccComponents['Contextual Viability (CVQ)'];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <AppHeader title="InsightX™ Diagnostic Report" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-8">
          {hasAssessmentData && insightXData ? (
            <>
              {/* Top Hero Banner & PICC™ Score Overview */}
              <div className="relative overflow-hidden rounded-2xl bg-card border border-border/80 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-background/80 gap-1.5 py-1 px-3 border-primary/30 text-primary font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        InsightX™ Official Assessment Report
                      </Badge>
                      {generalInfo?.classOfStudy && (
                        <Badge variant="secondary" className="gap-1 py-1 px-2.5 font-semibold">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Class {generalInfo.classOfStudy}
                        </Badge>
                      )}
                      {generalInfo?.schoolOrCollege && (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          {generalInfo.schoolOrCollege}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline">
                      {generalInfo?.name ? `${generalInfo.name}'s Diagnostic Report` : 'Your Psychometric & Capability Report'}
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      Deterministic multi-dimensional assessment metrics evaluating Personality (Big Five OCEAN), Vocational Interests (RIASEC), Cognitive Indicators, Core Skills, and Contextual Viability (CVQ).
                    </p>
                  </div>

                  {/* PICC Composite Score Card */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 bg-secondary/40 border border-border/80 rounded-xl p-5 shadow-xs min-w-[270px]">
                    <div className="text-center sm:text-left lg:text-center">
                      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                        PICC™ Composite Score Index
                      </div>
                      <div className="flex items-baseline justify-center sm:justify-start lg:justify-center gap-1 mt-1">
                        <span className="text-4xl font-black tracking-tight text-primary font-headline">
                          {picScore}
                        </span>
                        <span className="text-muted-foreground font-medium text-lg">/100</span>
                      </div>
                      <Badge variant="outline" className={`mt-2 ${picCategory.badge}`}>
                        {picCategory.label}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2 w-full pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="w-full bg-hero-gradient hover:opacity-95 text-white shadow-sm font-semibold"
                      >
                        {isGeneratingReport ? (
                          <>
                            <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Official PDF
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild className="w-full font-semibold">
                        <Link href="/pathxplore">
                          Explore Matched Careers <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 4-Pillar PICC Component Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-violet-500" />
                        Personality (P)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {personalityComponent ? `Weight: ${personalityComponent.weight * 100}%` : ''}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {personalityComponent ? `${Math.round(personalityComponent.value)}%` : '—'}
                    </div>
                    <Progress value={personalityComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-indigo-500" />
                        Interest (I)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {interestComponent ? `Weight: ${interestComponent.weight * 100}%` : ''}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground flex items-center justify-between">
                      <span>{interestComponent ? `${Math.round(interestComponent.value)}%` : '—'}</span>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono tracking-wider">{riasecCode || 'IRC'}</span>
                    </div>
                    <Progress value={interestComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        Cognitive & Skills (C)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {cognitiveComponent ? `Weight: ${cognitiveComponent.weight * 100}%` : ''}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cognitiveComponent ? `${Math.round(cognitiveComponent.value)}%` : '—'}
                    </div>
                    <Progress value={cognitiveComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        Contextual Viability (CVQ)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {cvqComponent ? `Weight: ${cvqComponent.weight * 100}%` : ''}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cvqComponent ? `${Math.round(cvqComponent.value)}%` : '—'}
                    </div>
                    <Progress value={cvqComponent?.value ?? 0} className="h-1.5" />
                  </div>
                </div>
              </div>

              {/* Multi-Section Scoring Metrics Tabs */}
              <Tabs defaultValue="personality" className="w-full space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1.5 bg-card border border-border shadow-xs rounded-xl gap-1">
                  <TabsTrigger
                    value="personality"
                    className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm"
                  >
                    <Brain className="h-4 w-4" />
                    Personality (OCEAN)
                  </TabsTrigger>
                  <TabsTrigger
                    value="interest"
                    className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm"
                  >
                    <Compass className="h-4 w-4" />
                    Interests (RIASEC)
                  </TabsTrigger>
                  <TabsTrigger
                    value="cognitive"
                    className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm"
                  >
                    <Zap className="h-4 w-4" />
                    Cognitive Indicators
                  </TabsTrigger>
                  <TabsTrigger
                    value="skills"
                    className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm"
                  >
                    <Wrench className="h-4 w-4" />
                    Skill Mapping
                  </TabsTrigger>
                  <TabsTrigger
                    value="cvq"
                    className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    Contextual (CVQ)
                  </TabsTrigger>
                </TabsList>

                {/* ----------------- SECTION 1: PERSONALITY (OCEAN) ----------------- */}
                <TabsContent value="personality" className="space-y-6">
                  <Card className="border-border shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                          <Brain className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section A — Big Five Personality Profile (OCEAN)
                          </CardTitle>
                          <CardDescription>
                            Measures the 5 fundamental behavioral traits and work style dynamics.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-5">
                        {insightXData?.personalityProfile &&
                          Object.entries(insightXData.personalityProfile).map(([traitKey, score]) => {
                            const config = OCEAN_CONFIG[traitKey] || {
                              label: traitKey,
                              letter: traitKey.charAt(0).toUpperCase(),
                              subtitle: '',
                              highDesc: '',
                              lowDesc: '',
                              color: '#6B4FE0',
                              tint: '#FAF7F2',
                            };
                            const isHigh = score >= 60;

                            return (
                              <div
                                key={traitKey}
                                className="p-4 rounded-xl border space-y-3 shadow-xs"
                                style={{
                                  backgroundColor: config.tint,
                                  borderColor: config.color + '40',
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <span
                                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs text-white shadow-xs"
                                      style={{ backgroundColor: config.color }}
                                    >
                                      {config.letter}
                                    </span>
                                    <div>
                                      <div className="font-bold text-sm" style={{ color: config.color }}>
                                        {config.label}
                                      </div>
                                      <div className="text-xs text-[#6B7280]">{config.subtitle}</div>
                                    </div>
                                  </div>
                                  <span
                                    className="font-bold text-xs px-2.5 py-1 rounded-full text-white shadow-xs"
                                    style={{ backgroundColor: config.color }}
                                  >
                                    {score}%
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="h-2.5 rounded-full bg-white/80 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{ width: `${score}%`, backgroundColor: config.color }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-[11px] text-[#6B7280] pt-0.5">
                                    <span>Developing</span>
                                    <span className="font-semibold" style={{ color: config.color }}>
                                      {score >= 80 ? 'Very High' : score >= 60 ? 'High' : score >= 40 ? 'Moderate' : 'Developing'}
                                    </span>
                                    <span>Very High</span>
                                  </div>
                                </div>

                                <p className="text-xs text-[#374151] bg-white/60 p-2.5 rounded-md leading-relaxed">
                                  💡 {isHigh ? config.highDesc : config.lowDesc}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ----------------- SECTION 2: INTERESTS (RIASEC) ----------------- */}
                <TabsContent value="interest" className="space-y-6">
                  <Card className="border-border shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs"
                            style={{ backgroundColor: '#241A3D' }}
                          >
                            <Compass className="h-4 w-4" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold font-headline text-[#1F2937] dark:text-white">
                              Section B — Holland Vocational Interest Inventory (RIASEC)
                            </CardTitle>
                            <CardDescription>
                              Evaluates intrinsic vocational alignment across 6 occupational interest themes.
                            </CardDescription>
                          </div>
                        </div>

                        {riasecCode && (
                          <div
                            className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xs"
                            style={{ backgroundColor: '#241A3D' }}
                          >
                            <span className="text-[#E9C46A]">Primary Holland Code:</span>
                            <span className="text-base tracking-widest font-mono font-black text-white">{riasecCode}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insightXData?.interestProfile &&
                          Object.entries(insightXData.interestProfile).map(([key, score]) => {
                            const meta = RIASEC_CONFIG[key] || {
                              label: key,
                              tag: key,
                              letter: key.charAt(0).toUpperCase(),
                              desc: '',
                              icon: '🎯',
                              color: '#4C3FCC',
                              tint: '#EAE8FB',
                            };
                            const isTop3 = topRiasecLetters.some(([tKey]) => tKey === key);

                            return (
                              <div
                                key={key}
                                className="p-4 rounded-xl border transition-all shadow-xs"
                                style={{
                                  backgroundColor: meta.tint,
                                  borderColor: isTop3 ? meta.color : meta.color + '40',
                                  borderWidth: isTop3 ? '2px' : '1px',
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-2xl">{meta.icon}</span>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-sm" style={{ color: meta.color }}>
                                          {meta.label}
                                        </h4>
                                        <span className="text-xs font-mono font-bold" style={{ color: meta.color }}>
                                          ({meta.letter})
                                        </span>
                                      </div>
                                      <span className="text-[11px] font-semibold" style={{ color: meta.color }}>
                                        The {meta.tag}
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-xs"
                                    style={{ backgroundColor: meta.color }}
                                  >
                                    {score}%
                                  </span>
                                </div>
                                <div className="h-2 rounded-full bg-white/80 overflow-hidden mb-2">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${score}%`, backgroundColor: meta.color }}
                                  />
                                </div>
                                <p className="text-xs text-[#374151] line-clamp-2 leading-relaxed">{meta.desc}</p>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ----------------- SECTION 3: COGNITIVE INDICATORS ----------------- */}
                <TabsContent value="cognitive" className="space-y-6">
                  <Card className="border-border shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section C — Cognitive Capability Indicators
                          </CardTitle>
                          <CardDescription>
                            Standardized performance scores assessing logical deduction, verbal clarity, and numerical reasoning.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          {
                            key: 'logical_ability',
                            title: 'Logical Ability',
                            score: insightXData?.cognitiveProfile?.logical_ability ?? 0,
                            desc: 'Pattern recognition, inductive reasoning & structured rule application.',
                          },
                          {
                            key: 'analytical_ability',
                            title: 'Analytical Ability',
                            score: insightXData?.cognitiveProfile?.analytical_ability ?? 0,
                            desc: 'Critical evaluation, comparison, and structured analysis of complex information.',
                          },
                          {
                            key: 'numerical_ability',
                            title: 'Numerical Ability',
                            score: insightXData?.cognitiveProfile?.numerical_ability ?? 0,
                            desc: 'Quantitative fluency, mathematical relations & data interpretation.',
                          },
                          {
                            key: 'verbal_ability',
                            title: 'Verbal Ability',
                            score: insightXData?.cognitiveProfile?.verbal_ability ?? 0,
                            desc: 'Reading comprehension, language precision & contextual understanding.',
                          },
                          {
                            key: 'abstract_ability',
                            title: 'Abstract Ability',
                            score: insightXData?.cognitiveProfile?.abstract_ability ?? 0,
                            desc: 'Conceptual pattern recognition and flexible thinking with unfamiliar ideas.',
                          },
                          {
                            key: 'spatial_ability',
                            title: 'Spatial Ability',
                            score: insightXData?.cognitiveProfile?.spatial_ability ?? 0,
                            desc: 'Understanding visual patterns, forms, and spatial relationships.',
                          },
                          {
                            key: 'attention_and_focus',
                            title: 'Attention & Focus',
                            score: insightXData?.cognitiveProfile?.attention_and_focus ?? 0,
                            desc: 'Sustained concentration and accuracy across multi-step tasks.',
                          },
                          {
                            key: 'adaptability',
                            title: 'Adaptability',
                            score: insightXData?.cognitiveProfile?.adaptability ?? 0,
                            desc: 'Readiness to adjust reasoning and approach when conditions change.',
                          },
                        ].map((cog) => (
                          <div key={cog.key} className="p-4 rounded-xl bg-card border border-border/80 space-y-2.5 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-foreground">{cog.title}</span>
                              <span className="text-base font-black font-headline text-primary">{cog.score}%</span>
                            </div>
                            <Progress value={cog.score} className="h-2" />
                            <p className="text-xs text-muted-foreground leading-relaxed">{cog.desc}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ----------------- SECTION 4: SKILL MAPPING ----------------- */}
                <TabsContent value="skills" className="space-y-6">
                  <Card className="border-border shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section D — Core 21st-Century Skill Mapping
                          </CardTitle>
                          <CardDescription>
                            Skill proficiency across communication, tech agility, collaboration, problem solving, and initiative.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hasCompleteScoreBreakdown ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {skillScores &&
                            Object.entries(skillScores).map(([skillTitle, score]) => (
                              <div key={skillTitle} className="p-4 rounded-xl bg-card border border-border/80 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-foreground">{skillTitle}</span>
                                  <Badge variant="secondary" className="font-bold text-xs">
                                    {score}%
                                  </Badge>
                                </div>
                                <Progress value={score} className="h-2" />
                                <div className="text-[11px] text-muted-foreground">
                                  {score >= 80 ? 'Proficient • Strong Strength' : score >= 60 ? 'Competent • Ready' : 'Developing • Focus Area'}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Complete the assessment to view your full skill breakdown.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ----------------- SECTION 5: CONTEXTUAL VIABILITY (CVQ) ----------------- */}
                <TabsContent value="cvq" className="space-y-6">
                  <Card className="border-border shadow-xs">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section E — Contextual Viability Questionnaire (CVQ)
                          </CardTitle>
                          <CardDescription>
                            Evaluates environmental, technological, cultural, and readiness factors supporting your educational journey.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {hasCompleteScoreBreakdown ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cvqScores &&
                            Object.entries(cvqScores).map(([cvqTitle, score]) => (
                              <div key={cvqTitle} className="p-4 rounded-xl bg-card border border-border/80 space-y-2.5 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-foreground">{cvqTitle}</span>
                                  <Badge variant="outline" className="font-bold text-xs">
                                    {score}%
                                  </Badge>
                                </div>
                                <Progress value={score} className="h-2" />
                                <div className="text-[11px] text-muted-foreground">
                                  {score >= 80 ? 'High Readiness' : score >= 60 ? 'Moderate Readiness' : 'Needs Support'}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Complete the assessment to view your full contextual viability metrics.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Next Step Forwarding Banner */}
              <div className="rounded-2xl p-6 md:p-8 bg-card border border-border/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider font-headline">
                    Step 2 in Your Journey
                  </div>
                  <h3 className="text-2xl font-bold font-headline text-foreground">
                    Ready to Explore Careers Matched to Your Profile?
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-xl">
                    Our AI matching engine maps your InsightX scores to India&apos;s top career pathways, cluster requirements, and degree roadmaps.
                  </p>
                </div>
                <Button
                  size="lg"
                  asChild
                  className="bg-hero-gradient hover:opacity-95 text-white font-semibold shadow-sm rounded-xl px-6 py-6 shrink-0"
                >
                  <Link href="/pathxplore" className="inline-flex items-center gap-2">
                    Proceed to PathXplore Careers <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-dashed p-8 text-center">
              <CardHeader className="items-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-bold font-headline">No Assessment Results Found</CardTitle>
                <CardDescription className="max-w-md mx-auto text-sm leading-relaxed">
                  Take the InsightX™ 90-question assessment to uncover your personality, interests, cognitive capabilities, and download your official report.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center pt-2">
                <Button asChild size="lg" className="bg-hero-gradient text-white font-semibold rounded-xl px-7">
                  <Link href="/assessment">
                    Take InsightX Assessment <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
