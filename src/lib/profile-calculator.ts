import type { PersonalityProfile, InterestProfile, CognitiveProfile, InsightXReportData } from '@/lib/types';

/**
 * Calculate Big Five personality scores from personality assessment responses
 */
export function calculatePersonalityProfile(responses: Record<string, string>): PersonalityProfile {
    // Big Five mapping based on question IDs
    const traitMappings = {
        openness: ['p3', 'p7', 'p11', 'p17'], // Questions about creativity, new ideas, imagination
        conscientiousness: ['p2', 'p6', 'p8', 'p14', 'p18'], // Questions about organization, reliability, standards
        extraversion: ['p1', 'p12', 'p15'], // Questions about social interaction, leadership
        agreeableness: ['p5', 'p9', 'p13'], // Questions about kindness, empathy, trust
        neuroticism: ['p4', 'p10', 'p16', 'p19'], // Questions about anxiety, stress (note: reversed for display)
    };

    const calculateTraitScore = (questionIds: string[]): number => {
        const scores = questionIds.map(id => parseInt(responses[id] || '3'));
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        // Convert 1-5 scale to 0-100 percentage
        return Math.round(((average - 1) / 4) * 100);
    };

    return {
        openness: calculateTraitScore(traitMappings.openness),
        conscientiousness: calculateTraitScore(traitMappings.conscientiousness),
        extraversion: calculateTraitScore(traitMappings.extraversion),
        agreeableness: calculateTraitScore(traitMappings.agreeableness),
        neuroticism: calculateTraitScore(traitMappings.neuroticism),
    };
}

/**
 * Calculate Holland Codes (RIASEC) from interest assessment responses
 */
export function calculateInterestProfile(responses: Record<string, string>): InterestProfile {
    // RIASEC mapping based on question IDs
    const interestMappings = {
        realistic: ['i3', 'i9', 'i15', 'i19'], // Building, fixing, hands-on
        investigative: ['i5', 'i11', 'i17', 'i20'], // Research, analysis, problems
        artistic: ['i1', 'i6', 'i12', 'i18'], // Creative, expression, design
        social: ['i2', 'i8', 'i14'], // Helping, teaching, nurturing
        enterprising: ['i4', 'i10', 'i16'], // Leading, organizing, persuading
        conventional: ['i7', 'i13'], // Organization, data, structure
    };

    const calculateInterestScore = (questionIds: string[]): number => {
        const scores = questionIds.map(id => parseInt(responses[id] || '3'));
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        // Convert 1-5 scale to 0-100 percentage
        return Math.round(((average - 1) / 4) * 100);
    };

    return {
        realistic: calculateInterestScore(interestMappings.realistic),
        investigative: calculateInterestScore(interestMappings.investigative),
        artistic: calculateInterestScore(interestMappings.artistic),
        social: calculateInterestScore(interestMappings.social),
        enterprising: calculateInterestScore(interestMappings.enterprising),
        conventional: calculateInterestScore(interestMappings.conventional),
    };
}

/**
 * Calculate cognitive ability scores from cognitive test responses
 */
export function calculateCognitiveProfile(responses: Record<string, string>): CognitiveProfile {
    // Answer key for cognitive questions (simplified - in real app, use actual correct answers)
    const answerKey: Record<string, string> = {
        c1: 'Carrot', c2: '32', c3: 'Swimming', c4: 'Heptagon', c5: '30 km',
        c6: '15', c7: 'Desk', c8: 'True', c9: 'IJ', c10: 'Color',
        c11: '4 cups', c12: 'Fearful', c13: '4 cakes', c14: 'R', c15: '10',
        c16: 'Yes', c17: 'Sleepy', c18: '5', c19: 'EV', c20: '20',
    };

    const logicalReasoningQuestions = ['c1', 'c4', 'c8', 'c9', 'c16', 'c19'];
    const verbalQuestions = ['c3', 'c7', 'c10', 'c12', 'c17'];
    const problemSolvingQuestions = ['c2', 'c5', 'c6', 'c11', 'c13', 'c14'];
    const numericalQuestions = ['c2', 'c5', 'c11', 'c13', 'c18', 'c20'];

    const calculateScore = (questionIds: string[]): number => {
        const correct = questionIds.filter(id => responses[id] === answerKey[id]).length;
        return Math.round((correct / questionIds.length) * 100);
    };

    return {
        logicalReasoning: calculateScore(logicalReasoningQuestions),
        verbalAbility: calculateScore(verbalQuestions),
        problemSolving: calculateScore(problemSolvingQuestions),
        numericalAptitude: calculateScore(numericalQuestions),
    };
}

/**
 * Calculate overall PIC Index™ score
 * This is a weighted combination of personality alignment, interest clarity, and cognitive strength
 */
export function calculatePICIndex(
    personality: PersonalityProfile,
    interest: InterestProfile,
    cognitive: CognitiveProfile
): number {
    // Personality alignment score (higher scores in key traits)
    const personalityScore = (
        personality.openness * 0.3 +
        personality.conscientiousness * 0.3 +
        personality.extraversion * 0.2 +
        personality.agreeableness * 0.1 +
        (100 - personality.neuroticism) * 0.1
    );

    // Interest clarity score (high scores in at least one area indicate clear interests)
    const interestValues = Object.values(interest);
    const maxInterest = Math.max(...interestValues);
    const avgInterest = interestValues.reduce((sum, val) => sum + val, 0) / interestValues.length;
    const interestScore = (maxInterest * 0.6) + (avgInterest * 0.4);

    // Cognitive strength score (average of all abilities)
    const cognitiveScore = (
        cognitive.logicalReasoning +
        cognitive.verbalAbility +
        cognitive.problemSolving +
        cognitive.numericalAptitude
    ) / 4;

    // Weighted PIC Index (40% personality, 30% interest, 30% cognitive)
    const picIndex = (personalityScore * 0.4) + (interestScore * 0.3) + (cognitiveScore * 0.3);

    return Math.round(picIndex);
}

/**
 * Generate complete InsightX Report data from assessment responses
 */
export function generateInsightXReport(assessmentData: {
    personality: Record<string, string>;
    interest: Record<string, string>;
    cognitiveAbilities: Record<string, string>;
}): InsightXReportData {
    const personalityProfile = calculatePersonalityProfile(assessmentData.personality);
    const interestProfile = calculateInterestProfile(assessmentData.interest);
    const cognitiveProfile = calculateCognitiveProfile(assessmentData.cognitiveAbilities);
    const picIndex = calculatePICIndex(personalityProfile, interestProfile, cognitiveProfile);

    return {
        personalityProfile,
        interestProfile,
        cognitiveProfile,
        picIndex,
        generatedAt: new Date().toISOString(),
    };
}
