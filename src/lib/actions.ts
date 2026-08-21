import { fetchAPI } from '@/lib/api-client';
import {
  getUserRecord,
  recordParentQuizSent,
  saveParentQuizSubmission,
  upsertUserRecord,
  type LocalCareerReport,
} from '@/lib/local-app-state';
import { generateInsightXReport } from '@/lib/profile-calculator';
import type {
  CareerSuggestion,
  CognitiveProfile,
  Goal,
  GoalPlan,
  InterestProfile,
  MentorMessage,
  PersonalityProfile,
} from '@/lib/types';

type GeneralInfo = {
  name: string;
  dob: string;
  gender: string;
  classOfStudy: string;
  place: string;
  schoolOrCollege: string;
};

type SuggestCareersInput = {
  personality: Record<string, string>;
  interest: Record<string, string>;
  cognitiveAbilities: Record<string, string>;
  selfReportedSkills: Record<string, string>;
  cvq: Record<string, string>;
};

type GenerateGoalsInput = {
  careerSelections: string[];
  studentProfile: string;
  timeframes: string[];
};

type MentorInput = {
  messages: MentorMessage[];
  studentProfile: string;
};

type CareerTemplate = {
  careerName: string;
  careerDescription: string;
  interestWeights: Partial<Record<keyof InterestProfile, number>>;
  cognitiveWeights: Partial<Record<keyof CognitiveProfile, number>>;
  personalityWeights: Partial<Record<keyof PersonalityProfile, number>>;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  skills: string[];
};

