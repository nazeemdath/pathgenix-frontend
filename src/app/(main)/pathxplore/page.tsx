
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
import type { CareerSuggestion } from '@/lib/types';
import { ArrowRight, FileText, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useAuth } from '@/contexts/auth-context';
import { getUserData, generateAndSaveCareerReport } from '@/lib/actions';


function CareerCard({
  career,
  isTopPick,
}: {
  career: CareerSuggestion;
  isTopPick?: boolean;
}) {
  // Extract career data - now populated from 5_domains
  const name = career.careerName || 'Career Domain';
  const description = career.careerDescription || '';
  const matchReason = career.matchExplanation || '';
  const swot = career.swotAnalysis || '';

  const formatSwot = (text: string) => {
    if (!text) return '';
    // If swot is an object, convert to string
    if (typeof text === 'object') {
      const swotObj = text as any;
      let html = '';
      if (swotObj.strengths) {
        const items = Array.isArray(swotObj.strengths) ? swotObj.strengths : [swotObj.strengths];
        html += `<strong class="text-sm font-semibold text-card-foreground/90">Strengths:</strong><ul class="list-disc pl-5 mt-1 mb-3 text-muted-foreground">${items.map((s: string) => `<li>${s}</li>`).join('')}</ul>`;
      }
      if (swotObj.weaknesses) {
        const items = Array.isArray(swotObj.weaknesses) ? swotObj.weaknesses : [swotObj.weaknesses];
        html += `<strong class="text-sm font-semibold text-card-foreground/90">Weaknesses:</strong><ul class="list-disc pl-5 mt-1 mb-3 text-muted-foreground">${items.map((s: string) => `<li>${s}</li>`).join('')}</ul>`;
      }
      if (swotObj.opportunities) {
        const items = Array.isArray(swotObj.opportunities) ? swotObj.opportunities : [swotObj.opportunities];
        html += `<strong class="text-sm font-semibold text-card-foreground/90">Opportunities:</strong><ul class="list-disc pl-5 mt-1 mb-3 text-muted-foreground">${items.map((s: string) => `<li>${s}</li>`).join('')}</ul>`;
      }
      if (swotObj.threats) {
        const items = Array.isArray(swotObj.threats) ? swotObj.threats : [swotObj.threats];
        html += `<strong class="text-sm font-semibold text-card-foreground/90">Threats:</strong><ul class="list-disc pl-5 mt-1 mb-3 text-muted-foreground">${items.map((s: string) => `<li>${s}</li>`).join('')}</ul>`;
      }
      return html;
    }

    const sections = {
      'Strengths': '',
      'Weaknesses': '',
      'Opportunities': '',
      'Threats': ''
    };

    const cleanedText = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    const lines = cleanedText.split('\n').filter(line => line.trim() !== '');

    let currentSection: keyof typeof sections | null = null;

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      if (lineLower.startsWith('strengths:')) currentSection = 'Strengths';
      else if (lineLower.startsWith('weaknesses:')) currentSection = 'Weaknesses';
      else if (lineLower.startsWith('opportunities:')) currentSection = 'Opportunities';
      else if (lineLower.startsWith('threats:')) currentSection = 'Threats';
      else if (currentSection) {
        const item = line.replace(/^[-*]\s*/, '').trim();
        if (item) {
          sections[currentSection] += `<li>${item}</li>`;
        }
      }
    }

    let html = '';
    for (const [key, value] of Object.entries(sections)) {
      if (value) {
        html += `<strong class="text-sm font-semibold text-card-foreground/90">${key}:</strong><ul class="list-disc pl-5 mt-1 mb-3 text-muted-foreground">${value}</ul>`;
      }
    }
    return html;
  };

  return (
    <Card
      className='flex flex-col relative'
    >
      {isTopPick && (
        <Badge
          variant="default"
          className="w-fit gap-1 self-start -mt-3 ml-4 absolute top-0 left-0 z-10"
        >
          <Star className="h-3 w-3" />
          Top Pick for You
        </Badge>
      )}
      <CardHeader className="pt-8">
        <CardTitle className="font-headline">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-sm">Why it's a match:</h4>
          <p className="text-sm text-muted-foreground">{matchReason}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm mt-4">SWOT Analysis:</h4>
          <div className="text-sm space-y-1" dangerouslySetInnerHTML={{ __html: formatSwot(swot) }}></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild>
          <Link href="/goals">
            Select Path &amp; Plan Goals
            <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}


