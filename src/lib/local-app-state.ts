import type { CareerSuggestion, GoalPlan, InsightXReportData, MentorMessage, PathXploreData } from '@/lib/types';

export const LOCAL_APP_STATE_KEY = 'path-genix-ui-state-v1';
export const DEMO_USER_ID = 'demo-user-001';

export type LocalCareerReport = {
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
  generatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
  status?: string;
};

export type LocalUserData = {
  uid: string;
  email: string | null;
  username: string;
  phone: string;
  createdAt: string;
  assessment?: Record<string, any>;
  careerDomains?: Array<{
    domainName: string;
    description: string;
    score: number;
    swotAnalysis: string;
    careerPaths: string[];
  }>;
  careerSuggestions?: CareerSuggestion[];
  insightXReport?: InsightXReportData;
  pathXploreData?: PathXploreData;
  goalPlan?: GoalPlan;
  mentorChat?: MentorMessage[];
  careerReport?: LocalCareerReport;
};

export type ParentQuizSubmission = {
  studentId: string;
  answers: Record<string, string>;
  submittedAt: string;
};

type LocalAppState = {
  version: number;
  currentUserId: string | null;
  users: Record<string, LocalUserData>;
  usernames: Record<string, string>;
  parentAnswers: ParentQuizSubmission[];
  sentParentQuizzes: Array<{
    studentId: string;
    email?: string;
    phone?: string;
    sentAt: string;
  }>;
};

export type MockAuthUser = {
  uid: string;
  email: string | null;
  photoURL: string | null;
  displayName: string | null;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function buildDemoUser(): LocalUserData {
  return {
    uid: DEMO_USER_ID,
    email: 'demo@pathgenix.local',
    username: 'demo',
    phone: '0000000000',
    createdAt: nowIso(),
    mentorChat: [],
  };
}

function initialState(): LocalAppState {
  const demoUser = buildDemoUser();
  return {
    version: 1,
    currentUserId: demoUser.uid,
    users: {
      [demoUser.uid]: demoUser,
    },
    usernames: {
      [demoUser.username.toLowerCase()]: demoUser.uid,
    },
    parentAnswers: [],
    sentParentQuizzes: [],
  };
}

let memoryState: LocalAppState | null = null;

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function normalizeState(raw: any): LocalAppState {
  const base = initialState();
  if (!raw || typeof raw !== 'object') return base;

  const users: Record<string, LocalUserData> = raw.users && typeof raw.users === 'object' ? raw.users : {};
  const usernames: Record<string, string> = raw.usernames && typeof raw.usernames === 'object' ? raw.usernames : {};

  const mergedUsers = { ...users };
  if (!mergedUsers[DEMO_USER_ID]) {
    mergedUsers[DEMO_USER_ID] = buildDemoUser();
  }

  const normalizedUsernames = { ...usernames };
  Object.values(mergedUsers).forEach((user) => {
    if (user?.username) {
      normalizedUsernames[user.username.toLowerCase()] = user.uid;
    }
  });

  const currentUserId =
    raw.currentUserId && mergedUsers[raw.currentUserId]
      ? raw.currentUserId
      : raw.currentUserId === null
        ? null
        : DEMO_USER_ID;

  return {
    version: 1,
    currentUserId,
    users: mergedUsers,
    usernames: normalizedUsernames,
    parentAnswers: Array.isArray(raw.parentAnswers) ? raw.parentAnswers : [],
    sentParentQuizzes: Array.isArray(raw.sentParentQuizzes) ? raw.sentParentQuizzes : [],
  };
}

function readStateInternal(): LocalAppState {
  if (!canUseBrowserStorage()) {
    if (!memoryState) memoryState = initialState();
    return clone(memoryState);
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_APP_STATE_KEY);
    if (!raw) {
      const state = initialState();
      window.localStorage.setItem(LOCAL_APP_STATE_KEY, JSON.stringify(state));
      return clone(state);
    }
    const parsed = JSON.parse(raw);
    const normalized = normalizeState(parsed);
    window.localStorage.setItem(LOCAL_APP_STATE_KEY, JSON.stringify(normalized));
    return clone(normalized);
  } catch {
    const fallback = initialState();
    window.localStorage.setItem(LOCAL_APP_STATE_KEY, JSON.stringify(fallback));
    return clone(fallback);
  }
}