const careerTemplates: CareerTemplate[] = [
  {
    careerName: 'Software Engineer',
    careerDescription: 'Builds digital products, apps, and platforms using structured problem solving.',
    interestWeights: { investigative: 0.4, realistic: 0.25, conventional: 0.2, artistic: 0.15 },
    cognitiveWeights: { logicalReasoning: 0.35, problemSolving: 0.3, numericalAptitude: 0.2, verbalAbility: 0.15 },
    personalityWeights: { openness: 0.25, conscientiousness: 0.4, extraversion: 0.1, agreeableness: 0.15, neuroticism: -0.1 },
    strengths: ['Strong demand across industries', 'Clear learning paths through projects', 'High flexibility in career growth'],
    weaknesses: ['Requires continuous skill updates', 'Can involve long debugging cycles'],
    opportunities: ['Remote global roles', 'AI-assisted development careers'],
    threats: ['Fast-changing tool ecosystem', 'High competition for entry roles'],
    skills: ['problem solving', 'coding fundamentals', 'system thinking'],
  },
  {
    careerName: 'Data Scientist',
    careerDescription: 'Finds insights in data to guide strategy, product decisions, and innovation.',
    interestWeights: { investigative: 0.45, conventional: 0.25, realistic: 0.15, enterprising: 0.15 },
    cognitiveWeights: { numericalAptitude: 0.35, logicalReasoning: 0.3, problemSolving: 0.2, verbalAbility: 0.15 },
    personalityWeights: { openness: 0.3, conscientiousness: 0.35, extraversion: 0.1, agreeableness: 0.15, neuroticism: -0.1 },
    strengths: ['Strong analytics orientation', 'High impact on decision-making', 'Cross-industry relevance'],
    weaknesses: ['Needs math consistency', 'Modeling work can be iterative and slow'],
    opportunities: ['AI and analytics expansion', 'Decision intelligence roles'],
    threats: ['Tool automation for basic tasks', 'Data quality limitations in organizations'],
    skills: ['statistics', 'data storytelling', 'experimentation'],
  },
  {
    careerName: 'UX Designer',
    careerDescription: 'Designs digital experiences that are useful, intuitive, and engaging for users.',
    interestWeights: { artistic: 0.4, social: 0.25, investigative: 0.2, enterprising: 0.15 },
    cognitiveWeights: { verbalAbility: 0.35, problemSolving: 0.3, logicalReasoning: 0.2, numericalAptitude: 0.15 },
    personalityWeights: { openness: 0.35, conscientiousness: 0.25, extraversion: 0.2, agreeableness: 0.2, neuroticism: -0.1 },
    strengths: ['Combines creativity with impact', 'Strong demand in product teams', 'Portfolio-driven career path'],
    weaknesses: ['Requires feedback resilience', 'Decisions are often subjective'],
    opportunities: ['Growing product ecosystem', 'Accessibility and inclusive design demand'],
    threats: ['Crowded junior talent pool', 'Business constraints can reduce creative freedom'],
    skills: ['user research', 'interaction design', 'visual communication'],
  },
  {
    careerName: 'Teacher',
    careerDescription: 'Guides learners through structured instruction and mentorship.',
    interestWeights: { social: 0.45, artistic: 0.2, conventional: 0.2, enterprising: 0.15 },
    cognitiveWeights: { verbalAbility: 0.4, problemSolving: 0.25, logicalReasoning: 0.2, numericalAptitude: 0.15 },
    personalityWeights: { agreeableness: 0.35, conscientiousness: 0.3, extraversion: 0.2, openness: 0.15, neuroticism: -0.1 },
    strengths: ['High social contribution', 'Strong communication development', 'Long-term career stability'],
    weaknesses: ['Can be emotionally demanding', 'Administrative workload may be high'],
    opportunities: ['EdTech integration', 'Specialized subject coaching'],
    threats: ['Policy and curriculum shifts', 'Burnout risk without boundaries'],
    skills: ['instructional planning', 'student support', 'public speaking'],
  },
  {
    careerName: 'Entrepreneur',
    careerDescription: 'Creates and grows ventures by identifying market needs and executing solutions.',
    interestWeights: { enterprising: 0.45, social: 0.2, investigative: 0.2, artistic: 0.15 },
    cognitiveWeights: { problemSolving: 0.3, verbalAbility: 0.25, logicalReasoning: 0.25, numericalAptitude: 0.2 },
    personalityWeights: { extraversion: 0.3, openness: 0.25, conscientiousness: 0.2, agreeableness: 0.15, neuroticism: -0.1 },
    strengths: ['Ownership and autonomy', 'High upside potential', 'Rapid learning environment'],
    weaknesses: ['Income uncertainty in early stages', 'High responsibility pressure'],
    opportunities: ['Digital-first business models', 'Niche market opportunities'],
    threats: ['Funding constraints', 'Market volatility and competition'],
    skills: ['initiative', 'decision making', 'sales and communication'],
  },
  {
    careerName: 'Financial Analyst',
    careerDescription: 'Evaluates financial data to support planning, investment, and business decisions.',
    interestWeights: { conventional: 0.35, investigative: 0.3, enterprising: 0.2, realistic: 0.15 },
    cognitiveWeights: { numericalAptitude: 0.4, logicalReasoning: 0.3, problemSolving: 0.2, verbalAbility: 0.1 },
    personalityWeights: { conscientiousness: 0.35, openness: 0.2, extraversion: 0.15, agreeableness: 0.15, neuroticism: -0.1 },
    strengths: ['Clear progression pathways', 'Strong relevance in all sectors', 'Data-driven decision influence'],
    weaknesses: ['Detail-heavy work', 'Can involve repetitive analysis tasks'],
    opportunities: ['FinTech growth', 'Strategic finance and planning roles'],
    threats: ['Automation of routine reporting', 'Regulatory changes'],
    skills: ['financial modeling', 'analysis', 'business communication'],
  },
  {
    careerName: 'Psychologist',
    careerDescription: 'Supports mental well-being through assessment, counseling, and evidence-based practice.',
    interestWeights: { social: 0.45, investigative: 0.25, artistic: 0.15, conventional: 0.15 },
    cognitiveWeights: { verbalAbility: 0.35, problemSolving: 0.25, logicalReasoning: 0.25, numericalAptitude: 0.15 },
    personalityWeights: { agreeableness: 0.35, openness: 0.2, conscientiousness: 0.25, extraversion: 0.1, neuroticism: -0.1 },
    strengths: ['High human impact', 'Wide specialization options', 'Meaningful long-term growth'],
    weaknesses: ['Requires advanced training', 'Emotionally intensive practice'],
    opportunities: ['Rising mental health awareness', 'Digital counseling and wellness programs'],
    threats: ['Licensing and compliance requirements', 'Emotional fatigue without support'],
    skills: ['active listening', 'ethical reasoning', 'behavioral analysis'],
  },
  {
    careerName: 'Marketing Strategist',
    careerDescription: 'Builds growth strategies through positioning, customer insights, and campaigns.',
    interestWeights: { enterprising: 0.35, artistic: 0.25, social: 0.2, investigative: 0.2 },
    cognitiveWeights: { verbalAbility: 0.3, problemSolving: 0.3, logicalReasoning: 0.2, numericalAptitude: 0.2 },
    personalityWeights: { extraversion: 0.25, openness: 0.25, conscientiousness: 0.2, agreeableness: 0.2, neuroticism: -0.1 },
    strengths: ['Creative and commercial balance', 'Fast-moving opportunities', 'Direct business impact'],
    weaknesses: ['Performance pressure', 'Frequent strategy pivots'],
    opportunities: ['Digital brand expansion', 'Creator economy and community-led growth'],
    threats: ['Algorithm/platform dependency', 'Crowded channels'],
    skills: ['campaign design', 'consumer psychology', 'communication'],
  },
];

