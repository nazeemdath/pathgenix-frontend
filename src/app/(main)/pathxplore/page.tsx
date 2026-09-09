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
import type { InsightXReportData, PathXploreData } from '@/lib/types';
import {
  ArrowRight,
  Brain,
  Compass,
  Zap,
  Download,
  Sparkles,
  Award,
  GraduationCap,
  Activity,
  Layers,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Globe,
  MessageSquare,
  Laptop,
  Coins,
  HeartHandshake,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Star,
  Map,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { downloadPdfReport, getLatestAssessmentResult, generatePathXploreReport } from '@/lib/actions';
import { getUserRecord } from '@/lib/local-app-state';

// Metadata for RIASEC Holland Codes — exact colors from Akshay's pathgenixTools.py RIASEC_META
const RIASEC_CONFIG: Record<string, { label: string; tag: string; desc: string; icon: string; letter: string; color: string; tint: string }> = {
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

// Metadata for Big Five Personality Traits (OCEAN) — exact colors from Akshay's pathgenixTools.py TRAIT_META
const OCEAN_CONFIG: Record<string, { label: string; letter: string; subtitle: string; highDesc: string; lowDesc: string; color: string; tint: string }> = {
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

// SWOT card configuration — exact hex colors from Akshay's PDF code
const SWOT_CONFIG = {
  strengths: {
    title: 'Strengths',
    subtitle: 'INSIDE · WORKING FOR YOU',
    icon: Zap,
    bg: '#DCFCE7',
    accent: '#16A34A',
    border: '#86EFAC',
    dotColor: '#16A34A',
  },
  growth_areas: {
    title: 'Growth Areas',
    subtitle: 'INSIDE · TO WORK ON',
    icon: TrendingUp,
    bg: '#FEF3C7',
    accent: '#A16207',
    border: '#FDE68A',
    dotColor: '#A16207',
  },
  opportunities: {
    title: 'Opportunities',
    subtitle: 'OUTSIDE · DOORS OPENING',
    icon: Lightbulb,
    bg: '#DBEAFE',
    accent: '#2563EB',
    border: '#BFDBFE',
    dotColor: '#2563EB',
  },
  risks: {
    title: 'Risks',
    subtitle: 'OUTSIDE · TO WATCH',
    icon: AlertTriangle,
    bg: '#FEE2E2',
    accent: '#DC2626',
    border: '#FECACA',
    dotColor: '#DC2626',
  },
};

// Cluster card color palettes — exact hex colors from Akshay's PDF CLUSTER_PALETTE
const CLUSTER_COLORS = [
  { bg: '#DCFCE7', accent: '#16A34A', bar: '#16A34A', border: '#86EFAC' },
  { bg: '#DCFCE7', accent: '#16A34A', bar: '#16A34A', border: '#86EFAC' },
  { bg: '#CCFBF1', accent: '#0D9488', bar: '#0D9488', border: '#99F6E4' },
  { bg: '#FEF3C7', accent: '#A16207', bar: '#A16207', border: '#FDE68A' },
  { bg: '#FFEDD5', accent: '#C2410C', bar: '#C2410C', border: '#FED7AA' },
];

export default function PathXplorePage() {
  const [insightXData, setInsightXData] = React.useState<InsightXReportData | null>(null);
  const [skillScores, setSkillScores] = React.useState<Record<string, number> | null>(null);
  const [cvqScores, setCvqScores] = React.useState<Record<string, number> | null>(null);
  const [generalInfo, setGeneralInfo] = React.useState<any>(null);
  const [hasAssessmentData, setHasAssessmentData] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  // PathXplore career intelligence state
  const [pathXploreData, setPathXploreData] = React.useState<PathXploreData | null>(null);
  const [isGeneratingCareerMap, setIsGeneratingCareerMap] = React.useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);

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

        // Load cached PathXplore data from localStorage
        const record = getUserRecord(user.uid);
        if (record?.pathXploreData) {
          setPathXploreData(record.pathXploreData);
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Could not load scores',
          description: 'There was a problem loading your assessment scoring data.',
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
        description: 'We are generating your official InsightX PDF scoring report. This may take a few moments.',
      });

      const result = await downloadPdfReport(user.uid);

      if (result.success) {
        toast({
          title: 'Report Downloaded!',
          description: 'Your official InsightX PDF report has been downloaded successfully.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error || 'Could not generate PDF report. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateCareerMap = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in first.' });
      return;
    }

    setIsGeneratingCareerMap(true);
    try {
      toast({
        title: 'Generating Career Map...',
        description: 'Our AI is analyzing your profile to map your best-fit career directions. This may take a moment.',
      });

      const result = await generatePathXploreReport(user.uid, false);

      if (result.success && result.data) {
        setPathXploreData(result.data);
        toast({
          title: 'Career Map Ready!',
          description: 'Your personalized career intelligence report has been generated.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error || 'Could not generate career map. Please try again.',
        });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsGeneratingCareerMap(false);
    }
  };

  const handleDownloadPathXplorePdf = async () => {
    if (!user) return;
    setIsDownloadingPdf(true);
    try {
      toast({ title: 'Generating PDF...', description: 'Preparing your PathXplore career report PDF.' });
      const result = await generatePathXploreReport(user.uid, true);
      if (result.success) {
        if (result.data) setPathXploreData(result.data);
        toast({ title: 'PDF Downloaded!', description: 'Your PathXplore career report has been downloaded.' });
      } else {
        toast({ variant: 'destructive', title: 'Download Failed', description: result.error || 'Could not download PDF.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader title="PathXplore™ Career Intelligence" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground font-medium">Loading your assessment scores & metrics...</p>
          </div>
        </main>
      </div>
    );
  }

  // Calculate RIASEC Top Code & Archetype
  const topRiasecLetters = insightXData?.interestProfile
    ? Object.entries(insightXData.interestProfile)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  const riasecCode = topRiasecLetters
    .map(([key]) => key.charAt(0).toUpperCase())
    .join('');

  // PIC Index Score
  const picScore = insightXData?.picIndex ?? 0;

  const getScoreClassification = (score: number) => {
    if (score >= 85) return { label: 'Exceptional Alignment', color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    if (score >= 75) return { label: 'Strong Alignment', color: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    if (score >= 60) return { label: 'Moderate Alignment', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    return { label: 'Developing Alignment', color: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
  };

  const picCategory = getScoreClassification(picScore);

  const piccComponents = insightXData?.piccComponents ?? {};
  const hasCompleteScoreBreakdown = Object.keys(piccComponents).length > 0;
  const personalityComponent = piccComponents['Personality Alignment (P)'];
  const interestComponent = piccComponents['Interest Alignment (I)'];
  const cognitiveComponent = piccComponents['Cognitive & Skills (C)'];
  const cvqComponent = piccComponents['Contextual Viability (CVQ)'];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="PathXplore™ Career Intelligence" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-8">
          {hasAssessmentData && insightXData ? (
            <>
              {/* Top Hero Banner & PICC™ Score Overview */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm gap-1.5 py-1 px-3 border-primary/30 text-primary font-semibold">
                        <Sparkles className="h-3.5 w-3.5" />
                        InsightX™ Psychometric Assessment Report
                      </Badge>
                      {generalInfo?.classOfStudy && (
                        <Badge variant="secondary" className="gap-1 py-1 px-2.5">
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
                      {generalInfo?.name ? `${generalInfo.name}'s Assessment Scores` : 'Your Psychometric & Capability Scores'}
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                      Deterministic multi-dimensional assessment metrics evaluating Personality (Big Five OCEAN), Vocational Interests (RIASEC), Cognitive Indicators, Core Skills, and Contextual Viability (CVQ).
                    </p>
                  </div>

                  {/* PICC Composite Score Card */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-5 shadow-sm min-w-[270px]">
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
                        className="w-full shadow-sm font-semibold"
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
                      <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/goals">
                          Proceed to GoalMint™ <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 4-Pillar PICC Component Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/60">
                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-violet-500" />
                        Personality (P)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {personalityComponent ? `Weight: ${personalityComponent.weight * 100}%` : 'Not available'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {personalityComponent ? `${Math.round(personalityComponent.value)}%` : 'Not available'}
                    </div>
                    <Progress value={personalityComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-indigo-500" />
                        Interest (I)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {interestComponent ? `Weight: ${interestComponent.weight * 100}%` : 'Not available'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground flex items-center justify-between">
                      <span>{interestComponent ? `${Math.round(interestComponent.value)}%` : 'Not available'}</span>
                      <span className="text-xs text-indigo-500 font-bold font-mono tracking-wider">{riasecCode || 'IRC'}</span>
                    </div>
                    <Progress value={interestComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        Cognitive & Skills (C)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {cognitiveComponent ? `Weight: ${cognitiveComponent.weight * 100}%` : 'Not available'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cognitiveComponent ? `${Math.round(cognitiveComponent.value)}%` : 'Not available'}
                    </div>
                    <Progress value={cognitiveComponent?.value ?? 0} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        Contextual Viability (CVQ)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">
                        {cvqComponent ? `Weight: ${cvqComponent.weight * 100}%` : 'Not available'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cvqComponent ? `${Math.round(cvqComponent.value)}%` : 'Not available'}
                    </div>
                    <Progress value={cvqComponent?.value ?? 0} className="h-1.5" />
                  </div>
                </div>
              </div>

              {/* Multi-Section Scoring Metrics Tabs */}
              <Tabs defaultValue="personality" className="w-full space-y-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1.5 bg-card border border-border shadow-sm rounded-xl gap-1">
                  <TabsTrigger value="personality" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                    <Brain className="h-4 w-4" />
                    Personality (OCEAN)
                  </TabsTrigger>
                  <TabsTrigger value="interest" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                    <Compass className="h-4 w-4" />
                    Interests (RIASEC)
                  </TabsTrigger>
                  <TabsTrigger value="cognitive" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                    <Zap className="h-4 w-4" />
                    Cognitive Indicators
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                    <Wrench className="h-4 w-4" />
                    Skill Mapping
                  </TabsTrigger>
                  <TabsTrigger value="cvq" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                    <Globe className="h-4 w-4" />
                    Contextual (CVQ)
                  </TabsTrigger>
                </TabsList>

                {/* ----------------- SECTION 1: PERSONALITY (OCEAN) ----------------- */}
                <TabsContent value="personality" className="space-y-6">
                  <Card className="border-border shadow-sm">
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
                                      className="w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs text-white shadow-sm"
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
                                    className="font-bold text-xs px-2.5 py-1 rounded-full text-white shadow-sm"
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
                  <Card className="border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
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
                            className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm"
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
                                        <h4 className="font-bold text-sm" style={{ color: meta.color }}>{meta.label}</h4>
                                        <span className="text-xs font-mono font-bold" style={{ color: meta.color }}>({meta.letter})</span>
                                      </div>
                                      <span className="text-[11px] font-semibold" style={{ color: meta.color }}>
                                        The {meta.tag}
                                      </span>
                                    </div>
                                  </div>
                                  <span
                                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
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
                  <Card className="border-border shadow-sm">
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
                  <Card className="border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section C.1 — Core Skill Mapping
                          </CardTitle>
                          <CardDescription>
                            Self-reported and verified skill proficiency across vital 21st-century competence clusters.
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
                          This older assessment does not include the complete skill breakdown. Retake the assessment to view the current scored results.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ----------------- SECTION 5: CONTEXTUAL VIABILITY (CVQ) ----------------- */}
                <TabsContent value="cvq" className="space-y-6">
                  <Card className="border-border shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold font-headline">
                            Section D — Contextual Viability Questionnaire (CVQ)
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
                          This older assessment does not include the complete CVQ breakdown. Retake the assessment to view the current scored results.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* ============================================================= */}
              {/* PATHXPLORE CAREER INTELLIGENCE SECTION                        */}
              {/* ============================================================= */}
              <div className="space-y-6">
                {/* Career Intelligence Hero Card */}
                <div
                  className="relative overflow-hidden rounded-2xl p-6 md:p-8 shadow-xl text-white"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #2E7CE0 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
                  <div className="relative z-[1] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full text-xs font-bold tracking-wide shadow-sm"
                          style={{ backgroundColor: '#E9C46A', color: '#241A3D' }}
                        >
                          <Map className="h-3.5 w-3.5" />
                          PathXplore™ Module · Step 2
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#F0E6FF' }}>
                          PATHXPLORE CAREERS
                        </p>
                        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-headline">
                          Your Career Map
                        </h2>
                      </div>
                      <p className="text-sm md:text-base leading-relaxed max-w-xl" style={{ color: '#E4DCFB' }}>
                        <strong className="text-white font-bold">Your personality just became a plan.</strong> We turned your InsightX profile, career SWOT, and real job-market trends into your best-fit career directions.
                      </p>
                      <div className="hidden sm:flex flex-wrap gap-2 pt-1">
                        {['InsightX Profile', 'Career SWOT', 'Domain Mapping', 'Top 5 Choices'].map((step, i) => (
                          <span
                            key={step}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white rounded-full px-3 py-1 backdrop-blur-sm"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
                          >
                            <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 min-w-[200px]">
                      {!pathXploreData ? (
                        <Button
                          size="lg"
                          onClick={handleGenerateCareerMap}
                          disabled={isGeneratingCareerMap}
                          className="bg-white hover:bg-slate-50 font-bold shadow-lg text-sm md:text-base"
                          style={{ color: '#241A3D' }}
                        >
                          {isGeneratingCareerMap ? (
                            <>
                              <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Generate Career Map
                            </>
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleGenerateCareerMap}
                            disabled={isGeneratingCareerMap}
                            className="bg-white/20 text-white border-white/30 hover:bg-white/30 font-semibold"
                          >
                            {isGeneratingCareerMap ? (
                              <>
                                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                Regenerate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleDownloadPathXplorePdf}
                            disabled={isDownloadingPdf}
                            className="bg-white hover:bg-slate-50 font-semibold shadow-sm"
                            style={{ color: '#241A3D' }}
                          >
                            {isDownloadingPdf ? (
                              <>
                                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-3.5 w-3.5" />
                                Download PDF
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Career Intelligence Content */}
                {isGeneratingCareerMap && !pathXploreData && (
                  <Card className="border-dashed border-2 border-primary/30">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Brain className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-lg font-bold font-headline">AI is analyzing your profile...</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          We're combining your personality traits, interest patterns, cognitive strengths, and skills to map your ideal career directions. This takes about 15–30 seconds.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {pathXploreData && (
                  <Tabs defaultValue="swot" className="w-full space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-card border border-border shadow-sm rounded-xl gap-1">
                      <TabsTrigger value="swot" className="py-2.5 data-[state=active]:bg-[#241A3D] data-[state=active]:text-white font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                        <Target className="h-4 w-4" />
                        Career SWOT
                      </TabsTrigger>
                      <TabsTrigger value="domains" className="py-2.5 data-[state=active]:bg-[#241A3D] data-[state=active]:text-white font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                        <Map className="h-4 w-4" />
                        Domain Mapping
                      </TabsTrigger>
                      <TabsTrigger value="clusters" className="py-2.5 data-[state=active]:bg-[#241A3D] data-[state=active]:text-white font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                        <Layers className="h-4 w-4" />
                        Career Clusters
                      </TabsTrigger>
                      <TabsTrigger value="picks" className="py-2.5 data-[state=active]:bg-[#241A3D] data-[state=active]:text-white font-medium rounded-lg transition-all gap-1.5 text-xs sm:text-sm">
                        <Star className="h-4 w-4" />
                        Top 5 Picks
                      </TabsTrigger>
                    </TabsList>

                    {/* ---- SWOT Tab ---- */}
                    <TabsContent value="swot" className="space-y-6">
                      <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                              style={{ backgroundColor: '#241A3D' }}
                            >
                              A
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold font-headline text-[#1F2937] dark:text-white">
                                Section A — Your Career SWOT
                              </CardTitle>
                              <CardDescription>
                                <strong className="text-foreground">What's working for you — and what to watch.</strong> Inside strengths, growth areas, plus outside opportunities and risks.
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            {(Object.keys(SWOT_CONFIG) as Array<keyof typeof SWOT_CONFIG>).map((key) => {
                              const config = SWOT_CONFIG[key];
                              const items = pathXploreData.swot[key] || [];
                              const Icon = config.icon;

                              return (
                                <div
                                  key={key}
                                  className="rounded-xl border p-5 space-y-4 shadow-sm"
                                  style={{
                                    backgroundColor: config.bg,
                                    borderColor: config.border,
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                                      style={{ backgroundColor: config.accent }}
                                    >
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-base" style={{ color: config.accent }}>{config.title}</h4>
                                      <p className="text-[10px] font-bold tracking-widest uppercase opacity-85" style={{ color: config.accent }}>{config.subtitle}</p>
                                    </div>
                                  </div>
                                  <ul className="space-y-2.5">
                                    {items.map((item, i) => {
                                      // Parse **bold** markdown
                                      const parts = item.split(/\*\*(.*?)\*\*/);
                                      return (
                                        <li key={i} className="flex items-start gap-2 text-sm text-[#1F2937] leading-relaxed">
                                          <span
                                            className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: config.dotColor }}
                                          />
                                          <span>
                                            {parts.map((part, j) =>
                                              j % 2 === 1 ? <strong key={j} className="font-bold text-[#111827]">{part}</strong> : part
                                            )}
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* ---- Domain Mapping Tab ---- */}
                    <TabsContent value="domains" className="space-y-6">
                      <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                              style={{ backgroundColor: '#241A3D' }}
                            >
                              B
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold font-headline text-[#1F2937] dark:text-white">
                                Section B — How We Mapped Your Domains
                              </CardTitle>
                              <CardDescription>
                                <strong className="text-foreground">Three ingredients, one shortlist.</strong> We mixed your profile, your SWOT, and real job-market trends.
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                            {/* Input sources */}
                            <div className="flex flex-wrap gap-2.5">
                              <Badge
                                variant="outline"
                                className="py-1.5 px-3.5 font-bold shadow-sm"
                                style={{ backgroundColor: '#EDE4FF', color: '#7C3AED', borderColor: '#DDD6FE' }}
                              >
                                Your InsightX Profile
                              </Badge>
                              <Badge
                                variant="outline"
                                className="py-1.5 px-3.5 font-bold shadow-sm"
                                style={{ backgroundColor: '#DCFCE7', color: '#16A34A', borderColor: '#BBF7D0' }}
                              >
                                Your Career SWOT
                              </Badge>
                              <Badge
                                variant="outline"
                                className="py-1.5 px-3.5 font-bold shadow-sm"
                                style={{ backgroundColor: '#DBEAFE', color: '#2563EB', borderColor: '#BFDBFE' }}
                              >
                                Job-market Trends
                              </Badge>
                            </div>

                            {/* Arrow */}
                            <div className="flex justify-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(76, 95, 214, 0.12)', color: '#4C5FD6' }}
                              >
                                <ArrowRight className="h-4 w-4 rotate-90" />
                              </div>
                            </div>

                            {/* Domain pills */}
                            <div className="flex flex-wrap gap-3">
                              {pathXploreData.domains.map((domain, i) => (
                                <div
                                  key={i}
                                  className="inline-flex items-center gap-2 text-white rounded-xl py-2.5 px-4 font-semibold text-sm shadow-sm transition-transform hover:scale-105"
                                  style={{ backgroundColor: '#241A3D' }}
                                >
                                  <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
                                    {i + 1}
                                  </span>
                                  {domain}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* ---- Career Clusters Tab ---- */}
                    <TabsContent value="clusters" className="space-y-6">
                      <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                              style={{ backgroundColor: '#241A3D' }}
                            >
                              C
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold font-headline text-[#1F2937] dark:text-white">
                                Section C — Your Top 5 Career Clusters
                              </CardTitle>
                              <CardDescription>
                                <strong className="text-foreground">Ranked by fit, alignment, and future potential.</strong> Higher bar = stronger match with you.
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {pathXploreData.clusters.map((cluster, i) => {
                            const colors = CLUSTER_COLORS[i] || CLUSTER_COLORS[0];
                            const filledSegments = Math.round(cluster.overall_pct / 10);

                            return (
                              <div
                                key={i}
                                className="rounded-xl border p-5 space-y-4 shadow-sm"
                                style={{
                                  backgroundColor: colors.bg,
                                  borderColor: colors.border,
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm"
                                      style={{ backgroundColor: colors.accent }}
                                    >
                                      <Award className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-base text-[#1F2937]">{cluster.name}</h4>
                                      </div>
                                      <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: colors.accent }}>
                                        RANK {i + 1} · {cluster.alignment?.toUpperCase()}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className="text-xs sm:text-sm font-bold px-3 py-1 rounded-full text-white shadow-sm"
                                    style={{ backgroundColor: colors.accent }}
                                  >
                                    {cluster.overall_pct}%
                                  </span>
                                </div>

                                {/* 10-segment fit bar */}
                                <div className="flex gap-1.5">
                                  {Array.from({ length: 10 }).map((_, s) => (
                                    <div
                                      key={s}
                                      className="h-2.5 flex-1 rounded-full transition-all"
                                      style={{
                                        backgroundColor: s < filledSegments ? colors.bar : '#FFFFFF',
                                        boxShadow: s < filledSegments ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                                      }}
                                    />
                                  ))}
                                </div>

                                {/* Sub-career paths */}
                                <div className="space-y-2.5 pt-1">
                                  {cluster.subitems.map((sub, j) => (
                                    <div key={j} className="flex items-center justify-between gap-3">
                                      <span className="text-sm font-medium text-[#1F2937] truncate">{sub.name}</span>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <div className="w-28 sm:w-36 h-2.5 rounded-full bg-white shadow-inner overflow-hidden">
                                          <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                              width: `${Math.max(sub.pct, 5)}%`,
                                              backgroundColor: colors.bar,
                                            }}
                                          />
                                        </div>
                                        <span className="text-xs font-bold w-9 text-right" style={{ color: colors.accent }}>
                                          {sub.pct}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* ---- Top 5 Picks Tab ---- */}
                    <TabsContent value="picks" className="space-y-6">
                      <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm"
                              style={{ backgroundColor: '#241A3D' }}
                            >
                              D
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold font-headline text-[#1F2937] dark:text-white">
                                Section D — Your Top 5 Career Choices
                              </CardTitle>
                              <CardDescription>
                                <strong className="text-foreground">High-fit paths — not fixed destinies.</strong> Your top 3 are worth exploring first. These can evolve as you grow.
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {pathXploreData.top_choices.map((choice, i) => {
                            const isTopPick = i < 3;
                            const pickLabels = ['1st pick', '2nd pick', '3rd pick'];

                            return (
                              <div
                                key={i}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  isTopPick ? 'shadow-sm' : ''
                                }`}
                                style={{
                                  backgroundColor: isTopPick ? '#EAF1FE' : undefined,
                                  borderColor: isTopPick ? '#2563EB' : '#E5E7EB',
                                  borderWidth: isTopPick ? '1.5px' : '1px',
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                                    style={{
                                      backgroundColor: isTopPick ? '#2563EB' : '#E7DFC7',
                                      color: isTopPick ? '#FFFFFF' : '#6B5A2E',
                                    }}
                                  >
                                    {i + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-[#1F2937] dark:text-white">{choice.title}</h4>
                                    <p className="text-xs text-[#6B7280]">{choice.cluster}</p>
                                  </div>
                                </div>
                                {isTopPick && (
                                  <span
                                    className="text-xs font-bold px-3 py-1 rounded-full text-white inline-flex items-center gap-1 shadow-sm"
                                    style={{ backgroundColor: '#2563EB' }}
                                  >
                                    {i === 0 && <Star className="h-3 w-3 fill-current" />}
                                    {pickLabels[i]}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </CardContent>
                        <CardFooter className="pt-2">
                          <div
                            className="w-full rounded-2xl p-6 text-white shadow-lg space-y-3"
                            style={{
                              background: 'linear-gradient(135deg, #2E7CE0 0%, #4FA8E0 100%)',
                            }}
                          >
                            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#D9E8FF' }}>
                              NEXT · STEP 3 OF YOUR CAREER MASTERY MATRIX
                            </p>
                            <h4 className="font-extrabold text-xl">From choices to game plan</h4>
                            <p className="text-sm leading-relaxed max-w-xl" style={{ color: '#E0E7FF' }}>
                              Your top 3 picks now become concrete goals — subjects to take, skills to build, and milestones to hit.
                            </p>
                            <div className="pt-1">
                              <Button asChild size="sm" className="bg-white hover:bg-blue-50 font-bold shadow-md" style={{ color: '#2E7CE0' }}>
                                <Link href="/goals">
                                  Proceed to GoalMint™ <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </>
          ) : (
            <Card className="text-center p-12 border border-border/80 max-w-xl mx-auto rounded-2xl shadow-sm bg-card">
              <CardHeader className="space-y-3">
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-2" style={{ backgroundColor: '#241A3D' }}>
                  <Brain className="h-7 w-7" style={{ color: '#E9C46A' }} />
                </div>
                <CardTitle className="font-headline text-2xl font-bold text-foreground">
                  {hasAssessmentData ? 'Scoring Analysis Not Available' : 'No Assessment Data Found'}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                  {hasAssessmentData
                    ? 'You have completed an assessment, but scoring metrics were not calculated. Please retake the assessment to calculate your psychometric profile.'
                    : 'Complete the InsightX Assessment to discover your personality traits, vocational interests, cognitive indicators, and PICC™ composite score.'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center pt-4">
                <Button asChild size="lg" className="font-bold shadow-md hover:opacity-90 transition-opacity" style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}>
                  <Link href="/assessment">
                    {hasAssessmentData ? 'Retake Assessment' : 'Take InsightX™ Assessment Now'} <ArrowRight className="ml-2 h-4 w-4" />
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
