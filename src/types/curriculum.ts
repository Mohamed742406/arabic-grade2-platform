export type RobotMood = 'happy' | 'cheering' | 'thinking' | 'speaking' | 'encouraging';

export interface VocabItem {
  word: string;
  plainWord: string;
  meaningLabel: string;
  meaningValue: string;
  extraLabel?: string;
  extraValue?: string;
  egyptianHint: string;
  colorClass: string;
}

export interface LessonLine {
  id: string;
  text: string;
  isPoetry?: boolean;
  poetryHemistichs?: [string, string];
  highlightWords: string[];
}

export interface SyllableWord {
  id: string;
  word: string;
  syllables: string[];
  hint: string;
  hasShadda?: boolean;
}

export interface SortItem {
  id: string;
  text: string;
  categoryId: string;
  hint: string;
}

export interface SortCategory {
  id: string;
  title: string;
  subtitle: string;
  color: 'sky' | 'amber' | 'emerald' | 'rose';
}

export interface ChoicePrompt {
  id: string;
  prompt: string;
  options: string[];
  correctOption: string;
  egyptianFeedback: string;
}

export interface SequenceItem {
  id: string;
  text: string;
  correctOrder: number;
  emoji: string;
}

export type GameBlock =
  | {
      id: string;
      type: 'syllables';
      title: string;
      robotIntro: string;
      items: SyllableWord[];
    }
  | {
      id: string;
      type: 'classify';
      title: string;
      robotIntro: string;
      categories: SortCategory[];
      items: SortItem[];
    }
  | {
      id: string;
      type: 'choice';
      title: string;
      robotIntro: string;
      ruleTip?: string;
      items: ChoicePrompt[];
    }
  | {
      id: string;
      type: 'sequence';
      title: string;
      robotIntro: string;
      items: SequenceItem[];
    };

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  color: 'amber' | 'rose' | 'sky' | 'emerald';
}

export interface LessonData {
  id: string;
  unitId: string;
  order: number;
  title: string;
  typeLabel: 'استماع' | 'قراءة' | 'نشيد';
  shortSummary: string;
  robotGreeting: string;
  lines: LessonLine[];
  vocabulary: VocabItem[];
  egyptianStory: string[];
  lessonsLearned: string[];
  grammarSummaryTitle: string;
  grammarSummaryPoints: string[];
  games: GameBlock[];
  quiz: QuizQuestion[];
  badge: BadgeInfo;
}

export interface UnitOverview {
  id: string;
  numberLabel: string;
  title: string;
  subtitle: string;
  themeColor: 'rose' | 'emerald' | 'sky';
  isUnlocked: boolean;
  lessonPreviews: {
    id: string;
    order: number;
    title: string;
    typeLabel: 'استماع' | 'قراءة' | 'نشيد';
    grammarTopic: string;
  }[];
}

export interface StudentProgress {
  studentName: string;
  stars: number;
  completedLessons: string[];
  completedGames: string[];
  quizScores: Record<string, number>;
  earnedBadges: string[];
  soundEnabled: boolean;
}