function timestampObject() {
  return {
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
  };
}

function weightedScore<T extends Record<string, number>>(
  profile: T,
  weights: Partial<Record<keyof T, number>>,
  options?: { invert?: Array<keyof T> },
) {
  const invert = new Set(options?.invert ?? []);
  let totalWeight = 0;
  let sum = 0;

  (Object.keys(weights) as Array<keyof T>).forEach((key) => {
    const weight = weights[key] || 0;
    const value = profile[key];
    if (typeof value !== 'number') return;
    const adjusted = invert.has(key) ? 100 - value : value;
    totalWeight += weight;
    sum += adjusted * weight;
  });

  if (totalWeight === 0) return 50;
  return Math.round(sum / totalWeight);
}

function toReadableLabel(rawKey: string) {
  return rawKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

function topTraits<T extends Record<string, number>>(profile: T, count: number): string[] {
  return Object.entries(profile)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => toReadableLabel(key));
}

function buildSwotMarkdown(template: CareerTemplate, profile: {
  personalityProfile: PersonalityProfile;
  interestProfile: InterestProfile;
  cognitiveProfile: CognitiveProfile;
}) {
  const dynamicStrength = `Your strongest interest style is ${topTraits(profile.interestProfile, 1)[0]}.`;
  const dynamicGrowth = `Your top growth area is ${topTraits(profile.cognitiveProfile, 1)[0]} application in real projects.`;

  return [
    '**Strengths:**',
    `- ${template.strengths[0]}`,
    `- ${template.strengths[1]}`,
    `- ${dynamicStrength}`,
    '**Weaknesses:**',
    `- ${template.weaknesses[0]}`,
    `- ${template.weaknesses[1]}`,
    `- ${dynamicGrowth}`,
    '**Opportunities:**',
    `- ${template.opportunities[0]}`,
    `- ${template.opportunities[1]}`,
    '**Threats:**',
    `- ${template.threats[0]}`,
    `- ${template.threats[1]}`,
  ].join('\n');
}

