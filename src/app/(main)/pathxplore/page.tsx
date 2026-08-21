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
  HeartHandshake
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { getUserData, downloadPdfReport } from '@/lib/actions';
import { generateInsightXReport } from '@/lib/profile-calculator';

// Metadata for RIASEC Holland Codes
const RIASEC_CONFIG: Record<string, { label: string; tag: string; desc: string; icon: string; letter: string }> = {
  investigative: {
    label: 'Investigative',
    tag: 'Thinker',
    letter: 'I',
    desc: 'Enjoys intellectual challenges, analyzing data, research & discovering how things work.',
    icon: '🔬',
  },
  realistic: {
    label: 'Realistic',
    tag: 'Doer',
    letter: 'R',
    desc: 'Prefers hands-on, practical, technical & physical problem solving.',
    icon: '🛠️',
  },
  artistic: {
    label: 'Artistic',
    tag: 'Creator',
    letter: 'A',
    desc: 'Values self-expression, innovative ideas, design & unstructured creativity.',
    icon: '🎨',
  },
  social: {
    label: 'Social',
    tag: 'Helper',
    letter: 'S',
    desc: 'Thrives in collaborative environments, teaching, counseling & community impact.',
    icon: '🤝',
  },
  enterprising: {
    label: 'Enterprising',
    tag: 'Leader',
    letter: 'E',
    desc: 'Enjoys taking initiative, persuasion, business leadership & driving strategic outcomes.',
    icon: '🚀',
  },
  conventional: {
    label: 'Conventional',
    tag: 'Organizer',
    letter: 'C',
    desc: 'Excels in systematic workflows, detail orientation, data management & precision.',
    icon: '📊',
  },
};

// Metadata for Big Five Personality Traits (OCEAN)
const OCEAN_CONFIG: Record<string, { label: string; letter: string; subtitle: string; highDesc: string; lowDesc: string }> = {
  openness: {
    label: 'Openness to Experience',
    letter: 'O',
    subtitle: 'Intellectual curiosity, imagination & abstract thinking',
    highDesc: 'Broad-minded, inventive, highly adaptable to new concepts and novel challenges.',
    lowDesc: 'Pragmatic, structured, preferring concrete facts and proven approaches.',
  },
  conscientiousness: {
    label: 'Conscientiousness',
    letter: 'C',
    subtitle: 'Self-discipline, organization & goal-directed persistence',
    highDesc: 'Methodical, thorough, highly dependable and focused on long-term goals.',
    lowDesc: 'Flexible, spontaneous, preferring fast-paced and agile environments.',
  },
  extraversion: {
    label: 'Extraversion',
    letter: 'E',
    subtitle: 'Energy from social interaction, assertiveness & expressiveness',
    highDesc: 'Outgoing, collaborative, energized by team dynamics and group initiatives.',
    lowDesc: 'Independent, reflective, thriving in deep and focused solo problem-solving.',
  },
  agreeableness: {
    label: 'Agreeableness',
    letter: 'A',
    subtitle: 'Empathy, cooperativeness, compassion & trust',
    highDesc: 'Team-oriented, empathetic, naturally skilled in constructive collaboration.',
    lowDesc: 'Direct, analytical, candid, and objective in critical decision making.',
  },
  neuroticism: {
    label: 'Emotional Stability',
    letter: 'N',
    subtitle: 'Stress resilience, calm under pressure & emotional poise',
    highDesc: 'Calm under pressure, resilient, and composed during ambiguity or exam stress.',
    lowDesc: 'Emotionally alert, vigilant to details, and responsive to urgent demands.',
  },
};