function writeStateInternal(state: LocalAppState) {
  const normalized = normalizeState(state);
  if (!canUseBrowserStorage()) {
    memoryState = clone(normalized);
    return;
  }
  window.localStorage.setItem(LOCAL_APP_STATE_KEY, JSON.stringify(normalized));
}

export function getLocalAppState() {
  return readStateInternal();
}

export function setLocalAppState(state: LocalAppState) {
  writeStateInternal(state);
}

export function updateLocalAppState(mutator: (state: LocalAppState) => void) {
  const nextState = readStateInternal();
  mutator(nextState);
  writeStateInternal(nextState);
  return nextState;
}

function toMockAuthUser(user: LocalUserData): MockAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    photoURL: null,
    displayName: user.username,
  };
}

export function getCurrentAuthUser(): MockAuthUser | null {
  const state = getLocalAppState();
  if (!state.currentUserId) return null;
  const user = state.users[state.currentUserId];
  return user ? toMockAuthUser(user) : null;
}

export function loginLocalUser(identifier: string): { success: boolean; user?: MockAuthUser; error?: string } {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) {
    return { success: false, error: 'Username is required.' };
  }

  const state = getLocalAppState();
  let userId: string | undefined = state.usernames[trimmed];
  if (!userId) {
    userId = Object.values(state.users).find((u) => u.email?.toLowerCase() === trimmed)?.uid;
  }

  if (!userId) {
    return { success: false, error: 'No account found for this username.' };
  }

  const user = state.users[userId];
  if (!user) {
    return { success: false, error: 'User data is unavailable.' };
  }

  state.currentUserId = user.uid;
  setLocalAppState(state);

  return { success: true, user: toMockAuthUser(user) };
}

export function signupLocalUser(input: {
  authEmail: string;
  username: string;
  phone: string;
  email: string | null;
}): { success: boolean; user?: MockAuthUser; error?: string } {
  const username = input.username.trim();
  if (!username) {
    return { success: false, error: 'Username is required.' };
  }

  const normalizedUsername = username.toLowerCase();
  const state = getLocalAppState();
  if (state.usernames[normalizedUsername]) {
    return { success: false, error: 'Username is already taken. Please choose a different one.' };
  }

  const uid = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const user: LocalUserData = {
    uid,
    email: input.email || input.authEmail || `${normalizedUsername}@path-genix.user`,
    username,
    phone: input.phone,
    createdAt: nowIso(),
    mentorChat: [],
  };

  state.users[uid] = user;
  state.usernames[normalizedUsername] = uid;
  state.currentUserId = uid;
  setLocalAppState(state);

  return { success: true, user: toMockAuthUser(user) };
}

export function logoutLocalUser() {
  updateLocalAppState((state) => {
    state.currentUserId = null;
  });
}

export function getUserRecord(userId: string): LocalUserData | null {
  if (!userId) return null;
  const state = getLocalAppState();
  return state.users[userId] ? clone(state.users[userId]) : null;
}

export function upsertUserRecord(userId: string, update: (record: LocalUserData) => LocalUserData) {
  updateLocalAppState((state) => {
    const existing = state.users[userId] || {
      uid: userId,
      email: `${userId}@path-genix.user`,
      username: userId,
      phone: '',
      createdAt: nowIso(),
      mentorChat: [],
    };
    const next = update(clone(existing));
    state.users[userId] = next;
    if (next.username) {
      state.usernames[next.username.toLowerCase()] = next.uid;
    }
  });
}

export function saveParentQuizSubmission(submission: ParentQuizSubmission) {
  updateLocalAppState((state) => {
    state.parentAnswers.push(submission);
  });
}

export function recordParentQuizSent(data: { studentId: string; email?: string; phone?: string }) {
  updateLocalAppState((state) => {
    state.sentParentQuizzes.push({
      ...data,
      sentAt: nowIso(),
    });
  });
}
