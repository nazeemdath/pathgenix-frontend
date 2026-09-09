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

export type CognitiveProfile = Record<string, number>;

export type PICCComponent = {
    value: number;
    weight: number;
};

export type InsightXReportData = {
    personalityProfile: PersonalityProfile;
    interestProfile: InterestProfile;
    cognitiveProfile: CognitiveProfile;
    skillProfile: Record<string, number>;
    cvqProfile: Record<string, number>;
    piccComponents: Record<string, PICCComponent>;
    picIndex: number;
    scoringVersion: string;
    generatedAt: string;
};

// PathXplore Career Intelligence types
export type PathXploreClusterSubitem = {
    name: string;
    pct: number;
};

export type PathXploreCluster = {
    name: string;
    overall_pct: number;
    alignment: string;
    subitems: PathXploreClusterSubitem[];
};

export type PathXploreTopChoice = {
    title: string;
    cluster: string;
};

export type PathXploreSWOT = {
    strengths: string[];
    growth_areas: string[];
    opportunities: string[];
    risks: string[];
};

export type PathXploreData = {
    swot: PathXploreSWOT;
    domains: string[];
    clusters: PathXploreCluster[];
    top_choices: PathXploreTopChoice[];
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