function generateCareerSuggestionsFromProfile(profile: {
  personalityProfile: PersonalityProfile;
  interestProfile: InterestProfile;
  cognitiveProfile: CognitiveProfile;
}) {
  const scored = careerTemplates
    .map((template) => {
      const interestScore = weightedScore(profile.interestProfile, template.interestWeights);
      const cognitiveScore = weightedScore(profile.cognitiveProfile, template.cognitiveWeights);
      const personalityScore = weightedScore(profile.personalityProfile, template.personalityWeights, {
        invert: ['neuroticism'],
      });
      const score = Math.round(interestScore * 0.45 + cognitiveScore * 0.35 + personalityScore * 0.2);

      const topInterestTraits = topTraits(profile.interestProfile, 2).join(' and ');
      const topCognitiveTrait = topTraits(profile.cognitiveProfile, 1)[0];
      const explanation = `This path aligns with your ${topInterestTraits} interests and your ${topCognitiveTrait} strength. It also matches the working style reflected in your personality profile.`;

      const suggestion: CareerSuggestion = {
        careerName: template.careerName,
        careerDescription: template.careerDescription,
        matchExplanation: explanation,
        swotAnalysis: buildSwotMarkdown(template, profile),
      };

      return {
        template,
        score,
        suggestion,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topFive = scored.slice(0, 5);
  const suggestions = topFive.map((item) => item.suggestion);
  const domains = topFive.map((item) => ({
    domainName: item.template.careerName,
    description: item.template.careerDescription,
    score: item.score,
    swotAnalysis: item.suggestion.swotAnalysis,
    careerPaths: item.template.skills.map((skill) => `${item.template.careerName} - ${toReadableLabel(skill)}`),
  }));

  return { suggestions, domains, scoredTop: topFive };
}

function buildGoal(id: string, title: string, category: Goal['category'], description: string): Goal {
  return { id, title, category, description };
}

function generateGoalsFromCareers(input: GenerateGoalsInput): GoalPlan {
  const primaryCareer = input.careerSelections[0] || 'Selected Career';
  const secondaryCareer = input.careerSelections[1];
  const blendedCareerText = secondaryCareer ? `${primaryCareer} + ${secondaryCareer}` : primaryCareer;

  const plan: GoalPlan = {};

  input.timeframes.forEach((timeframe) => {
    const prefix = timeframe.replace('-', '_');
    const label = timeframe.replace('-', ' ');
    plan[timeframe] = [
      buildGoal(
        `${prefix}-academic-1`,
        `Complete foundation coursework for ${blendedCareerText}`,
        'Academic',
        `Finish a structured learning plan and core subject milestones for ${label}.`,
      ),
      buildGoal(
        `${prefix}-academic-2`,
        `Build a portfolio milestone in ${primaryCareer}`,
        'Academic',
        `Deliver one measurable portfolio artifact that demonstrates practical understanding.`,
      ),
      buildGoal(
        `${prefix}-skill-1`,
        `Practice high-value skills weekly`,
        'Skill',
        `Reserve weekly time blocks to strengthen problem solving, communication, and execution consistency.`,
      ),
      buildGoal(
        `${prefix}-skill-2`,
        `Apply learning through mini-projects`,
        'Skill',
        `Create small project outputs each month and document lessons learned.`,
      ),
      buildGoal(
        `${prefix}-network-1`,
        `Connect with mentors and peers`,
        'Networking',
        `Join 2 communities related to ${primaryCareer} and participate in discussions every month.`,
      ),
      buildGoal(
        `${prefix}-network-2`,
        `Seek feedback from practitioners`,
        'Networking',
        `Schedule at least one feedback session per quarter on your portfolio progress.`,
      ),
    ];
  });

  return plan;
}

function parseSwotText(swotText: string) {
  const sections: Record<'strengths' | 'weaknesses' | 'opportunities' | 'threats', string[]> = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
  };

  const lines = swotText.split('\n');
  let current: keyof typeof sections | null = null;

  lines.forEach((line) => {
    const cleaned = line.trim().replace(/\*\*/g, '');
    if (!cleaned) return;

    const lower = cleaned.toLowerCase();
    if (lower.startsWith('strengths:')) {
      current = 'strengths';
      return;
    }
    if (lower.startsWith('weaknesses:')) {
      current = 'weaknesses';
      return;
    }
    if (lower.startsWith('opportunities:')) {
      current = 'opportunities';
      return;
    }
    if (lower.startsWith('threats:')) {
      current = 'threats';
      return;
    }

    if (current) {
      sections[current].push(cleaned.replace(/^[-•]\s*/, ''));
    }
  });

  return sections;
}

export function buildCareerReport(userData: {
  careerSuggestions?: CareerSuggestion[];
  goalPlan?: GoalPlan;
  assessment?: Record<string, any>;
}): LocalCareerReport {
  const suggestions = (userData.careerSuggestions || []).slice(0, 3);
  const first = suggestions[0];

  const reportRecommendations = suggestions.map((suggestion, index) => {
    const fitScore = Math.max(60, 92 - index * 7);
    const swot = parseSwotText(suggestion.swotAnalysis || '');

    return {
      careerName: suggestion.careerName,
      fitScore,
      rationale: suggestion.matchExplanation,
      keyStrengths: swot.strengths.slice(0, 3),
      developmentAreas: swot.weaknesses.slice(0, 3),
    };
  });

  const firstSwot = parseSwotText(first?.swotAnalysis || '');
  const goalPeriods = Object.keys(userData.goalPlan || {});
  const hasGoalPlan = goalPeriods.length > 0;

  const executiveSummary = first
    ? `Your current profile shows a strong alignment with ${first.careerName}. You show high readiness in interest and cognitive dimensions that support this path.`
    : 'Complete the assessment to unlock a full personalized summary.';

  const roadmap = hasGoalPlan
    ? `Use your ${goalPeriods.join(', ')} milestones to execute consistently. Focus on monthly proof of progress through projects, reflection, and mentor feedback.`
    : 'Start by generating a GoalMint plan, then execute in 4-week cycles with measurable outcomes.';

  return {
    executiveSummary,
    careerRecommendations: reportRecommendations,
    detailedSWOT: {
      overallStrengths: firstSwot.strengths,
      overallWeaknesses: firstSwot.weaknesses,
      marketOpportunities: firstSwot.opportunities,
      potentialThreats: firstSwot.threats,
    },
    roadmap,
    nextSteps: [
      'Pick one primary career path and define a 30-day target.',
      'Complete one portfolio task and request feedback.',
      'Track weekly effort with a simple reflection log.',
      'Strengthen one weak area with focused practice.',
      'Review progress monthly and refine your roadmap.',
    ],
    generatedAt: timestampObject(),
    status: 'ready',
  };
}

function generateMentorReply(message: string, studentProfile: string) {
  const normalized = message.toLowerCase();
  const hasGoals = /goal|plan|roadmap/.test(normalized);
  const hasAnxiety = /anxious|stress|worry|confused|overwhelm|fear/.test(normalized);
  const hasDecision = /choose|decision|which|between/.test(normalized);
  const mentionsProfile = studentProfile.includes('PathXplore Career Suggestions');

  if (hasAnxiety) {
    return "That feeling is valid. Let's zoom in: what is one part of this decision you can control this week, and what tiny step would make you feel 1% clearer?";
  }
  if (hasDecision) {
    return 'Good question. Compare your top 2 options on three points: daily work you enjoy, skills you can build now, and opportunities available near you. Which one scores highest today?';
  }
  if (hasGoals) {
    return 'Great momentum. Choose one short-term milestone, one weekly habit, and one accountability check. If you stay consistent for 4 weeks, what result should be visible?';
  }
  if (mentionsProfile) {
    return 'From your current profile, you already have useful strengths. Which recommended path feels energizing enough that you would happily practice it even on difficult days?';
  }
  return "Let's reflect together: what outcome matters most to you right now, and what is the smallest next action you can take in the next 24 hours?";
}

export async function getCareerSuggestions(input: SuggestCareersInput & { userId: string; generalInfo: GeneralInfo }) {
  try {
    const userId = input.userId;
    if (!userId) throw new Error('User not authenticated.');

    // 1. Submit assessment to FastAPI backend
    try {
      const backendAssessment = await fetchAPI<any>('/assessments', {
        method: 'POST',
        body: JSON.stringify({
          general_info: {
            name: input.generalInfo.name,
            dob: input.generalInfo.dob,
            gender: input.generalInfo.gender,
            class_of_study: input.generalInfo.classOfStudy,
            place: input.generalInfo.place,
            school_or_college: input.generalInfo.schoolOrCollege,
          },
          personality: input.personality,
          interest: input.interest,
          cognitive_abilities: input.cognitiveAbilities,
          self_reported_skills: input.selfReportedSkills || {},
          cvq: input.cvq || {},
        }),
      });

      // 2. Generate careers via FastAPI backend
      const backendCareers = await fetchAPI<any>('/careers/generate', {
        method: 'POST',
      });

      if (backendCareers.success && backendCareers.data) {
        const suggestions: CareerSuggestion[] = backendCareers.data.suggestions.map((s: any) => ({
          careerName: s.career_name,
          careerDescription: s.career_description,
          matchExplanation: s.match_explanation,
          swotAnalysis: s.swot_analysis,
        }));

        const domains = backendCareers.data.domains.map((d: any) => ({
          domainName: d.domain_name,
          description: d.description,
          score: d.score,
          swotAnalysis: d.swot_analysis,
          careerPaths: d.career_paths,
        }));

        const scoreRes = backendAssessment.data?.score_result;
        const insightXReport = scoreRes
          ? {
              personalityProfile: {
                openness: scoreRes.personality_profile.openness,
                conscientiousness: scoreRes.personality_profile.conscientiousness,
                extraversion: scoreRes.personality_profile.extraversion,
                agreeableness: scoreRes.personality_profile.agreeableness,
                neuroticism: scoreRes.personality_profile.neuroticism,
              },
              interestProfile: {
                realistic: scoreRes.interest_profile.realistic,
                investigative: scoreRes.interest_profile.investigative,
                artistic: scoreRes.interest_profile.artistic,
                social: scoreRes.interest_profile.social,
                enterprising: scoreRes.interest_profile.enterprising,
                conventional: scoreRes.interest_profile.conventional,
              },
              cognitiveProfile: {
                logicalReasoning: scoreRes.cognitive_profile.logical_reasoning,
                verbalAbility: scoreRes.cognitive_profile.verbal_ability,
                problemSolving: scoreRes.cognitive_profile.problem_solving,
                numericalAptitude: scoreRes.cognitive_profile.numerical_aptitude,
              },
              picIndex: scoreRes.pic_index,
              generatedAt: scoreRes.generated_at,
            }
          : generateInsightXReport({
              personality: input.personality,
              interest: input.interest,
              cognitiveAbilities: input.cognitiveAbilities,
            });

        upsertUserRecord(userId, (existing) => ({
          ...existing,
          assessment: {
            ...input,
            updatedAt: new Date().toISOString(),
          },
          careerDomains: domains,
          careerSuggestions: suggestions,
          insightXReport,
        }));

        return { success: true, data: suggestions, domains, insightXReport };
      }
    } catch (apiErr) {
      console.warn('Backend assessment submission failed, falling back to local computation:', apiErr);
    }

    // Fallback to local computation
    const insightXReport = generateInsightXReport({
      personality: input.personality,
      interest: input.interest,
      cognitiveAbilities: input.cognitiveAbilities,
    });

    const { suggestions, domains } = generateCareerSuggestionsFromProfile(insightXReport);

    upsertUserRecord(userId, (existing) => ({
      ...existing,
      assessment: {
        ...input,
        updatedAt: new Date().toISOString(),
      },
      careerDomains: domains,
      careerSuggestions: suggestions,
      insightXReport,
    }));

    return { success: true, data: suggestions, domains, insightXReport };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate career suggestions.';
    return { success: false, error: errorMessage };
  }
}

export async function getGeneratedGoals(input: GenerateGoalsInput & { userId: string }) {
  try {
    if (!input.userId) throw new Error('User not authenticated.');
    if (!input.careerSelections?.length) throw new Error('Select at least one career.');

    try {
      const backendGoals = await fetchAPI<any>('/goals/generate', {
        method: 'POST',
        body: JSON.stringify({
          career_selections: input.careerSelections,
          student_profile: input.studentProfile || '',
          timeframes: input.timeframes || ['1-year', '3-year', '5-year'],
        }),
      });

      if (backendGoals.success && backendGoals.data?.plan) {
        const goals: GoalPlan = backendGoals.data.plan;
        upsertUserRecord(input.userId, (existing) => ({
          ...existing,
          goalPlan: goals,
        }));
        return { success: true, data: goals };
      }
    } catch (apiErr) {
      console.warn('Backend goals generation failed, falling back to local calculation:', apiErr);
    }

    const goals = generateGoalsFromCareers(input);

    upsertUserRecord(input.userId, (existing) => ({
      ...existing,
      goalPlan: goals,
    }));

    return { success: true, data: goals };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate goals.';
    return { success: false, error: errorMessage };
  }
}

export async function sendParentQuiz(data: { email?: string; phone?: string; studentId: string }) {
  if (!data.email && !data.phone) {
    return { success: false, error: 'No contact information provided.' };
  }
  if (!data.studentId) {
    return { success: false, error: 'Student ID is required.' };
  }

  recordParentQuizSent(data);
  return { success: true, message: 'Parent quiz has been sent successfully!' };
}

export async function saveParentQuizAnswers(data: { studentId: string; answers: Record<string, string> }) {
  try {
    const { studentId, answers } = data;
    if (!studentId || !answers) {
      throw new Error('Missing student ID or answers for parent quiz.');
    }

    saveParentQuizSubmission({
      studentId,
      answers,
      submittedAt: new Date().toISOString(),
    });

    return { success: true, message: 'Answers saved successfully.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save parent quiz answers.';
    return { success: false, error: errorMessage };
  }
}

export async function getMentorResponse(input: MentorInput & { userId: string }) {
  try {
    const userId = input.userId;
    if (!userId) throw new Error('User not authenticated.');

    const response = generateMentorReply(
      input.messages[input.messages.length - 1]?.content || '',
      input.studentProfile,
    );

    upsertUserRecord(userId, (existing) => ({
      ...existing,
      mentorChat: [...(input.messages || []), { role: 'model', content: response }],
    }));

    return { success: true, data: response };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get mentor response.';
    return { success: false, error: errorMessage };
  }
}

export async function getUserData(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated.' };
    }

    const record = getUserRecord(userId);
    return { success: true, data: record };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data.';
    return { success: false, error: errorMessage };
  }
}

export async function generateAndSaveCareerReport(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated.' };
    }

    try {
      const backendReport = await fetchAPI<any>('/reports/generate', {
        method: 'POST',
      });

      if (backendReport.success && backendReport.data?.payload) {
        const p = backendReport.data.payload;
        const report: LocalCareerReport = {
          executiveSummary: p.executive_summary,
          careerRecommendations: p.career_recommendations.map((r: any) => ({
            careerName: r.career_name,
            fitScore: r.fit_score,
            rationale: r.rationale,
            keyStrengths: r.key_strengths,
            developmentAreas: r.development_areas,
          })),
          detailedSWOT: {
            overallStrengths: p.detailed_swot.overall_strengths,
            overallWeaknesses: p.detailed_swot.overall_weaknesses,
            marketOpportunities: p.detailed_swot.market_opportunities,
            potentialThreats: p.detailed_swot.potential_threats,
          },
          roadmap: p.roadmap,
          nextSteps: p.next_steps,
          generatedAt: timestampObject(),
          status: 'ready',
        };

        upsertUserRecord(userId, (existing) => ({
          ...existing,
          careerReport: report,
        }));

        return { success: true, data: report };
      }
    } catch (apiErr) {
      console.warn('Backend report generation failed, falling back to local build:', apiErr);
    }

    const userData = getUserRecord(userId);
    if (!userData) {
      return { success: false, error: 'User data not found.' };
    }

    if (!userData.careerSuggestions?.length) {
      return { success: false, error: 'Please complete the assessment first.' };
    }

    const report = buildCareerReport(userData);

    upsertUserRecord(userId, (existing) => ({
      ...existing,
      careerReport: report,
    }));

    return { success: true, data: report };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate career report.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Download the InsightX PDF report by calling the backend /pathgenix-report endpoint.
 * Reads assessment data from localStorage, sends it to the backend, and triggers
 * a browser file download of the generated PDF.
 */
export async function downloadPdfReport(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: 'User not authenticated.' };
    }

    const record = getUserRecord(userId);
    if (!record) {
      return { success: false, error: 'User data not found.' };
    }

    const assessment = record.assessment;
    if (!assessment) {
      return { success: false, error: 'Please complete the assessment first.' };
    }

    // Extract general info from assessment data
    const generalInfo = assessment.generalInfo || {};
    const studentName = generalInfo.name || record.username || 'Student';
    const studentClass = generalInfo.classOfStudy || '12';
    const schoolName = generalInfo.schoolOrCollege || '';

    // Remap frontend keys (p1, i1, c1, s1, v1, ...) to backend keys (Q1, Q21, Q41, Q61, Q71, ...)
    // The backend scoring functions expect a flat dict keyed as Q1–Q95.
    const studentResponses: Record<string, any> = {};

    function remapKeys(
      section: Record<string, any> | undefined,
      prefix: string,
      qOffset: number,
    ) {
      if (!section) return;
      for (const [key, value] of Object.entries(section)) {
        // Extract numeric part from key (e.g. "p1" → 1, "i12" → 12)
        const match = key.match(new RegExp(`^${prefix}(\\d+)$`));
        if (match) {
          const num = parseInt(match[1], 10);
          const qKey = `Q${qOffset + num}`;
          // Convert string-numeric values to numbers (backend expects int 1-5)
          studentResponses[qKey] = typeof value === 'string' && !isNaN(Number(value))
            ? Number(value)
            : value;
        }
      }
    }

    // Personality: p1–p20 → Q1–Q20
    remapKeys(assessment.personality, 'p', 0);
    // Interest: i1–i20 → Q21–Q40
    remapKeys(assessment.interest, 'i', 20);
    // Cognitive: c1–c20 → Q41–Q60
    remapKeys(assessment.cognitiveAbilities, 'c', 40);
    // Skills: s1–s20 → Q61–Q80
    remapKeys(assessment.selfReportedSkills, 's', 60);

    // CVQ needs special mapping since the frontend groups don't match backend Q-numbers.
    // Frontend v1-v2 = Cultural (backend Q91-Q92), v3-v4 = Language (Q76-Q77),
    // v5-v6 = Digital (Q81-Q82), v7-v10 = Financial (Q86-Q89)
    const cvqMapping: Record<string, string> = {
      v1: 'Q91', v2: 'Q92',
      v3: 'Q76', v4: 'Q77',
      v5: 'Q81', v6: 'Q82',
      v7: 'Q86', v8: 'Q87', v9: 'Q88', v10: 'Q89',
    };
    if (assessment.cvq) {
      for (const [key, value] of Object.entries(assessment.cvq as Record<string, any>)) {
        const qKey = cvqMapping[key];
        if (qKey) {
          studentResponses[qKey] = typeof value === 'string' && !isNaN(Number(value))
            ? Number(value)
            : value;
        }
      }
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(`${API_BASE_URL}/pathgenix-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName,
        studentClass,
        schoolName,
        studentResponses,
        coginitiveAnswerkey: assessment.cognitiveAnswerkey || null,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const errMsg = errBody?.detail || `Server error (${response.status})`;
      return { success: false, error: errMsg };
    }

    // Receive PDF blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentName}_InsightXReport.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to download PDF report.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch dynamic assessment questions filtered by student grade from the FastAPI backend.
 */
export async function fetchAssessmentQuestions(grade: number = 10) {
  try {
    const res = await fetchAPI<any>(`/assessments/questions?grade=${grade}`);
    return res;
  } catch (error) {
    console.warn('Failed to fetch dynamic questions from backend:', error);
    return { success: false, error: 'Could not fetch questions from server' };
  }
}

