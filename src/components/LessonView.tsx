import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  MessageCircleHeart,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { LessonData, StudentProgress } from '../types/curriculum';
import { ReadListenTab } from './tabs/ReadListenTab';
import { EgyptianExplainTab } from './tabs/EgyptianExplainTab';
import { GrammarGamesTab } from './tabs/GrammarGamesTab';
import { HeroQuizTab } from './tabs/HeroQuizTab';

type LessonTabId = 'read' | 'explain' | 'games' | 'quiz';

interface LessonViewProps {
  lesson: LessonData;
  progress: StudentProgress;
  onBackHome: () => void;
  onGameComplete: (gameId: string, starsEarned: number, message: string) => void;
  onQuizComplete: (lessonId: string, score: number, total: number, badgeId: string) => void;
  onGoNextLesson?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  progress,
  onBackHome,
  onGameComplete,
  onQuizComplete,
  onGoNextLesson,
}) => {
  const [activeTab, setActiveTab] = useState<LessonTabId>('read');

  const tabs: { id: LessonTabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'read',
      label: lesson.typeLabel === 'نشيد' ? 'اقرأ واسمع النشيد' : 'اقرأ واسمع الحدوتة',
      icon: <BookOpen className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'explain',
      label: 'الشرح بالعامية المصرية',
      icon: <MessageCircleHeart className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'games',
      label: 'العب وتعلم القواعد',
      icon: <Gamepad2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'quiz',
      label: 'تحدي الأبطال',
      icon: <Trophy className="w-4 h-4 shrink-0" />,
    },
  ];

  const isCompleted = progress.completedLessons.includes(lesson.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb & Lesson Title Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحدات</span>
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500">
            <span>
              {lesson.unitId === 'unit-1'
                ? 'الوحدة الأولى: المعاملة الطيبة'
                : lesson.unitId === 'unit-2'
                ? 'الوحدة الثانية: عادات صحية'
                : 'الوحدة الثالثة: الرياضة والتكنولوجيا'}
            </span>
            <span aria-hidden="true">·</span>
            <span>الدرس {lesson.order}</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-700">{lesson.typeLabel}</span>
            {isCompleted && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مكتمل</span>
                </span>
              </>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          {lesson.title}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg font-medium max-w-3xl">
          {lesson.shortSummary}
        </p>

        {/* 4 Interactive Tabs */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'read' && (
          <ReadListenTab lesson={lesson} studentName={progress.studentName} />
        )}
        {activeTab === 'explain' && (
          <EgyptianExplainTab lesson={lesson} studentName={progress.studentName} />
        )}
        {activeTab === 'games' && (
          <GrammarGamesTab
            lesson={lesson}
            studentName={progress.studentName}
            soundEnabled={progress.soundEnabled}
            completedGames={progress.completedGames}
            onGameComplete={onGameComplete}
          />
        )}
        {activeTab === 'quiz' && (
          <HeroQuizTab
            lesson={lesson}
            studentName={progress.studentName}
            soundEnabled={progress.soundEnabled}
            bestScore={progress.quizScores[lesson.id] || 0}
            hasBadge={progress.earnedBadges.includes(lesson.badge.id)}
            onQuizComplete={(score, total, badgeId) =>
              onQuizComplete(lesson.id, score, total, badgeId)
            }
            onGoNextLesson={onGoNextLesson}
          />
        )}
      </div>
    </div>
  );
};
