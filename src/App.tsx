import { useEffect, useState } from 'react';
import { UNIT_1_LESSONS, UNITS_OVERVIEW } from './data/unit1Data';
import { UNIT_2_LESSONS } from './data/unit2Data';
import { UNIT_3_LESSONS } from './data/unit3Data';
import { StudentProgress } from './types/curriculum';
import { TopBar } from './components/TopBar';
import { HomeView } from './components/HomeView';
import { LessonView } from './components/LessonView';
import { StarCelebration } from './components/StarCelebration';

const STORAGE_KEY = 'arabic_hero_grade2_progress_v1';
const ALL_LESSONS = [...UNIT_1_LESSONS, ...UNIT_2_LESSONS, ...UNIT_3_LESSONS];

const DEFAULT_PROGRESS: StudentProgress = {
  studentName: 'البطلة الصغيرة',
  stars: 0,
  completedLessons: [],
  completedGames: [],
  quizScores: {},
  earnedBadges: [],
  soundEnabled: true,
};

function loadProgress(): StudentProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(loadProgress);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<{
    visible: boolean;
    message: string;
    starsEarned: number;
  }>({
    visible: false,
    message: '',
    starsEarned: 1,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const activeLesson = ALL_LESSONS.find((l) => l.id === activeLessonId) || null;
  const activeLessonIndex = activeLesson
    ? ALL_LESSONS.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const hasNextLesson =
    activeLessonIndex >= 0 && activeLessonIndex + 1 < ALL_LESSONS.length;

  const handleToggleSound = () => {
    setProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleUpdateStudentName = (name: string) => {
    setProgress((prev) => ({ ...prev, studentName: name }));
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackHome = () => {
    setActiveLessonId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGameComplete = (gameId: string, starsEarned: number, message: string) => {
    setProgress((prev) => {
      const alreadyDone = prev.completedGames.includes(gameId);
      return {
        ...prev,
        stars: prev.stars + (alreadyDone ? 0 : starsEarned),
        completedGames: alreadyDone ? prev.completedGames : [...prev.completedGames, gameId],
      };
    });

    setCelebration({
      visible: true,
      message,
      starsEarned: starsEarned > 0 ? starsEarned : 1,
    });
  };

  const handleQuizComplete = (lessonId: string, score: number, _total: number, badgeId: string) => {
    let newlyEarnedStars = 0;

    setProgress((prev) => {
      const previousBest = prev.quizScores[lessonId] || 0;
      const bestScore = Math.max(previousBest, score);
      newlyEarnedStars = Math.max(0, score - previousBest);

      const completedLessons =
        score >= 3 && !prev.completedLessons.includes(lessonId)
          ? [...prev.completedLessons, lessonId]
          : prev.completedLessons;

      const earnedBadges =
        score >= 3 && !prev.earnedBadges.includes(badgeId)
          ? [...prev.earnedBadges, badgeId]
          : prev.earnedBadges;

      return {
        ...prev,
        stars: prev.stars + newlyEarnedStars,
        quizScores: {
          ...prev.quizScores,
          [lessonId]: bestScore,
        },
        completedLessons,
        earnedBadges,
      };
    });

    if (score >= 3) {
      setCelebration({
        visible: true,
        message: `برافو يا ${progress.studentName}! فزتِ في تحدي الأبطال!`,
        starsEarned: newlyEarnedStars > 0 ? newlyEarnedStars : score,
      });
    }
  };

  const handleGoNextLesson = () => {
    if (hasNextLesson) {
      handleSelectLesson(ALL_LESSONS[activeLessonIndex + 1].id);
    } else {
      handleBackHome();
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900">
      <TopBar
        stars={progress.stars}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onNavigateHome={handleBackHome}
        onScrollToSection={handleScrollToSection}
        isInsideLesson={Boolean(activeLesson)}
      />

      <main className="flex-1">
        {activeLesson ? (
          <LessonView
            key={activeLesson.id}
            lesson={activeLesson}
            progress={progress}
            onBackHome={handleBackHome}
            onGameComplete={handleGameComplete}
            onQuizComplete={handleQuizComplete}
            onGoNextLesson={hasNextLesson ? handleGoNextLesson : undefined}
          />
        ) : (
          <HomeView
            units={UNITS_OVERVIEW}
            unit1Lessons={UNIT_1_LESSONS}
            unit2Lessons={UNIT_2_LESSONS}
            unit3Lessons={UNIT_3_LESSONS}
            progress={progress}
            onSelectLesson={handleSelectLesson}
            onUpdateStudentName={handleUpdateStudentName}
          />
        )}
      </main>

      <footer className="border-t border-amber-200/70 bg-white/70 py-5 text-center text-sm font-bold text-slate-500">
        منصة بطلة اللغة العربية · الصف الثاني الابتدائي (الفصل الدراسي الأول)
      </footer>

      <StarCelebration
        visible={celebration.visible}
        message={celebration.message}
        starsEarned={celebration.starsEarned}
        onDone={() => setCelebration((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