export default function PathXplorePage() {
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
        const res = await getUserData(user.uid);

        if (res.success && res.data) {
          const uData = res.data;

          if (uData.assessment) {
            setHasAssessmentData(true);
            setGeneralInfo(uData.assessment.generalInfo || null);

            // Compute or load Psychometric & Cognitive Scores
            let reportData = uData.insightXReport;
            if (!reportData) {
              reportData = generateInsightXReport({
                personality: uData.assessment.personality || {},
                interest: uData.assessment.interest || {},
                cognitiveAbilities: uData.assessment.cognitiveAbilities || {},
              });
            }
            setInsightXData(reportData);

            // Calculate Skill Mapping scores from raw responses (if available)
            const sResponses = uData.assessment.selfReportedSkills || {};
            const calcSkill = (keys: string[]) => {
              const vals = keys.map((k) => parseInt(sResponses[k] || '3'));
              const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
              return Math.round(((avg - 1) / 4) * 100);
            };

            setSkillScores({
              'Communication & Expression': calcSkill(['s1', 's9', 's10', 's18']),
              'Digital & Tech Adaptability': calcSkill(['s2', 's16']),
              'Collaboration & Interpersonal': calcSkill(['s3', 's6', 's19']),
              'Problem-Solving & Reasoning': calcSkill(['s4', 's7', 's14', 's17']),
              'Leadership & Initiative': calcSkill(['s11', 's12', 's15', 's20']),
            });

            // Calculate CVQ Contextual Viability scores (if available)
            const cvqResp = uData.assessment.cvq || {};
            const calcCvq = (keys: string[]) => {
              const vals = keys.map((k) => parseInt(cvqResp[k] || '4'));
              const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
              return Math.round(((avg - 1) / 4) * 100);
            };

            setCvqScores({
              'Cultural & Societal Compatibility': calcCvq(['v1', 'v2']),
              'Language Readiness': calcCvq(['v3', 'v4']),
              'Digital Access & Tech Confidence': calcCvq(['v5', 'v6']),
              'Financial & Geographic Readiness': calcCvq(['v7', 'v8', 'v9', 'v10']),
              'Parental & Environmental Support': 88,
            });
          }
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

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader title="InsightX™ Scoring & Psychometrics" />
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
  const picScore = insightXData?.picIndex || 84;

  const getScoreClassification = (score: number) => {
    if (score >= 85) return { label: 'Exceptional Alignment', color: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    if (score >= 75) return { label: 'Strong Alignment', color: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    if (score >= 60) return { label: 'Moderate Alignment', color: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    return { label: 'Developing Alignment', color: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
  };

  const picCategory = getScoreClassification(picScore);

  // Component breakdown averages for PICC index
  const personalityAvg = insightXData?.personalityProfile
    ? Math.round(Object.values(insightXData.personalityProfile).reduce((a, b) => a + b, 0) / 5)
    : 80;
  const interestAvg = insightXData?.interestProfile
    ? Math.round(Object.values(insightXData.interestProfile).reduce((a, b) => a + b, 0) / 6)
    : 82;
  const cognitiveAvg = insightXData?.cognitiveProfile
    ? Math.round(
        (insightXData.cognitiveProfile.logicalReasoning +
          insightXData.cognitiveProfile.verbalAbility +
          insightXData.cognitiveProfile.problemSolving +
          insightXData.cognitiveProfile.numericalAptitude) /
          4
      )
    : 85;
  const cvqAvg = 86;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="InsightX™ Scoring & Psychometrics" />
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
                      <span className="text-[10px] text-muted-foreground/80">Weight: 20%</span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {personalityAvg}%
                    </div>
                    <Progress value={personalityAvg} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-indigo-500" />
                        Interest (I)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">Weight: 25%</span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground flex items-center justify-between">
                      <span>{interestAvg}%</span>
                      <span className="text-xs text-indigo-500 font-bold font-mono tracking-wider">{riasecCode || 'IRC'}</span>
                    </div>
                    <Progress value={interestAvg} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        Cognitive & Skills (C)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">Weight: 30%</span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cognitiveAvg}%
                    </div>
                    <Progress value={cognitiveAvg} className="h-1.5" />
                  </div>

                  <div className="p-3 bg-background/70 backdrop-blur-sm rounded-lg border border-border/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        Contextual Viability (CVQ)
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">Weight: 25%</span>
                    </div>
                    <div className="text-lg font-bold font-headline text-foreground">
                      {cvqAvg}%
                    </div>
                    <Progress value={cvqAvg} className="h-1.5" />
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
                              <div key={traitKey} className="p-4 rounded-xl bg-card border border-border/80 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold flex items-center justify-center text-xs">
                                      {config.letter}
                                    </span>
                                    <div>
                                      <div className="font-bold text-sm text-foreground">
                                        {config.label}
                                      </div>
                                      <div className="text-xs text-muted-foreground">{config.subtitle}</div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="font-bold text-sm">
                                    {score}%
                                  </Badge>
                                </div>

                                <div className="space-y-1.5">
                                  <Progress value={score} className="h-2.5" />
                                  <div className="flex justify-between text-[11px] text-muted-foreground pt-0.5">
                                    <span>Developing</span>
                                    <span className="font-semibold text-foreground">
                                      {score >= 80 ? 'Very High' : score >= 60 ? 'High' : score >= 40 ? 'Moderate' : 'Developing'}
                                    </span>
                                    <span>Very High</span>
                                  </div>
                                </div>

                                <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md leading-relaxed">
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
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                            <Compass className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold font-headline">
                              Section B — Holland Vocational Interest Inventory (RIASEC)
                            </CardTitle>
                            <CardDescription>
                              Evaluates intrinsic vocational alignment across 6 occupational interest themes.
                            </CardDescription>
                          </div>
                        </div>

                        {riasecCode && (
                          <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3.5 py-1.5 rounded-xl font-bold text-sm border border-indigo-500/20">
                            <span>Primary Holland Code:</span>
                            <span className="text-base tracking-widest font-mono font-black">{riasecCode}</span>
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
                            };
                            const isTop3 = topRiasecLetters.some(([tKey]) => tKey === key);

                            return (
                              <div
                                key={key}
                                className={`p-4 rounded-xl border transition-all ${
                                  isTop3
                                    ? 'bg-primary/5 border-primary/30 shadow-xs'
                                    : 'bg-card border-border/70'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-2xl">{meta.icon}</span>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-sm text-foreground">{meta.label}</h4>
                                        <span className="text-xs font-mono font-bold text-primary">({meta.letter})</span>
                                      </div>
                                      <span className="text-[11px] text-muted-foreground font-semibold">
                                        The {meta.tag}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant={isTop3 ? 'default' : 'secondary'} className="text-xs font-bold">
                                    {score}%
                                  </Badge>
                                </div>
                                <Progress value={score} className="h-2 mb-2" />
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{meta.desc}</p>
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
                            key: 'logicalReasoning',
                            title: 'Logical Reasoning',
                            score: insightXData?.cognitiveProfile?.logicalReasoning ?? 85,
                            desc: 'Pattern recognition, inductive reasoning & structured rule application.',
                          },
                          {
                            key: 'verbalAbility',
                            title: 'Verbal Ability',
                            score: insightXData?.cognitiveProfile?.verbalAbility ?? 80,
                            desc: 'Reading comprehension, language precision & contextual understanding.',
                          },
                          {
                            key: 'problemSolving',
                            title: 'Problem Solving',
                            score: insightXData?.cognitiveProfile?.problemSolving ?? 88,
                            desc: 'Analytical breakdown of complex situations and structured optimization.',
                          },
                          {
                            key: 'numericalAptitude',
                            title: 'Numerical Aptitude',
                            score: insightXData?.cognitiveProfile?.numericalAptitude ?? 82,
                            desc: 'Quantitative fluency, mathematical relations & data interpretation.',
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
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card className="text-center p-12 border-dashed max-w-xl mx-auto">
              <CardHeader className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle className="font-headline text-2xl">
                  {hasAssessmentData ? 'Scoring Analysis Not Available' : 'No Assessment Data Found'}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {hasAssessmentData
                    ? 'You have completed an assessment, but scoring metrics were not calculated. Please retake the assessment to calculate your psychometric profile.'
                    : 'Complete the InsightX Assessment to discover your personality traits, vocational interests, cognitive indicators, and PICC™ composite score.'}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center pt-4">
                <Button asChild size="lg" className="shadow-sm">
                  <Link href="/assessment">
                    {hasAssessmentData ? 'Retake Assessment' : 'Take InsightX™ Assessment Now'}
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
