import { fetchAPI } from '@/lib/api-client';
import {
  getUserRecord,
  recordParentQuizSent,
  saveParentQuizSubmission,
  upsertUserRecord,
  type LocalCareerReport,
} from '@/lib/local-app-state';
import type {
  CareerSuggestion,
  Goal,
  GoalPlan,
  InsightXReportData,
  MentorMessage,
  PathXploreData,
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

function timestampObject() {
  return {
    seconds: Math.floor(Date.now() / 1000),
    nanoseconds: 0,
  };
}

type BackendScoreResult = {
  personality_profile: InsightXReportData['personalityProfile'];
  interest_profile: InsightXReportData['interestProfile'];
  cognitive_profile: Record<string, number>;
  skill_profile: Record<string, number>;
  cvq_profile: Record<string, number>;
  picc_components: InsightXReportData['piccComponents'];
  pic_index: number;
  scoring_version: string;
  generated_at: string;
};

type BackendAssessment = {
  general_info: {
    name: string;
    dob: string;
    gender: string;
    class_of_study: string;
    place: string;
    school_or_college: string;
  };
  answers: Record<string, Record<string, string>>;
  score_result: BackendScoreResult | null;
};

function toInsightXReport(score: BackendScoreResult): InsightXReportData {
  return {
    personalityProfile: score.personality_profile,
    interestProfile: score.interest_profile,
    cognitiveProfile: score.cognitive_profile,
    skillProfile: score.skill_profile,
    cvqProfile: score.cvq_profile,
    piccComponents: score.picc_components,
    picIndex: score.pic_index,
    scoringVersion: score.scoring_version,
    generatedAt: score.generated_at,
  };
}

function toLocalGeneralInfo(info: BackendAssessment['general_info']): GeneralInfo {
  return {
    name: info.name,
    dob: info.dob,
    gender: info.gender,
    classOfStudy: info.class_of_study,
    place: info.place,
    schoolOrCollege: info.school_or_college,
  };
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

    const backendAssessment = await fetchAPI<BackendAssessment>('/assessments', {
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

    const scoreResult = backendAssessment.data.score_result;
    if (!scoreResult) {
      throw new Error('The assessment was saved but no score result was returned.');
    }

    const backendCareers = await fetchAPI<any>('/careers/generate', {
      method: 'POST',
    });
    if (!backendCareers.success || !backendCareers.data) {
      throw new Error('Career suggestions could not be generated.');
    }

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
    const insightXReport = toInsightXReport(scoreResult);

    upsertUserRecord(userId, (existing) => ({
      ...existing,
      assessment: {
        ...input,
        generalInfo: toLocalGeneralInfo(backendAssessment.data.general_info),
        canonicalAnswers: backendAssessment.data.answers,
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

export async function getLatestAssessmentResult() {
  try {
    const result = await fetchAPI<BackendAssessment>('/assessments/latest');
    if (!result.data.score_result) {
      return { success: false, error: 'Assessment scores are not available yet.' };
    }

    return {
      success: true,
      data: {
        generalInfo: toLocalGeneralInfo(result.data.general_info),
        insightXReport: toInsightXReport(result.data.score_result),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assessment scores.';
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

    // CVQ questions map directly to Q71-Q90 in the Grade 12 module.
    const cvqMapping: Record<string, string> = {
      v1: 'Q71', v2: 'Q72', v3: 'Q73', v4: 'Q74', v5: 'Q75',
      v6: 'Q76', v7: 'Q77', v8: 'Q78', v9: 'Q79', v10: 'Q80',
      v11: 'Q81', v12: 'Q82', v13: 'Q83', v14: 'Q84', v15: 'Q85',
      v16: 'Q86', v17: 'Q87', v18: 'Q88', v19: 'Q89', v20: 'Q90',
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

    // Ensure standard Likert questions Q1–Q40 (Personality + Interest) and Q61–Q70 (Skills) have at least a neutral default (3)
    for (let i = 1; i <= 40; i++) {
      if (studentResponses[`Q${i}`] === undefined || studentResponses[`Q${i}`] === null) {
        studentResponses[`Q${i}`] = 3;
      }
    }
    for (let i = 61; i <= 70; i++) {
      if (studentResponses[`Q${i}`] === undefined || studentResponses[`Q${i}`] === null) {
        studentResponses[`Q${i}`] = 3;
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

    // Parse the JSON response and decode the base64-encoded PDF
    const data = await response.json();

    if (!data.isSuccess || !data.pdf_base64) {
      return { success: false, error: data.message || 'Report generation failed.' };
    }

    // Decode base64 string to binary
    const byteCharacters = atob(data.pdf_base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = data.pdf_filename || `${studentName}_InsightXReport.pdf`;
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

/**
 * Helper to build the studentResponses payload from localStorage assessment data.
 * Shared between downloadPdfReport and generatePathXploreReport.
 */
function buildStudentResponsesPayload(assessment: Record<string, any>): {
  studentName: string;
  studentClass: string;
  schoolName: string;
  studentResponses: Record<string, any>;
  coginitiveAnswerkey: any;
} {
  const generalInfo = assessment.generalInfo || {};
  const studentName = generalInfo.name || 'Student';
  const studentClass = generalInfo.classOfStudy || '12';
  const schoolName = generalInfo.schoolOrCollege || '';

  const studentResponses: Record<string, any> = {};

  function remapKeys(
    section: Record<string, any> | undefined,
    prefix: string,
    qOffset: number,
  ) {
    if (!section) return;
    for (const [key, value] of Object.entries(section)) {
      const match = key.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        const qKey = `Q${qOffset + num}`;
        studentResponses[qKey] = typeof value === 'string' && !isNaN(Number(value))
          ? Number(value)
          : value;
      }
    }
  }

  remapKeys(assessment.personality, 'p', 0);
  remapKeys(assessment.interest, 'i', 20);
  remapKeys(assessment.cognitiveAbilities, 'c', 40);
  remapKeys(assessment.selfReportedSkills, 's', 60);

  const cvqMapping: Record<string, string> = {
    v1: 'Q71', v2: 'Q72', v3: 'Q73', v4: 'Q74', v5: 'Q75',
    v6: 'Q76', v7: 'Q77', v8: 'Q78', v9: 'Q79', v10: 'Q80',
    v11: 'Q81', v12: 'Q82', v13: 'Q83', v14: 'Q84', v15: 'Q85',
    v16: 'Q86', v17: 'Q87', v18: 'Q88', v19: 'Q89', v20: 'Q90',
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

  for (let i = 1; i <= 40; i++) {
    if (studentResponses[`Q${i}`] === undefined || studentResponses[`Q${i}`] === null) {
      studentResponses[`Q${i}`] = 3;
    }
  }
  for (let i = 61; i <= 70; i++) {
    if (studentResponses[`Q${i}`] === undefined || studentResponses[`Q${i}`] === null) {
      studentResponses[`Q${i}`] = 3;
    }
  }

  return {
    studentName,
    studentClass,
    schoolName,
    studentResponses,
    coginitiveAnswerkey: assessment.cognitiveAnswerkey || null,
  };
}

/**
 * Generate the PathXplore career intelligence report.
 * Returns structured career data (SWOT, domains, clusters, top choices) and optionally
 * triggers a PDF download. Results are cached in localStorage.
 */
export async function generatePathXploreReport(
  userId: string,
  downloadPdf: boolean = false,
): Promise<{ success: boolean; data?: PathXploreData; error?: string }> {
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

    const payload = buildStudentResponsesPayload(assessment);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    const response = await fetch(`${API_BASE_URL}/pathxplore-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => null);
      const errMsg = errBody?.detail || `Server error (${response.status})`;
      return { success: false, error: errMsg };
    }

    const data = await response.json();

    if (!data.isSuccess || !data.pathxplore_data) {
      return { success: false, error: data.message || 'PathXplore report generation failed.' };
    }

    const pathxploreData: PathXploreData = data.pathxplore_data;

    // Cache in localStorage
    upsertUserRecord(userId, (rec) => ({
      ...rec,
      pathXploreData: pathxploreData,
    }));

    // Optionally trigger PDF download
    if (downloadPdf && data.pdf_base64) {
      const byteCharacters = atob(data.pdf_base64);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteNumbers], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.pdf_filename || `${payload.studentName}_PathXploreReport.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return { success: true, data: pathxploreData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PathXplore report.';
    return { success: false, error: errorMessage };
  }
}
