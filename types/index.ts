// User types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
  admin?: boolean; // Admin flag for accessing lesson management
}

// User Progress types
export interface UserProgress {
  userId: string;
  currentLessonId: string;
  completedLessonIds: string[];
  xp: number;
  streak: number;
  lastActivityDate: Date;
  lessonProgress: { [lessonId: string]: LessonProgress };
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  completedAt?: Date;
  stars: number; // 0-3 stars based on performance
}

// Lesson types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  unitId: string;
  xpReward: number;
  questions: Question[];
  requiredPreviousLessons: string[]; // IDs of lessons that must be completed first
  isLocked: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  order: number;
  color: string; // For visual distinction
  lessons: Lesson[];
}

// Question types
export type QuestionType = 
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'match-pairs'
  | 'translate'
  | 'speak'
  | 'listen'
  | 'explanation'; // New type for teaching/explanation screens

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  questionAudio?: string; // URL to audio file
  questionImage?: string; // URL to image
  questionTransliteration?: Record<string, string>; // Map of Kannada words to their transliterations in the question
  correctAnswer?: string | string[]; // Optional for explanation type
  correctAnswerTransliteration?: string; // English pronunciation for fill-blank
  options?: string[]; // For multiple choice and true-false
  optionsTransliteration?: string[]; // English pronunciation for options
  pairs?: { kannada: string; english: string }[]; // For match pairs
  hint?: string;
  explanation?: string;
  xp: number;
  // For explanation type questions
  words?: { kannada: string; english: string; transliteration?: string }[]; // Vocabulary to teach
  content?: string; // Main explanation content
}

// Answer submission
export interface Answer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface LessonResult {
  lessonId: string;
  userId: string;
  answers: Answer[];
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  stars: number;
  completedAt: Date;
  timeSpent: number;
}

// Navigation types
export type RootStackParamList = {
  '(auth)': undefined;
  '(tabs)': undefined;
};

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  'forgot-password': undefined;
};

export type TabsParamList = {
  learn: undefined;
  profile: undefined;
  practice: undefined;
};
