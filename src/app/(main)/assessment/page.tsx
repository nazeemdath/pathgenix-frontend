
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/loading-spinner';
import { getCareerSuggestions, sendParentQuiz, fetchAssessmentQuestions, getUserData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Mail, Sparkles, RefreshCw, Edit3, CheckCircle2, UserCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInYears, parseISO, isValid } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';



const assessmentSections = [
  { id: 'personality', title: 'Personality Assessment', questions: 20, time: 15 * 60, instructions: 'Rate how much each statement describes you on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree).' },
  { id: 'interest', title: 'Interest Inventory', questions: 20, time: 10 * 60, instructions: 'Indicate how much you would enjoy performing each activity on a scale of 1 (Strongly Dislike) to 5 (Strongly Like).' },
  { id: 'cognitive', title: 'Cognitive Capability + Skill Mapping', questions: 40, time: 25 * 60, instructions: 'This section has two parts. First, answer 20 cognitive ability questions. Then, self-assess your skills with 20 skill mapping questions.' },
  { id: 'cvq', title: 'Contextual Viability Quotient (CVQ™)', questions: 10, time: 10 * 60, instructions: 'Rate how much you agree with each statement on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree) for your top career choice.' }
];

const totalTime = assessmentSections.reduce((acc, section) => acc + section.time, 0);

