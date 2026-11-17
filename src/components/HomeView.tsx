import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Edit3,
  Lock,
  Play,
  Star,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { LessonData, StudentProgress, UnitOverview } from '../types/curriculum';
import { RobotCompanion } from './RobotCompanion';

interface HomeViewProps {
  units: UnitOverview[];
  unit1Lessons: LessonData[];
  unit2Lessons: LessonData[];
  unit3Lessons: LessonData[];
  progress: StudentProgress;
  onSelectLesson: (lessonId: string) => void;
  onUpdateStudentName: (name: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  units,
  unit1Lessons,
  unit2Lessons,
  unit3Lessons,
  progress,
  onSelectLesson,
  onUpdateStudentName,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(progress.studentName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameDraft.trim() || 'البطلة الصغيرة';
    onUpdateStudentName(cleaned);
    setNameDraft(cleaned);
    setEditingName(false);
  };

  const allUnlockedLessons = [...unit1Lessons, ...unit2Lessons, ...unit3Lessons];
  const completedCount = allUnlockedLessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const unit1Completed = unit1Lessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const unit2Completed = unit2Lessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const unit3Completed = unit3Lessons.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;

  const badgeColors: Record<string, string> = {
    rose: 'bg-rose-50 border-rose-200 text-rose-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    sky: 'bg-sky-50 border-sky-200 text-sky-800',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };

  const renderLessonCard = (lesson: LessonData) => {
    const isDone = progress.completedLessons.includes(lesson.id);
    const quizScore = progress.quizScores[lesson.id];

    return (
      <div
        key={lesson.id}
        onClick={() => onSelectLesson(lesson.id)}
        className="group bg-amber-50/40 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-3xl p-5 sm:p-6 transition-all cursor-pointer flex flex-col justify-between gap-4"
      >
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-sky-700">الدرس {lesson.order}</span>
              <span aria-hidden="true">·</span>
              <span>{lesson.typeLabel}</span>
            </div>
            {isDone && (
              <span className="inline-flex items-center gap-1 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>مكتمل</span>
              </span>
            )}
          </div>

          <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
            {lesson.title}
          </h4>

          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
            {lesson.shortSummary}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200/70">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 group-hover:bg-sky-700 text-white font-extrabold text-sm transition-colors">
            <Play className="w-4 h-4 fill-current" />
            <span>{isDone ? 'مراجعة ولعب' : 'ابدئي الدرس'}</span>
          </span>

          {quizScore !== undefined ? (
            <div className="flex items-center gap-1 text-amber-700 text-sm font-extrabold tabular-nums">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{quizScore}/5</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>٤ أنشطة ممتعة</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Greeting Section */}
      <section className="bg-white border border-sky-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="text-sm font-extrabold text-sky-700">
              الصف الثاني الابتدائي · الفصل الدراسي الأول
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              أهلاً بيكي يا{' '}
              <span className="text-sky-600">{progress.studentName}</span> في عالم العربي الممتع!
            </h1>
            <p className="text-slate-600 text-lg font-medium">
              مع صديقك الروبوت «روبي» هتسمعي حواديت جميلة، وتلعبي ألعاب القواعد والمقاطع الصوتية، وتجمعي النجوم والأوسمة في كل وحدات المنهج!
            </p>
          </div>

          {/* Name Editor */}
          <div className="shrink-0">
            {editingName ? (
              <form onSubmit={handleSaveName} className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  maxLength={20}
                  placeholder="اكتبي اسمك هنا"
                  className="px-4 py-2.5 rounded-xl border-2 border-sky-300 bg-white text-slate-900 font-bold text-base focus:outline-none focus:border-sky-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm cursor-pointer"
                >
                  حفظ
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-sm transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>تغيير اسم البطلة</span>
              </button>
            )}
          </div>
        </div>

        <RobotCompanion
          mood="cheering"
          message={`أهلاً يا ${progress.studentName}! كل وحدات الكتاب الثلاث مفتوحة دلوقتي وجاهزة ليكي: المعاملة الطيبة، وعادات صحية، والرياضة والتكنولوجيا! اختاري الدرس اللي تحبيه ويلا نلعب سوا!`}
        />
      </section>

      {/* Achievement Board */}
      <section id="achievements-board" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            لوحة إنجازات {progress.studentName}
          </h2>
          <span className="text-sm font-bold text-slate-500">
            اجمعي الـ ١٢ وساماً لتكوني بطلة اللغة العربية!
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-amber-200 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-8 h-8 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500">النجوم الذهبية</div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {progress.stars}
              </div>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500">الدروس المكتملة</div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {completedCount} / {allUnlockedLessons.length}
              </div>
            </div>
          </div>

          <div className="bg-white border border-sky-200 rounded-3xl p-5 flex items-center gap-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-500">الأوسمة المفتوحة</div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {progress.earnedBadges.length} / {allUnlockedLessons.length}
              </div>
            </div>
          </div>
        </div>

        {/* Medals Shelf */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>خزانة أوسمة المنهج الكامل (١٢ وساماً)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {allUnlockedLessons.map((lesson) => {
              const unlocked = progress.earnedBadges.includes(lesson.badge.id);
              return (
                <div
                  key={lesson.badge.id}
                  className={`rounded-2xl border p-4 flex items-center gap-3 transition-all ${
                    unlocked
                      ? badgeColors[lesson.badge.color]
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      unlocked ? 'bg-white shadow-xs' : 'bg-slate-200/70'
                    }`}
                  >
                    {unlocked ? (
                      <Award className="w-6 h-6 text-amber-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold truncate">{lesson.badge.title}</div>
                    <div className="text-xs font-semibold opacity-80 truncate">
                      {unlocked ? 'مبروك! حصلتِ عليه' : `أكملي تحدي «${lesson.title}»`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Units Section */}
      <section id="units-section" className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            وحدات منهج اللغة العربية
          </h2>
          <p className="text-slate-600 font-medium">
            اختاري أي درس من الوحدات الثلاث وابدئي القراءة واللعب والتحدي!
          </p>
        </div>

        {/* Unit 1 */}
        <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-rose-100">
            <div>
              <div className="text-sm font-extrabold text-rose-600 mb-1">
                {units[0].numberLabel} · مفعّلة وجاهزة للتعلم
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {units[0].title}
              </h3>
              <p className="text-slate-600 font-medium mt-1">{units[0].subtitle}</p>
            </div>
            <div className="text-sm font-extrabold text-emerald-700 shrink-0 tabular-nums">
              الإنجاز: {unit1Completed} من {unit1Lessons.length} دروس
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {unit1Lessons.map(renderLessonCard)}
          </div>
        </div>

        {/* Unit 2 */}
        <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
            <div>
              <div className="text-sm font-extrabold text-emerald-600 mb-1">
                {units[1].numberLabel} · مفعّلة وجاهزة للتعلم
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {units[1].title}
              </h3>
              <p className="text-slate-600 font-medium mt-1">{units[1].subtitle}</p>
            </div>
            <div className="text-sm font-extrabold text-emerald-700 shrink-0 tabular-nums">
              الإنجاز: {unit2Completed} من {unit2Lessons.length} دروس
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {unit2Lessons.map(renderLessonCard)}
          </div>
        </div>

        {/* Unit 3 */}
        <div className="bg-white border-2 border-sky-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-100">
            <div>
              <div className="text-sm font-extrabold text-sky-600 mb-1">
                {units[2].numberLabel} · مفعّلة وجاهزة للتعلم
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {units[2].title}
              </h3>
              <p className="text-slate-600 font-medium mt-1">{units[2].subtitle}</p>
            </div>
            <div className="text-sm font-extrabold text-emerald-700 shrink-0 tabular-nums">
              الإنجاز: {unit3Completed} من {unit3Lessons.length} دروس
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {unit3Lessons.map(renderLessonCard)}
          </div>
        </div>
      </section>
    </div>
  );
};