export default function PathXplorePage() {
  const router = useRouter();
  const [results, setResults] = React.useState<CareerSuggestion[] | null>(null);
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

        // Check if assessment data exists
        if (res.success && res.data?.assessment) {
          setHasAssessmentData(true);
        }

        // Prioritize rich generated suggestions when available.
        if (res.success && res.data?.careerSuggestions && Array.isArray(res.data.careerSuggestions) && res.data.careerSuggestions.length > 0) {
          setResults(res.data.careerSuggestions);
        }
        else if (res.success && res.data?.careerDomains && Array.isArray(res.data.careerDomains) && res.data.careerDomains.length > 0) {
          const domainSuggestions: CareerSuggestion[] = res.data.careerDomains.map((domain: any) => ({
            careerName: domain.domainName || 'Career Domain',
            careerDescription: domain.description || `Fit score: ${domain.score || 'N/A'}`,
            matchExplanation: `This domain scored ${domain.score || 'N/A'}/100 based on your assessment results.`,
            swotAnalysis: domain.swotAnalysis || (domain.careerPaths ? `**Career Paths:**\n${domain.careerPaths.map((p: string) => `- ${p}`).join('\n')}` : ''),
          }));
          setResults(domainSuggestions);
        } else {
          setResults([]);
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Could not load results',
          description: 'There was a problem loading your assessment results.',
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
        description: 'Please log in to generate a report.',
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      toast({
        title: 'Generating Report...',
        description: 'We are creating your comprehensive career report. This may take a moment.',
      });

      const result = await generateAndSaveCareerReport(user.uid);

      if (result.success) {
        toast({
          title: 'Report Generated!',
          description: 'Redirecting to My Reports page...',
        });

        // Navigate to reports page
        router.push('/reports');
      } else {
        toast({
          variant: 'destructive',
          title: 'Generation Failed',
          description: result.error || 'Could not generate report. Please try again.',
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
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader title="PathXplore Career" />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="h-10 w-10" />
            <p className="text-muted-foreground">Loading your personalized career paths...</p>
          </div>
        </main>
      </div>
    )
  }

  const hasTakenAssessment = results && results.length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="PathXplore Career" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            {hasTakenAssessment ? (
              <>
                <h2 className="text-3xl font-bold font-headline tracking-tight">
                  Explore Your Top Career Paths
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Based on your InsightX Assessment, we've identified these careers
                  as a strong fit for your unique profile. Dive in to learn more
                  about each path.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold font-headline tracking-tight">
                  Discover Your Career Matches
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Complete the InsightX assessment, and we will find strong career matches that truly fit you.
                </p>
              </>
            )}
          </div>

          {hasTakenAssessment ? (
            <div className="space-y-12">
              {/* Selected Career Domains */}
              {results && results.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Selected Career Domains</CardTitle>
                    <CardDescription>Based on your assessment, these are your top career domain matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results.slice(0, 3).map((career, index) => (
                        <Badge key={`selected-domain-${index}-${career.careerName}`} variant="secondary" className="text-sm py-1 px-3">
                          {career.careerName}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top 5 Aligned Career Domains - Ranked */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Top 5 Aligned Career Domains</CardTitle>
                  <CardDescription>Ranked from most suitable to potential fit based on your InsightX Assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.slice(0, 5).map((career, index) => (
                      <div
                        key={`career-${index}-${career.careerName}`}
                        className={`p-4 rounded-lg border-2 transition-all ${index === 0 ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? 'bg-primary text-primary-foreground' :
                            index === 1 ? 'bg-blue-500 text-white' :
                              index === 2 ? 'bg-green-500 text-white' :
                                index === 3 ? 'bg-yellow-500 text-white' :
                                  'bg-gray-500 text-white'
                            }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{career.careerName}</h3>
                              {index === 0 && (
                                <Badge variant="default" className="gap-1">
                                  <Star className="h-3 w-3" />
                                  Top Match
                                </Badge>
                              )}
                            </div>
                            {career.careerDescription && (
                              <p className="text-sm text-muted-foreground mb-3">{career.careerDescription}</p>
                            )}
                            {career.matchExplanation && (
                              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                                <h4 className="font-semibold text-sm mb-1">Why this is a good match:</h4>
                                <p className="text-sm text-muted-foreground">{career.matchExplanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="font-headline">PathXplore Report & Next Steps</CardTitle>
                    <CardDescription>Your complete career analysis is ready. Proceed to goal planning.</CardDescription>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="secondary" onClick={handleGenerateReport} disabled={isGeneratingReport}>
                      {isGeneratingReport ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                    <Button asChild>
                      <Link href="/goals">
                        Proceed to GoalMint Planner™ <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* SWOT Analysis for Top Career */}
              {results && results.length > 0 && results[0].swotAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">SWOT Analysis</CardTitle>
                    <CardDescription>Strengths, Weaknesses, Opportunities, and Threats for your top career match</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Parse and display SWOT text */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-green-600 mb-2 flex items-center gap-2">
                              <span className="text-2xl">✓</span> Strengths
                            </h3>
                            <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                              __html: results[0].swotAnalysis.split('**Weaknesses:**')[0].replace('**Strengths:**', '').trim()
                                .split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')).filter(l => l).map(l => `<div class="flex gap-2 mb-2"><span>•</span><span>${l}</span></div>`).join('')
                            }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-600 mb-2 flex items-center gap-2">
                              <span className="text-2xl">↗</span> Opportunities
                            </h3>
                            <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                              __html: (results[0].swotAnalysis.split('**Opportunities:**')[1]?.split('**Threats:**')[0] || '').trim()
                                .split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')).filter(l => l).map(l => `<div class="flex gap-2 mb-2"><span>•</span><span>${l}</span></div>`).join('')
                            }} />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-orange-600 mb-2 flex items-center gap-2">
                              <span className="text-2xl">⚠</span> Weaknesses
                            </h3>
                            <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                              __html: (results[0].swotAnalysis.split('**Weaknesses:**')[1]?.split('**Opportunities:**')[0] || '').trim()
                                .split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')).filter(l => l).map(l => `<div class="flex gap-2 mb-2"><span>•</span><span>${l}</span></div>`).join('')
                            }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">
                              <span className="text-2xl">⚡</span> Threats
                            </h3>
                            <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{
                              __html: (results[0].swotAnalysis.split('**Threats:**')[1] || '').trim()
                                .split('\n').filter(l => l.trim()).map(l => l.replace(/^[-*]\s*/, '')).filter(l => l).map(l => `<div class="flex gap-2 mb-2"><span>•</span><span>${l}</span></div>`).join('')
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}



            </div>
          ) : (
            <Card className="text-center p-12 border-dashed">
              <CardTitle className="font-headline mb-2">
                {hasAssessmentData ? 'Career Analysis Not Available' : 'No Assessment Data Found'}
              </CardTitle>
              <CardDescription className="mb-6 max-w-md mx-auto">
                {hasAssessmentData
                  ? 'You have completed an assessment, but career suggestions were not generated. This may be due to an older version of the assessment. Please retake the assessment to get your personalized career matches.'
                  : 'Please complete the InsightX Assessment to discover your personalized career paths and unlock your potential.'}
              </CardDescription>
              <Button asChild size="lg">
                <Link href="/assessment">{hasAssessmentData ? 'Retake Assessment' : 'Take Assessment Now'}</Link>
              </Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
