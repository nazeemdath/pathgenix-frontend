
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/loading-spinner';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { saveParentQuizAnswers } from '@/lib/actions';

const quizQuestions = [
  {
    id: 'pq1',
    question: 'We can cover major education expenses (coaching, exams, travel, tuition).',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'pq2',
    question: 'We are open to our child relocating for study or career opportunities.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'pq3',
    question: 'Our child has reliable access to a device and internet for learning.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'pq4',
    question: 'We understand and support the career direction our child is exploring.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
  {
    id: 'pq5',
    question: 'There are viable colleges or career centers within commuting range of our home.',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  },
];

function ParentQuestionCard({
  question,
  selectedValue,
  onChange,
}: {
  question: { id: string; question: string; options: string[] };
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="font-medium mb-4">{question.question}</p>
        <RadioGroup value={selectedValue} onValueChange={onChange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map((opt, index) => (
              <Label
                key={index}
                htmlFor={`${question.id}-${index}`}
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
              >
                <RadioGroupItem value={opt} id={`${question.id}-${index}`} />
                {opt}
              </Label>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function ParentQuizContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { toast } = useToast();

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentId) {
        toast({ variant: 'destructive', title: 'Invalid Link', description: 'This quiz link is missing a student identifier.' });
        return;
    }
    if (Object.keys(answers).length < quizQuestions.length) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Quiz',
        description: 'Please answer all questions before submitting.',
      });
      return;
    }

    setIsLoading(true);
    const result = await saveParentQuizAnswers({ studentId, answers });
    
    if (result.success) {
        setIsSubmitted(true);
        toast({
          title: 'Thank You!',
          description: 'Your responses have been submitted successfully.',
        });
    } else {
        toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: result.error || 'Could not save your answers. Please try again.',
        });
    }
    setIsLoading(false);
  };
  
  if (isSubmitted) {
    return (
        <Card className="max-w-2xl w-full text-center">
            <CardHeader>
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                <CardTitle className="font-headline text-2xl mt-4">Submission Successful</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Thank you for taking the time to provide your valuable input. Your responses will help provide a more complete picture for your child's career planning journey. You can now close this window.
                </p>
            </CardContent>
        </Card>
    );
  }

  if (!studentId) {
     return (
        <Card className="max-w-2xl w-full text-center">
            <CardHeader>
                <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
                <CardTitle className="font-headline text-2xl mt-4">Invalid Quiz Link</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    This parent quiz link is invalid or has expired. Please ask the student to send a new invitation from their assessment page.
                </p>
            </CardContent>
        </Card>
     )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 w-full">
        <Card>
        <CardHeader>
            <CardTitle className="font-headline">A Quick Survey for Parents</CardTitle>
            <CardDescription>
            Thank you for participating. Your perspective is incredibly valuable for your child's career exploration. Please answer the following questions to the best of your ability.
            </CardDescription>
        </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
        {quizQuestions.map(q => (
            <ParentQuestionCard
            key={q.id}
            question={q}
            selectedValue={answers[q.id]}
            onChange={(v) => handleAnswerChange(q.id, v)}
            />
        ))}
        
        <Card>
            <CardFooter className="p-6">
                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                    Submit Answers
                </Button>
            </CardFooter>
        </Card>
        </form>
    </div>
  );
}


export default function ParentQuizPage() {
    return (
        <div className="flex min-h-svh flex-1 flex-col bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
                <h1 className="text-xl md:text-2xl font-bold font-headline text-foreground">Parent & Guardian Quiz</h1>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <React.Suspense fallback={<LoadingSpinner className="h-10 w-10"/>}>
                    <ParentQuizContent />
                </React.Suspense>
            </main>
        </div>
    );
}

    