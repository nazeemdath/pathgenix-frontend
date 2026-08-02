export type CareerSuggestion = {
    careerName: string;
    careerDescription: string;
    matchExplanation: string;
    swotAnalysis: string;
};

export type PersonalityProfile = {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
};

export type InterestProfile = {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
};

export type CognitiveProfile = {
    logicalReasoning: number;
    verbalAbility: number;
    problemSolving: number;
    numericalAptitude: number;
};

export type InsightXReportData = {
    personalityProfile: PersonalityProfile;
    interestProfile: InterestProfile;
    cognitiveProfile: CognitiveProfile;
    picIndex: number;
    generatedAt: string;
};

export type ReportInfo = {
    id: string;
    title: string;
    description: string;
    pages: number;
    requiresAssessment: boolean;
    requiresGoalPlan: boolean;
    date?: Date | null;
    isAvailable?: boolean;
};

export type MentorMessage = {
    role: 'user' | 'model';
    content: string;
};

export type SwotAnalysis = any;
export type GoalPlan = Record<string, Goal[]>;


export interface Goal {
    id: string;
    title: string;
    category: 'Academic' | 'Skill' | 'Networking';
    description: string;
}

export interface CareerPath {
    id: string;
    title: string;
    description: string;
    matchReasons: string[];
    avgSalary: string;
    jobOutlook: string;
    minEducation: string;
    responsibilities: string[];
    skillMatch: { skill: string; match: number }[];
}

export interface CareerPlanTimeframe {
    goals: string[];
    milestones: string[];
    skills_to_develop?: string[];
}

export interface DecisionMatrix {
    criteria: string[];
    options: string[];
    scores: Record<string, Record<string, number>>;
}

export interface SWOTAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface WebhookResponseData {
    issues?: string[];
    avg_category?: Record<string, number>;
    '5_domains'?: Record<string, number>;
    swot?: SWOTAnalysis;
    decision_matrix?: DecisionMatrix;
    plans?: {
        selected_domains?: string[];
        '1_year'?: CareerPlanTimeframe;
        '3_year'?: CareerPlanTimeframe;
        '5_year'?: CareerPlanTimeframe;
        '10_year'?: CareerPlanTimeframe;
    };
    careerSuggestions?: CareerSuggestion[];
}