const defaultAssessmentQuestions = {
  personality: [
    { id: 'p1', question: 'I enjoy being the center of attention in a group.' },
    { id: 'p2', question: 'I make sure my school assignments are neat and organized.' },
    { id: 'p3', question: 'I love learning about new and unusual things.' },
    { id: 'p4', question: 'I sometimes get anxious or worried about small things.' },
    { id: 'p5', question: 'I try to be kind and considerate to everyone.' },
    { id: 'p6', question: 'I always finish what I start, even if it\'s difficult.' },
    { id: 'p7', question: 'I often come up with creative ideas for school projects or hobbies.' },
    { id: 'p8', question: 'I am reliable and people can count on me.' },
    { id: 'p9', question: 'I am good at understanding how others are feeling.' },
    { id: 'p10', question: 'I tend to overthink things and get stressed.' },
    { id: 'p11', question: 'I like to explore different cultures and ideas.' },
    { id: 'p12', question: 'I enjoy taking charge when working on a group project.' },
    { id: 'p13', question: 'I believe most people are honest and trustworthy.' },
    { id: 'p14', question: 'I set high standards for myself in schoolwork.' },
    { id: 'p15', question: 'I feel energized when I\'m around a lot of people.' },
    { id: 'p16', question: 'I sometimes feel overwhelmed by my emotions.' },
    { id: 'p17', question: 'I am very imaginative and like to daydream.' },
    { id: 'p18', question: 'I prefer to stick to a schedule and routine.' },
    { id: 'p19', question: 'I usually stay calm, even in stressful situations.' },
    { id: 'p20', question: 'I prefer to spend my free time alone or with a few close friends.' }
  ],
  interest: [
    { id: 'i1', question: 'Creating a new game or app idea for my phone.' },
    { id: 'i2', question: 'Mentoring a younger student or helping a classmate with their studies.' },
    { id: 'i3', question: 'Building or fixing things with my hands (e.g., models, electronics).' },
    { id: 'i4', question: 'Organizing a school event or a group project.' },
    { id: 'i5', question: 'Conducting experiments in a science lab.' },
    { id: 'i6', question: 'Writing stories, poems, or creating digital art.' },
    { id: 'i7', question: 'Keeping my notes and files perfectly organized.' },
    { id: 'i8', question: 'Volunteering for a community service project.' },
    { id: 'i9', question: 'Learning how machines or devices work.' },
    { id: 'i10', question: 'Leading a club or a school group.' },
    { id: 'i11', question: 'Researching a topic in depth for a school report.' },
    { id: 'i12', question: 'Performing in a play, band, or debate.' },
    { id: 'i13', question: 'Working with numbers and keeping track of finances (e.g., for a school club).' },
    { id: 'i14', question: 'Helping people who are facing difficulties.' },
    { id: 'i15', question: 'Designing and building something physical (e.g., a robot, a craft).' },
    { id: 'i16', question: 'Convincing others to support an idea or project.' },
    { id: 'i17', question: 'Solving complex math problems or logic puzzles.' },
    { id: 'i18', question: 'Expressing my thoughts clearly in written essays or presentations.' },
    { id: 'i19', question: 'Working with plants or animals in a garden or farm.' },
    { id: 'i20', question: 'Imagining new inventions or solutions to problems.' }
  ],
  cognitive: [
    { id: 'c1', question: 'Which word is the odd one out: Apple, Banana, Carrot, Orange, Grape?', options: ['Apple', 'Banana', 'Carrot', 'Orange', 'Grape'] },
    { id: 'c2', question: 'Complete the series: 2, 4, 8, 16, ?', options: ['20', '24', '32', '36'] },
    { id: 'c3', question: 'If a bird is to flying as a fish is to ____?', options: ['Swimming', 'Jumping', 'Eating', 'Singing'] },
    { id: 'c4', question: 'Which shape comes next in the sequence: Triangle, Square, Pentagon, Hexagon, ?', options: ['Heptagon', 'Octagon', 'Circle', 'Star'] },
    { id: 'c5', question: 'A cyclist travels 10 km in 20 minutes. How far will they travel in 1 hour?', options: ['10 km', '20 km', '30 km', '40 km'] },
    { id: 'c6', question: 'Find the missing number: 1, 3, 6, 10, ?', options: ['13', '14', '15', '16'] },
    { id: 'c7', question: 'Which word is the odd one out: Book, Pen, Pencil, Eraser, Desk?', options: ['Book', 'Pen', 'Pencil', 'Eraser', 'Desk'] },
    { id: 'c8', question: 'If all students are learners, and all learners are curious, then all students are curious. True or False?', options: ['True', 'False'] },
    { id: 'c9', question: 'Which of the following is the next logical step in the pattern: AB, CD, EF, GH, ?', options: ['IJ', 'KL', 'JK', 'HI'] },
    { id: 'c10', question: 'If you rearrange the letters \'TINAP\', you would have the name of a(n):', options: ['Animal', 'Fruit', 'Color', 'Country'] },
    { id: 'c11', question: 'A recipe calls for 2 cups of flour for 8 cookies. How much flour is needed for 16 cookies?', options: ['2 cups', '3 cups', '4 cups', '6 cups'] },
    { id: 'c12', question: 'Which word is the opposite of \'Brave\': Fearful, Strong, Bold, Heroic?', options: ['Fearful', 'Strong', 'Bold', 'Heroic'] },
    { id: 'c13', question: 'If a baker can decorate 12 cakes in 3 hours, how many cakes can they decorate in 1 hour?', options: ['3 cakes', '4 cakes', '6 cakes', '12 cakes'] },
    { id: 'c14', question: 'Complete the sequence: Z, X, V, T, ?', options: ['S', 'U', 'R', 'Q'] },
    { id: 'c15', question: 'Which of these is an even number: 5, 7, 9, 10?', options: ['5', '7', '9', '10'] },
    { id: 'c16', question: 'Rahul is taller than Priya. Priya is taller than Sameer. Is Rahul taller than Sameer?', options: ['Yes', 'No', 'Cannot Say'] },
    { id: 'c17', question: 'Which word is the odd one out: Happy, Sad, Angry, Excited, Sleepy?', options: ['Happy', 'Sad', 'Angry', 'Excited', 'Sleepy'] },
    { id: 'c18', question: 'If 3 friends share 15 chocolates equally, how many chocolates does each friend get?', options: ['3', '5', '10', '15'] },
    { id: 'c19', question: 'Which set of letters completes the pattern: AZ, BY, CX, DW, ?', options: ['EV', 'FU', 'GT', 'HS'] },
    { id: 'c20', question: 'What is 25% of 80?', options: ['10', '20', '25', '40'] }
  ],
  skillMapping: [
    { id: 's1', question: 'I am confident sharing my ideas in front of my class.' },
    { id: 's2', question: 'I can quickly figure out how to use a new app or software.' },
    { id: 's3', question: 'I am good at explaining difficult topics to my friends.' },
    { id: 's4', question: 'I often think of unique ways to do school projects.' },
    { id: 's5', question: 'I keep my school bag and study area organized.' },
    { id: 's6', question: 'I enjoy working with others on group assignments.' },
    { id: 's7', question: 'I am good at solving brain teasers or riddles.' },
    { id: 's8', question: 'I can adjust easily when plans change unexpectedly.' },
    { id: 's9', question: 'I am good at writing clear and persuasive essays.' },
    { id: 's10', question: 'I feel comfortable giving presentations or speeches.' },
    { id: 's11', question: 'I am good at managing my time effectively to meet deadlines.' },
    { id: 's12', question: 'I can work well under pressure and stay focused.' },
    { id: 's13', question: 'I am resourceful when faced with limited tools or information.' },
    { id: 's14', question: 'I am good at finding solutions to problems independently.' },
    { id: 's15', question: 'I can effectively manage multiple tasks at once.' },
    { id: 's16', question: 'I am comfortable learning and adapting to new technologies quickly.' },
    { id: 's17', question: 'I am good at analyzing information to make decisions.' },
    { id: 's18', question: 'I can clearly express my ideas in writing.' },
    { id: 's19', question: 'I am skilled at resolving conflicts or disagreements in a group.' },
    { id: 's20', question: 'I am comfortable taking initiative and leading a task.' }
  ],
  cvq: [
    { id: 'v1', section: 'Cultural & Societal Compatibility', question: 'I am free to pursue any career, regardless of family traditions or expectations.' },
    { id: 'v2', section: 'Cultural & Societal Compatibility', question: 'My family does not interfere in my career decision-making.' },
    { id: 'v3', section: 'Language Readiness (Current + Future)', question: 'I can currently read, write, and speak in English or the required career language.' },
    { id: 'v4', section: 'Language Readiness (Current + Future)', question: 'I understand lectures, videos, or tutorials in English without needing translations.' },
    { id: 'v5', section: 'Digital Access & Tech Confidence', question: 'I have regular access to a smartphone with internet.' },
    { id: 'v6', section: 'Digital Access & Tech Confidence', question: 'I have access to a laptop or desktop at least 3 days per week.' },
    { id: 'v7', section: 'Financial & Geographic Readiness', question: 'I can afford entrance or coaching exam fees over the next year.' },
    { id: 'v8', section: 'Financial & Geographic Readiness', question: 'My financial situation may limit my choice of college or career options. (reverse scored)' },
    { id: 'v9', section: 'Financial & Geographic Readiness', question: 'I am willing to apply for scholarships or part-time jobs to support my career goals.' },
    { id: 'v10', 'section': 'Financial & Geographic Readiness', question: 'I am willing to relocate to another city/state/country for education or work.' }
  ]
};

