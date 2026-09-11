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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { InsightXReportData, PathXploreData } from '@/lib/types';
import {
  ArrowRight,
  Brain,
  Zap,
  Download,
  Sparkles,
  Layers,
  Award,
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
import { getLatestAssessmentResult, generatePathXploreReport } from '@/lib/actions';
import { getUserRecord } from '@/lib/local-app-state';

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
  const [generalInfo, setGeneralInfo] = React.useState<any>(null);
  const [hasAssessmentData, setHasAssessmentData] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="PathXplore™ Career Intelligence" />
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-8">
          {hasAssessmentData && insightXData ? (
            <>
              {/* Compact Diagnostic Baseline Summary */}
              <div className="rounded-2xl bg-card border border-border/80 p-5 md:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground">
                        {generalInfo?.name ? `${generalInfo.name}'s Diagnostic Profile` : 'Diagnostic Profile'}
                      </span>
                      {generalInfo?.classOfStudy && (
                        <Badge variant="secondary" className="text-xs py-0.5 px-2 font-semibold">
                          Class {generalInfo.classOfStudy}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>PICC Score: <strong className="text-foreground">{picScore}/100</strong> ({picCategory.label})</span>
                      <span>•</span>
                      <span>Holland Code: <strong className="text-primary font-mono font-bold">{riasecCode || 'IRC'}</strong></span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="font-semibold text-xs rounded-xl">
                  <Link href="/reports" className="inline-flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    View Full Psychometric Report <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </Button>
              </div>

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
