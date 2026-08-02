
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Info, FileText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getUserData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type CareerReportData = {
    executiveSummary: string;
    careerRecommendations: Array<{
        careerName: string;
        fitScore: number;
        rationale: string;
        keyStrengths: string[];
        developmentAreas: string[];
    }>;
    detailedSWOT: {
        overallStrengths: string[];
        overallWeaknesses: string[];
        marketOpportunities: string[];
        potentialThreats: string[];
    };
    roadmap: string;
    nextSteps: string[];
    generatedAt?: any;
    status?: string;
};

export default function ReportsPage() {
    const [careerReport, setCareerReport] = React.useState<CareerReportData | null>(null);
    const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['summary']));
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        async function loadData() {
            if (authLoading) return;

            setIsLoading(true);
            try {
                if (!user) {
                    setCareerReport(null);
                    setIsLoading(false);
                    return;
                }

                const userRes = await getUserData(user.uid);

                if (userRes.success && userRes.data?.careerReport) {
                    setCareerReport(userRes.data.careerReport);
                } else {
                    setCareerReport(null);
                }

            } catch (e) {
                toast({
                    variant: 'destructive',
                    title: 'Could not load data',
                    description: 'There was a problem loading your report.',
                });
                setCareerReport(null);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [user, authLoading, toast]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <AppHeader title="My Reports" />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="space-y-1 mb-8">
                        <h2 className="text-3xl font-bold font-headline tracking-tight">Your Career Analysis Report</h2>
                        <p className="text-muted-foreground">Comprehensive career guidance based on your assessment</p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-32 mt-1" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !user ? (
                        <Card className="border-dashed">
                            <CardHeader className="text-center items-center">
                                <Info className="h-8 w-8 text-muted-foreground" />
                                <CardTitle>Please Log In</CardTitle>
                                <CardDescription>Log in to view your career report.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : !careerReport ? (
                        <Card className="border-dashed">
                            <CardHeader className="text-center items-center">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <CardTitle>No Report Generated Yet</CardTitle>
                                <CardDescription>
                                    Complete your assessment and click "Generate Report" on the PathXplore page to create your career analysis.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {/* Report Header */}
                            {careerReport.generatedAt && (
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            <CardTitle className="font-headline">Career Analysis Report</CardTitle>
                                        </div>
                                        <CardDescription>
                                            Generated on {format(new Date(careerReport.generatedAt.seconds * 1000 || Date.now()), "PPP 'at' p")}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )}

                            {/* Executive Summary */}
                            <Card>
                                <CardHeader className="cursor-pointer" onClick={() => toggleSection('summary')}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-headline">Executive Summary</CardTitle>
                                        {expandedSections.has('summary') ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </CardHeader>
                                {expandedSections.has('summary') && (
                                    <CardContent>
                                        <div className="text-muted-foreground whitespace-pre-wrap">
                                            {typeof careerReport.executiveSummary === 'string'
                                                ? careerReport.executiveSummary
                                                : JSON.stringify(careerReport.executiveSummary, null, 2)}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Career Recommendations */}
                            <Card>
                                <CardHeader className="cursor-pointer" onClick={() => toggleSection('recommendations')}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-headline">Career Recommendations</CardTitle>
                                        {expandedSections.has('recommendations') ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </CardHeader>
                                {expandedSections.has('recommendations') && (
                                    <CardContent className="space-y-4">
                                        {(careerReport.careerRecommendations || []).map((rec, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-lg">{rec.careerName}</h3>
                                                    <Badge variant="secondary">{rec.fitScore}% Match</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-sm mb-1 text-green-600">Key Strengths</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {(rec.keyStrengths || []).map((s, i) => <li key={i}>• {s}</li>)}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm mb-1 text-orange-600">Development Areas</h4>
                                                        <ul className="text-sm space-y-1">
                                                            {(rec.developmentAreas || []).map((a, i) => <li key={i}>• {a}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                )}
                            </Card>

                            {/* SWOT Analysis */}
                            <Card>
                                <CardHeader className="cursor-pointer" onClick={() => toggleSection('swot')}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-headline">Overall SWOT Analysis</CardTitle>
                                        {expandedSections.has('swot') ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </CardHeader>
                                {expandedSections.has('swot') && (
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-semibold text-green-600 mb-2">✓ Strengths</h3>
                                                <ul className="text-sm space-y-1">
                                                    {(careerReport.detailedSWOT?.overallStrengths || []).map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-orange-600 mb-2">⚠ Weaknesses</h3>
                                                <ul className="text-sm space-y-1">
                                                    {(careerReport.detailedSWOT?.overallWeaknesses || []).map((w, i) => <li key={i}>• {w}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-600 mb-2">↗ Opportunities</h3>
                                                <ul className="text-sm space-y-1">
                                                    {(careerReport.detailedSWOT?.marketOpportunities || []).map((o, i) => <li key={i}>• {o}</li>)}
                                                </ul>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-red-600 mb-2">⚡ Threats</h3>
                                                <ul className="text-sm space-y-1">
                                                    {(careerReport.detailedSWOT?.potentialThreats || []).map((t, i) => <li key={i}>• {t}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Roadmap */}
                            <Card>
                                <CardHeader className="cursor-pointer" onClick={() => toggleSection('roadmap')}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-headline">Career Development Roadmap</CardTitle>
                                        {expandedSections.has('roadmap') ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </CardHeader>
                                {expandedSections.has('roadmap') && (
                                    <CardContent>
                                        <div className="text-muted-foreground whitespace-pre-wrap">
                                            {typeof careerReport.roadmap === 'string' ? (
                                                careerReport.roadmap
                                            ) : (
                                                <div className="space-y-4">
                                                    {Object.entries(careerReport.roadmap || {}).map(([key, value]) => (
                                                        <div key={key}>
                                                            <h4 className="font-semibold capitalize text-primary mb-1">
                                                                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                                                            </h4>
                                                            <div className="pl-2 border-l-2 border-primary/20">
                                                                {typeof value === 'string' ? value : JSON.stringify(value)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Next Steps */}
                            <Card>
                                <CardHeader className="cursor-pointer" onClick={() => toggleSection('nextSteps')}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="font-headline">Next Steps & Action Items</CardTitle>
                                        {expandedSections.has('nextSteps') ? <ChevronUp /> : <ChevronDown />}
                                    </div>
                                </CardHeader>
                                {expandedSections.has('nextSteps') && (
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {Array.isArray(careerReport.nextSteps) ? (
                                                careerReport.nextSteps.map((step, idx) => (
                                                    <li key={idx} className="flex gap-3">
                                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="pt-0.5">
                                                            {typeof step === 'string' ? step : JSON.stringify(step)}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : typeof careerReport.nextSteps === 'object' && careerReport.nextSteps !== null ? (
                                                Object.entries(careerReport.nextSteps).map(([key, value], idx) => (
                                                    <li key={key} className="flex gap-3">
                                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="pt-0.5">
                                                            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</strong> {String(value)}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-muted-foreground italic text-sm">No next steps available.</li>
                                            )}
                                        </ul>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
