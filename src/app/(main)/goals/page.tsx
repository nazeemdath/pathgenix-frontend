
'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CareerSuggestion, GoalPlan } from '@/lib/types';
import { PlusCircle, BookOpen, Wrench, Users, Bot, Star, Goal } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getGeneratedGoals, getUserData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const categoryIcons = {
  Academic: <BookOpen className="h-5 w-5 text-blue-500" />,
  Skill: <Wrench className="h-5 w-5 text-orange-500" />,
  Networking: <Users className="h-5 w-5 text-purple-500" />,
};

type GoalItemType = GoalPlan[string][0];

function GoalItem({ goal }: { goal: GoalItemType }) {
  return (
    <div className="flex items-start space-x-4 py-3">
      <Star className="h-4 w-4 mt-1 text-primary/70 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{goal.title}</p>
        <p className="text-sm text-muted-foreground">{goal.description}</p>
      </div>
    </div>
  );
}

function GoalCategory({ title, goals, icon }: { title: "Academic" | "Skill" | "Networking", goals: GoalItemType[], icon: React.ReactNode }) {
  if (!Array.isArray(goals)) {
    return null;
  }

  const filteredGoals = goals.filter(g => g.category === title);
  if (filteredGoals.length === 0) return null;

  return (
    <AccordionItem value={title.toLowerCase()}>
      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
        <div className="flex items-center gap-3">
          {icon}
          <span>{title} Goals</span>
          <Badge variant="secondary">{filteredGoals.length}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pl-4 border-l-2 ml-2">
          {filteredGoals.map((goal, index) => (
            <GoalItem key={index} goal={goal} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function GeneratePlanDialog({ onPlanGenerated, careerSuggestions, userId }: { onPlanGenerated: (plan: GoalPlan) => void, careerSuggestions: CareerSuggestion[] | null, userId: string | null }) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCareers, setSelectedCareers] = React.useState<string[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (careerSuggestions && careerSuggestions.length > 0) {
      setSelectedCareers([careerSuggestions[0].careerName]);
    }
  }, [careerSuggestions]);

  const handleCheckboxChange = (careerName: string, checked: boolean | 'indeterminate') => {
    if (checked && selectedCareers.length >= 3 && !selectedCareers.includes(careerName)) {
      toast({
        variant: 'destructive',
        title: 'Maximum 3 Careers',
        description: 'Please select up to 3 careers to generate a combined plan.',
      });
      return;
    }

    setSelectedCareers(prev => {
      if (checked) {
        return [...prev, careerName];
      } else {
        return prev.filter(c => c !== careerName);
      }
    });
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!userId || !careerSuggestions || careerSuggestions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User or assessment data is missing.',
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const tenYearVision = formData.get('10-year-vision') as string;

    let timeframes = ['1-year', '3-year', '5-year'];
    if (tenYearVision) timeframes.push('10-year');

    const topCareer = careerSuggestions[0];
    const studentProfile = `Top career match: ${topCareer.careerName}. Match explanation: ${topCareer.matchExplanation}. SWOT Analysis: ${topCareer.swotAnalysis || 'Not available.'}`;

    if (selectedCareers.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Career Selected',
        description: 'Please select at least one career to generate a plan.',
      });
      setIsLoading(false);
      return;
    }

    const result = await getGeneratedGoals({ careerSelections: selectedCareers, studentProfile, timeframes, userId });

    if (result.success && result.data) {
      onPlanGenerated(result.data);
      toast({
        title: 'Plan Generated!',
        description: `Your new GoalMint™ plan is ready.`,
      });
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: result.error || 'There was a problem generating your goal plan. Please try again.',
      });
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <Bot className="mr-2 h-4 w-4" />
          Generate Your Goal Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Your GoalMint™ Plan</DialogTitle>
          <DialogDescription>
            Select up to 3 careers from your top matches to build a personalized roadmap.
          </DialogDescription>
        </DialogHeader>
        {!careerSuggestions || careerSuggestions.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Assessment Data Found</AlertTitle>
            <AlertDescription>
              You must complete the InsightX assessment before a plan can be generated.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            <div className="space-y-3">
              <Label className="font-semibold">Select Careers (up to 3)</Label>
              <div className="space-y-2 rounded-md border p-4">
                {careerSuggestions.slice(0, 5).map((career) => (
                  <div key={career.careerName} className="flex items-center space-x-2">
                    <Checkbox
                      id={career.careerName}
                      checked={selectedCareers.includes(career.careerName)}
                      onCheckedChange={(checked) => handleCheckboxChange(career.careerName, checked)}
                    />
                    <Label htmlFor={career.careerName} className="font-normal cursor-pointer">
                      {career.careerName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="10-year-vision" className="font-semibold">10-Year Vision & Achievement Plan (Optional)</Label>
              <Input id="10-year-vision" name="10-year-vision" placeholder="e.g., Become a leader in my field..." />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading || selectedCareers.length === 0}>
                {isLoading && <LoadingSpinner className="mr-2" />}
                Generate Plan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = React.useState<GoalPlan | null>(null);
  const [careerSuggestions, setCareerSuggestions] = React.useState<CareerSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

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
          if (res.data.careerSuggestions) setCareerSuggestions(res.data.careerSuggestions);
          if (res.data.goalPlan) setGoals(res.data.goalPlan);
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Could not load data',
          description: 'There was a problem loading your data.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, authLoading, toast]);


  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <AppHeader title="GoalMint Planner" />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner className="h-10 w-10" />
        </main>
      </div>
    )
  }


  const sortOrder = ['1-year', '3-year', '5-year', '10-year'];

  const goalPlans = goals ? Object.entries(goals)
    .map(([period, goalsData]) => {
      return {
        period: period,
        title: period.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        goals: Array.isArray(goalsData) ? goalsData : [],
      };
    })
    .sort((a, b) => sortOrder.indexOf(a.period) - sortOrder.indexOf(b.period))
    : [];

  const hasGoals = goals && Object.keys(goals).length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="GoalMint Planner" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold font-headline tracking-tight">Your SMART GoalMint™ Plan</h2>
              <p className="text-muted-foreground">Translate your chosen career path into an executable roadmap.</p>
            </div>
            {hasGoals &&
              <GeneratePlanDialog onPlanGenerated={setGoals} careerSuggestions={careerSuggestions} userId={user?.uid || null} />
            }
          </div>

          {hasGoals ? (
            <Tabs defaultValue={goalPlans[0]?.period} className="w-full">
              <TabsList className={`grid w-full grid-cols-${goalPlans.length > 1 ? goalPlans.length : 2}`}>
                {goalPlans.map((plan) => (
                  <TabsTrigger key={plan.period} value={plan.period}>
                    {plan.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {goalPlans.map((plan) => (
                <TabsContent key={plan.period} value={plan.period}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-headline">{plan.title}</CardTitle>
                      <CardDescription>
                        Your SMART goals and execution timeline for the next {plan.period.replace('-', ' ')}.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="multiple" defaultValue={['academic', 'skill', 'networking']} className="w-full">
                        <GoalCategory title="Academic" goals={plan.goals} icon={categoryIcons.Academic} />
                        <GoalCategory title="Skill" goals={plan.goals} icon={categoryIcons.Skill} />
                        <GoalCategory title="Networking" goals={plan.goals} icon={categoryIcons.Networking} />
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card className="text-center p-12 border-dashed">
              <Goal className="h-12 w-12 mx-auto text-muted-foreground" />
              <CardTitle className="font-headline mt-4">Create Your Career Roadmap</CardTitle>
              <CardDescription className="mt-2 mb-6 max-w-sm mx-auto">
                Your GoalMint™ Plan is currently empty. Use the Goal Builder to generate a personalized action plan based on your career choice.
              </CardDescription>
              <GeneratePlanDialog onPlanGenerated={setGoals} careerSuggestions={careerSuggestions} userId={user?.uid || null} />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