const ratingLabels = {
  personality: [
    { value: '1', label: 'Strongly Disagree' },
    { value: '2', label: 'Disagree' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Agree' },
    { value: '5', label: 'Strongly Agree' },
  ],
  interest: [
    { value: '1', label: 'Strongly Dislike' },
    { value: '2', label: 'Dislike' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Like' },
    { value: '5', label: 'Strongly Like' },
  ],
  skillMapping: [
    { value: '1', label: 'Not at all confident' },
    { value: '2', label: 'Slightly confident' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Confident' },
    { value: '5', label: 'Very confident' },
  ],
  cvq: [
    { value: '1', label: 'Strongly Disagree' },
    { value: '2', label: 'Disagree' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Agree' },
    { value: '5', label: 'Strongly Agree' },
  ]
};

function Timer({ secondsLeft, sectionTime }: { secondsLeft: number, sectionTime: number }) {
  const totalMinutes = Math.floor(totalTime / 60);
  const displaySectionMinutes = Math.floor(secondsLeft / 60);
  const displaySectionSeconds = secondsLeft % 60;

  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 font-mono text-lg font-semibold">
        <Clock className="h-5 w-5" />
        <span>{String(displaySectionMinutes).padStart(2, '0')}:{String(displaySectionSeconds).padStart(2, '0')}</span>
      </div>
      <p className="text-xs text-muted-foreground">Section time: {sectionTime / 60} mins | Total: {totalMinutes} mins</p>
    </div>
  );
}

function QuestionCard({
  question,
  options,
  selectedValue,
  onChange,
}: {
  question: { id: string; question: string; options?: string[] };
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}) {
  const isMcq = !!question.options;
  const answerOptions = isMcq
    ? question.options!.map(opt => ({ value: opt, label: opt }))
    : options;

  return (
    <Card>
      <CardContent className="p-6">
        <p className="font-medium mb-4">{question.question}</p>
        <RadioGroup value={selectedValue} onValueChange={onChange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {answerOptions.map(opt => (
              <Label
                key={opt.value}
                htmlFor={`${question.id}-${opt.value}`}
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10"
              >
                <RadioGroupItem value={opt.value} id={`${question.id}-${opt.value}`} />
                {opt.label}
              </Label>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

export default function AssessmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, Record<string, string>>>({
    personality: {},
    interest: {},
    cognitiveAbilities: {},
    selfReportedSkills: {},
    cvq: {},
  });
  const [submissionStatus, setSubmissionStatus] = React.useState<'idle' | 'submitting' | 'polling' | 'failed' | 'success'>('idle');
  const [isSendingQuiz, setIsSendingQuiz] = React.useState(false);
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState<Date | undefined>();
  const [gender, setGender] = React.useState('');
  const [classOfStudy, setClassOfStudy] = React.useState('');
  const [place, setPlace] = React.useState('');
  const [schoolOrCollege, setSchoolOrCollege] = React.useState('');
  const [parentEmail, setParentEmail] = React.useState('');
  const [parentPhone, setParentPhone] = React.useState('');

  const [hasExistingAssessment, setHasExistingAssessment] = React.useState(false);
  const [existingAssessmentDate, setExistingAssessmentDate] = React.useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = React.useState(false);

  const [isTestActive, setIsTestActive] = React.useState(false);
  const [sectionTimeLeft, setSectionTimeLeft] = React.useState(0);
  const [isTimeUp, setIsTimeUp] = React.useState(false);
  const [dynamicQuestions, setDynamicQuestions] = React.useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = React.useState(false);

  const { toast } = useToast();

  const submittedRef = React.useRef(false);

  const assessmentQuestions: {
    personality: Array<{ id: string; question: string; options?: string[] }>;
    interest: Array<{ id: string; question: string; options?: string[] }>;
    cognitive: Array<{ id: string; question: string; options?: string[] }>;
    skillMapping: Array<{ id: string; question: string; options?: string[] }>;
    cvq: Array<{ id: string; question: string; section?: string; options?: string[] }>;
  } = React.useMemo(() => {
    if (!dynamicQuestions) return defaultAssessmentQuestions;

    return {
      personality: (dynamicQuestions.personality || []).map((q: any) => ({
        id: q.code,
        question: q.question_text,
      })),
      interest: (dynamicQuestions.interest || []).map((q: any) => ({
        id: q.code,
        question: q.question_text,
      })),
      cognitive: (dynamicQuestions.cognitive || []).map((q: any) => ({
        id: q.code,
        question: q.question_text,
        options: q.options && q.options.length > 0 ? q.options : undefined,
      })),
      skillMapping: (dynamicQuestions.skills || []).map((q: any) => ({
        id: q.code,
        question: q.question_text,
      })),
      cvq: (dynamicQuestions.cvq || []).map((q: any) => ({
        id: q.code,
        section: q.dimension
          ? q.dimension.charAt(0).toUpperCase() + q.dimension.slice(1).replace(/_/g, ' ')
          : 'General',
        question: q.question_text,
      })),
    };
  }, [dynamicQuestions]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      toast({
        title: 'Authentication Required',
        description: 'You need to be logged in to take the assessment.',
        variant: 'destructive',
      });
    }
  }, [user, authLoading, router, toast]);

  // Automatically prefill student details (Full Name, Grade, School) from User Account
  React.useEffect(() => {
    if (user) {
      const candidateName = user.displayName || (user as any).username || '';
      if (candidateName && !name) {
        setName(candidateName);
      }

      async function loadSavedProfile() {
        try {
          const res = await getUserData(user!.uid);
          if (res.success && res.data) {
            const uData = res.data;

            // Check if student has already completed an assessment
            if (uData.assessment || uData.insightXReport) {
              setHasExistingAssessment(true);
              const prevDate = uData.assessment?.updatedAt || uData.insightXReport?.generatedAt || null;
              if (prevDate) {
                setExistingAssessmentDate(prevDate);
              }
            }

            const fetchedName =
              uData.assessment?.generalInfo?.name ||
              uData.username ||
              user?.displayName ||
              '';
            if (fetchedName && !name) {
              setName(fetchedName);
            }
            if (uData.assessment?.generalInfo) {
              const gi = uData.assessment.generalInfo;
              if (gi.dob && !dob) {
                try {
                  const parsed = typeof gi.dob === 'string' ? parseISO(gi.dob) : new Date(gi.dob);
                  if (isValid(parsed)) {
                    setDob(parsed);
                  }
                } catch (dobErr) {
                  console.warn('Could not parse stored date of birth:', dobErr);
                }
              }
              if (gi.classOfStudy && !classOfStudy) setClassOfStudy(gi.classOfStudy);
              if (gi.gender && !gender) setGender(gi.gender);
              if (gi.place && !place) setPlace(gi.place);
              if (gi.schoolOrCollege && !schoolOrCollege) setSchoolOrCollege(gi.schoolOrCollege);
            }
          }
        } catch (e) {
          // ignore non-blocking
        }
      }
      loadSavedProfile();
    }
  }, [user]);

  React.useEffect(() => {
    if (isTestActive && currentStep > 1) {
      const sectionIndex = currentStep - 2;
      const section = assessmentSections[sectionIndex];
      if (section) {
        setSectionTimeLeft(section.time);
      }
    }
  }, [currentStep, isTestActive]);

  const handleNext = React.useCallback(() => {
    const totalSteps = assessmentSections.length + 2; // +1 for info, +1 for start

    // Check if it's time to show the time's up alert before moving
    if (sectionTimeLeft <= 0 && isTestActive && currentStep > 1) {
      setIsTimeUp(true);
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sectionTimeLeft, isTestActive, currentStep]);

  const handleProceedToQuestions = async () => {
    const gradeMatch = classOfStudy.match(/\d+/);
    const gradeNum = gradeMatch ? parseInt(gradeMatch[0], 10) : 10;

    setIsLoadingQuestions(true);
    try {
      const res = await fetchAssessmentQuestions(gradeNum);
      if (res && res.success && 'data' in res && res.data?.sections) {
        setDynamicQuestions(res.data.sections);
        toast({
          title: `Grade ${gradeNum} Assessment Configured`,
          description: `Loaded dynamic question bank tailored for Grade ${gradeNum}.`,
        });
      }
    } catch (e) {
      console.warn('Could not load dynamic questions, using default question bank:', e);
    } finally {
      setIsLoadingQuestions(false);
    }

    handleNext();
  };

  const handleTimeUpAndProceed = () => {
    setIsTimeUp(false);
    const totalSteps = assessmentSections.length + 2;
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = React.useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to submit your assessment.',
      });
      submittedRef.current = false;
      return;
    }

    setIsTestActive(false);
    setSubmissionStatus('submitting');

    const formattedAnswers = {
      generalInfo: {
        name,
        dob: dob ? format(dob, 'yyyy-MM-dd') : '',
        gender,
        classOfStudy,
        place,
        schoolOrCollege,
      },
      personality: answers.personality,
      interest: answers.interest,
      cognitiveAbilities: answers.cognitiveAbilities,
      selfReportedSkills: answers.selfReportedSkills,
      cvq: answers.cvq,
      userId: user.uid,
    };

    setSubmissionStatus('polling');

    const result = await getCareerSuggestions(formattedAnswers);

    if (result.success) {
      setSubmissionStatus('success');
      toast({
        title: 'Assessment Complete!',
        description: 'Your personalized career analysis is ready.',
      });
      router.push('/pathxplore');
    } else {
      setSubmissionStatus('failed');
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error || 'Could not generate career suggestions. Please try again.',
      });
      submittedRef.current = false;
    }
  }, [user, answers, router, toast, name, dob, gender, classOfStudy, place, schoolOrCollege]);

  React.useEffect(() => {
    if (!isTestActive || currentStep <= 1) return;

    if (sectionTimeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSectionTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sectionTimeLeft, isTestActive, currentStep]);

  React.useEffect(() => {
    if (isTestActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, isTestActive]);

  const handleStartAssessment = () => {
    setIsTestActive(true);
    setCurrentStep(1);
  };

  const handleAnswerChange = (category: string, questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [questionId]: value,
      },
    }));
  };

  const handleSendParentQuiz = React.useCallback(async () => {
    if (!user) return;
    setIsSendingQuiz(true);
    const result = await sendParentQuiz({ email: parentEmail, phone: parentPhone, studentId: user.uid });
    if (result.success) {
      toast({
        title: 'Quiz Sent!',
        description: result.message || 'The parent quiz has been sent successfully.',
      });
      handleNext();
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to Send',
        description: result.error || 'Could not send the parent quiz. Please check the contact details.',
      });
    }
    setIsSendingQuiz(false);
  }, [user, parentEmail, parentPhone, toast, handleNext]);

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    );
  }

  const renderStep = () => {
    if (currentStep === 1) { // General Information Step
      const isUnder18 = dob ? differenceInYears(new Date(), dob) < 18 : false;

      // For returning students who haven't clicked "Edit", show a clean verified summary
      if (hasExistingAssessment && !isEditingInfo) {
        return (
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1 py-0.5">
                    <UserCheck className="h-3.5 w-3.5" /> Verified Profile
                  </Badge>
                  {existingAssessmentDate && (
                    <span className="text-xs text-muted-foreground">
                      Last completed: {format(new Date(existingAssessmentDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                <CardTitle className="font-headline text-2xl pt-1">Student Profile Details</CardTitle>
                <CardDescription>
                  Your information is pre-filled from your previous assessment. You can review it below or edit if anything has changed.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingInfo(true)}
                className="gap-1.5 text-xs font-semibold shrink-0"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Details
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-xl bg-muted/40 border border-border/60">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Full Name</span>
                  <p className="text-sm font-semibold text-foreground">{name || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Date of Birth</span>
                  <p className="text-sm font-semibold text-foreground">{dob ? format(dob, 'PPP') : '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Gender</span>
                  <p className="text-sm font-semibold text-foreground capitalize">{gender || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Class of Study</span>
                  <p className="text-sm font-semibold text-foreground">{classOfStudy || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Place / City</span>
                  <p className="text-sm font-semibold text-foreground">{place || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">School / College</span>
                  <p className="text-sm font-semibold text-foreground">{schoolOrCollege || '—'}</p>
                </div>
              </div>

              {isUnder18 && (
                <div className="text-xs text-muted-foreground flex items-center gap-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Student age eligibility verified (under 18). Your answers will be calibrated for your grade level.</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditingInfo(true)}
                className="w-full sm:w-auto"
              >
                <Edit3 className="mr-2 h-4 w-4" /> Edit Details
              </Button>
              <Button
                onClick={handleProceedToQuestions}
                size="lg"
                className="w-full sm:flex-1 font-semibold"
                disabled={!dob || !gender || !name || isLoadingQuestions}
              >
                {isLoadingQuestions ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> Loading Questions for Grade...
                  </>
                ) : (
                  <>
                    Start Assessment Questions <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      }

      return (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between pb-4">
            <div>
              <CardTitle className="font-headline text-2xl">General Information</CardTitle>
              <CardDescription>Please provide some basic information about yourself.</CardDescription>
            </div>
            {hasExistingAssessment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingInfo(false)}
                className="text-xs font-medium"
              >
                Done Editing
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={setDob}
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear() - 30}
                      toYear={new Date().getFullYear() - 10}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={setGender} value={gender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="class-of-study">Class of Study</Label>
                <Input id="class-of-study" placeholder="e.g., 10th Grade, Freshman" value={classOfStudy} onChange={e => setClassOfStudy(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="place">Place</Label>
                <Input id="place" placeholder="e.g., New York, Mumbai" value={place} onChange={e => setPlace(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-college">School / College</Label>
              <Input id="school-college" placeholder="Enter the name of your institution" value={schoolOrCollege} onChange={e => setSchoolOrCollege(e.target.value)} />
            </div>

            {isUnder18 && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Parent Quiz (Optional)</CardTitle>
                  <CardDescription>
                    For a more complete profile, you can invite a parent or guardian to answer a few questions. This is completely optional.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Parent's Email</Label>
                    <Input id="parent-email" type="email" placeholder="parent@example.com" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent-phone">Parent's Phone (WhatsApp/SMS)</Label>
                    <Input id="parent-phone" type="tel" placeholder="+1234567890" value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSendParentQuiz} disabled={isSendingQuiz || (!parentEmail && !parentPhone)}>
                    {isSendingQuiz ? <LoadingSpinner className="mr-2" /> : <Mail className="mr-2" />}
                    Send Quiz & Continue
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            {hasExistingAssessment && (
              <Button
                variant="outline"
                onClick={() => setIsEditingInfo(false)}
                className="w-full sm:w-auto"
              >
                Back to Summary
              </Button>
            )}
            <Button
              onClick={handleProceedToQuestions}
              size="lg"
              className="w-full sm:flex-1 font-semibold"
              disabled={!dob || !gender || !name || isLoadingQuestions}
            >
              {isLoadingQuestions ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" /> Loading Questions for Grade...
                </>
              ) : (
                <>
                  Start Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (currentStep > 1 && currentStep <= assessmentSections.length + 1) {
      const sectionIndex = currentStep - 2;
      const section = assessmentSections[sectionIndex];
      let questionsContent;
      let questionNumberOffset = 0;
      for (let i = 0; i < sectionIndex; i++) {
        questionNumberOffset += assessmentSections[i].questions;
      }

      switch (section.id) {
        case 'personality':
          questionsContent = assessmentQuestions.personality.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={{ ...q, question: `${questionNumberOffset + i + 1}. ${q.question}` }}
              options={ratingLabels.personality}
              selectedValue={answers.personality[q.id]}
              onChange={(v) => handleAnswerChange('personality', q.id, v)}
            />
          ));
          break;
        case 'interest':
          questionsContent = assessmentQuestions.interest.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={{ ...q, question: `${questionNumberOffset + i + 1}. ${q.question}` }}
              options={ratingLabels.interest}
              selectedValue={answers.interest[q.id]}
              onChange={(v) => handleAnswerChange('interest', q.id, v)}
            />
          ));
          break;
        case 'cognitive':
          let questionCounter = 0;
          questionsContent = (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Part A: Cognitive Capability</h3>
                <div className="space-y-6">
                  {assessmentQuestions.cognitive.map((q) => {
                    questionCounter++;
                    return (
                      <QuestionCard
                        key={q.id}
                        question={{ ...q, question: `${questionNumberOffset + questionCounter}. ${q.question}` }}
                        options={[]} // options are in the question object for MCQ
                        selectedValue={answers.cognitiveAbilities[q.id]}
                        onChange={(v) => handleAnswerChange('cognitiveAbilities', q.id, v)}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="border-t pt-8">
                <h3 className="font-bold text-xl mb-4">Part B: Skill Mapping</h3>
                <div className="space-y-6">
                  {assessmentQuestions.skillMapping.map((q) => {
                    questionCounter++;
                    return (
                      <QuestionCard
                        key={q.id}
                        question={{ ...q, question: `${questionNumberOffset + questionCounter}. ${q.question}` }}
                        options={ratingLabels.skillMapping}
                        selectedValue={answers.selfReportedSkills[q.id]}
                        onChange={(v) => handleAnswerChange('selfReportedSkills', q.id, v)}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          );
          break;
        case 'cvq':
          const cvqSections: { [key: string]: typeof assessmentQuestions.cvq } = {};
          assessmentQuestions.cvq.forEach(q => {
            if (!q.section) return;
            if (!cvqSections[q.section]) cvqSections[q.section] = [];
            cvqSections[q.section].push(q);
          });

          let cvqQuestionCounter = 0;
          questionsContent = Object.entries(cvqSections).map(([sectionTitle, qs]) => (
            <div key={sectionTitle} className="space-y-6">
              <h3 className="font-bold text-xl mb-4">{sectionTitle}</h3>
              {qs.map(q => {
                cvqQuestionCounter++;
                return (
                  <QuestionCard
                    key={q.id}
                    question={{ ...q, question: `${questionNumberOffset + cvqQuestionCounter}. ${q.question}` }}
                    options={ratingLabels.cvq}
                    selectedValue={answers.cvq[q.id]}
                    onChange={(v) => handleAnswerChange('cvq', q.id, v)}
                  />
                );
              })}
            </div>
          ));
          break;
        default:
          return null;
      }
      return (
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="font-headline">{section.title}</CardTitle>
              <CardDescription>{section.instructions}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            {questionsContent}
          </CardContent>
        </Card>
      );
    }

    const totalQuestions = assessmentSections.reduce((total, section) => total + section.questions, 0);

    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="font-headline text-2xl">
                {hasExistingAssessment ? 'InsightX Assessment — Retake Mode' : 'Welcome to the InsightX Assessment'}
              </CardTitle>
              {hasExistingAssessment && (
                <CardDescription className="mt-1">
                  You have previously completed an assessment. You may view your existing report or retake the test.
                </CardDescription>
              )}
            </div>
            {hasExistingAssessment && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1.5 py-1 px-3 shrink-0 self-start sm:self-auto font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Previous Results Available
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasExistingAssessment && (
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">You have already completed this assessment</span>
                  {existingAssessmentDate && (
                    <span className="text-xs text-muted-foreground">
                      ({format(new Date(existingAssessmentDate), 'PPP')})
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Your previous career matches, SWOT analysis, and psychometrics are active on PathXplore. Retaking will overwrite these scores with your newest answers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                <Button variant="outline" size="sm" asChild className="font-semibold">
                  <Link href="/pathxplore">View My Results</Link>
                </Button>
                <Button size="sm" onClick={handleStartAssessment} className="font-semibold shadow-xs">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retake Test
                </Button>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">General Instructions:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
              <li>For students of 13-19 age group: Discover Your Unique Potential</li>
              <li>This assessment is designed to help you understand your unique personality, interests, and cognitive strengths. There are no right or wrong answers. Answer honestly based on how you truly feel or typically behave.</li>
              <li>The assessment consists of {totalQuestions} questions divided into {assessmentSections.length} sections.</li>
              <li>The total time allotted for the assessment is {totalTime / 60} minutes. Each section has a specific time limit.</li>
              <li>Once you complete a section and move to the next, you will not be able to go back to previous sections.</li>
              <li>Read each question carefully and choose the option that best describes you.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Exam Structure Overview:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentSections.map((section, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold">Section {index + 1}: {section.title}</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground">
                    <li>Number of Questions: {section.questions}</li>
                    <li>Time Allotment: {section.time / 60} Minutes</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Honesty is Key!</AlertTitle>
            <AlertDescription>
              For the most accurate results, please answer all questions as honestly as possible.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          {hasExistingAssessment ? (
            <>
              <Button variant="outline" asChild size="lg" className="w-full sm:w-1/2 font-semibold">
                <Link href="/pathxplore">
                  View Previous Results
                </Link>
              </Button>
              <Button onClick={handleStartAssessment} className="w-full sm:w-1/2 font-semibold" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" /> Retake Assessment
              </Button>
            </>
          ) : (
            <Button onClick={handleStartAssessment} className="w-full" size="lg">Proceed to Information Form</Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const isLastAssessmentStep = currentStep === assessmentSections.length + 1;

  const isLoading = submissionStatus === 'submitting' || submissionStatus === 'polling';
  const loadingText = submissionStatus === 'submitting'
    ? "Submitting your answers..."
    : "Analyzing your profile and generating your report...";

  const currentSection = currentStep > 1 ? assessmentSections[currentStep - 2] : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader title="InsightX Assessment" />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {submissionStatus !== 'idle' && submissionStatus !== 'failed' ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <LoadingSpinner className="w-12 h-12 text-primary" />
            <h2 className="text-2xl font-bold font-headline">{loadingText}</h2>
            <p className="text-muted-foreground max-w-md">
              {submissionStatus === 'polling'
                ? "We are analyzing your responses to find your best career matches. This might take a moment."
                : "Please wait while we securely save your assessment responses."
              }
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <AlertDialog open={isTimeUp} onOpenChange={setIsTimeUp}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Time's Up!</AlertDialogTitle>
                  <AlertDialogDescription>
                    The time for this section has expired. Your answers have been saved. Let's move to the next section.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={handleTimeUpAndProceed}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isTestActive && (
              <Card className="sticky top-16 z-20">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex-1 space-y-2">
                    <Progress value={currentStep > 1 ? ((currentStep - 2) / assessmentSections.length) * 100 : 0} className="w-full" />
                    <p className="text-center text-sm text-muted-foreground">
                      {currentStep > 1 ? `Section ${currentStep - 1} of ${assessmentSections.length}` : 'General Information'}
                    </p>
                  </div>
                  {currentSection &&
                    <>
                      <div className="w-px bg-border h-10 mx-6"></div>
                      <Timer secondsLeft={sectionTimeLeft} sectionTime={currentSection.time} />
                    </>
                  }
                </CardContent>
              </Card>
            )}

            {renderStep()}

            {isTestActive && currentStep > 1 && (
              <div className="flex justify-between items-center mt-6">
                <Button variant="outline" disabled={true}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                {isLastAssessmentStep ? (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                    Submit & Get My Results
                  </Button>
                ) : (
                  <Button onClick={handleNext} size="lg">
                    Next Section <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
