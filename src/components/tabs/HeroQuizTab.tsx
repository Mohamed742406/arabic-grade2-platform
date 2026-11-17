import React, { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, Star, Trophy, ArrowLeft, XCircle } from 'lucide-react';
import { LessonData, RobotMood } from '../../types/curriculum';
import { RobotCompanion } from '../RobotCompanion';
import { playFanfareSound, playSuccessSound, playTryAgainSound } from '../../utils/soundAndSpeech';

interface HeroQuizTabProps {
  lesson: LessonData;
  studentName: string;
  soundEnabled: boolean;
  bestScore: number;
  hasBadge: boolean;
  onQuizComplete: (score: number, total: number, badgeId: string) => void;
  onGoNextLesson?: () => void;
}

export const HeroQuizTab: React.FC<HeroQuizTabProps> = ({
  lesson,
  studentName,
  soundEnabled,
  bestScore,
  hasBadge,
  onQuizComplete,
  onGoNextLesson,
}) => {
  const [qIdx, setQIdx] = useState(0);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = lesson.quiz;
  const currentQ = questions[qIdx];
  const answered = selectedOptIdx !== null;
  const isCorrect = selectedOptIdx === currentQ.correctIndex;

  let robotMood: RobotMood = 'happy';
  let robotMessage = `جاهزة يا ${studentName} لتحدي الأبطال؟ عندنا ٥ أسئلة سهلة وجميلة، وكل إجابة صح بنجمة!`;

  if (finished) {
    robotMood = 'cheering';
    robotMessage =
      score >= 4
        ? `مبروك يا بطلة الأبطال! جبتي ${score} من ${questions.length} واستحقتي وسام الدرس بجدارة!`
        : `عاش يا ${studentName}! جبتي ${score} من ${questions.length}. تقدري تعيدي التحدي وتجيبي الدرجة النهائية!`;
  } else if (answered) {
    robotMood = isCorrect ? 'cheering' : 'encouraging';
    robotMessage = isCorrect
      ? `${currentQ.explanation} برافو عليكي يا ${studentName}!`
      : `ولا يهمك يا جميلة! ${currentQ.explanation}`;
  }

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOptIdx(idx);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
      playSuccessSound(soundEnabled);
    } else {
      playTryAgainSound(soundEnabled);
    }
  };

  const handleNext = () => {
    if (qIdx + 1 < questions.length) {
      setQIdx(qIdx + 1);
      setSelectedOptIdx(null);
    } else {
      setFinished(true);
      playFanfareSound(soundEnabled);
      onQuizComplete(score, questions.length, lesson.badge.id);
    }
  };

  const handleRetry = () => {
    setQIdx(0);
    setSelectedOptIdx(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="space-y-6">
        <RobotCompanion mood={robotMood} message={robotMessage} />

        <div className="animate-pop-in bg-white border-2 border-amber-300 rounded-3xl p-8 text-center shadow-sm space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center">
            <Trophy className="w-11 h-11 text-amber-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              نتيجة تحدي الأبطال
            </h3>
            <p className="text-lg font-bold text-slate-600">
              أحسنتِ يا {studentName}! أجبتِ عن{' '}
              <span className="text-sky-700 tabular-nums">
                {score} من {questions.length}
              </span>{' '}
              أسئلة بشكل صحيح.
            </p>
          </div>

          {/* Stars Row */}
          <div className="flex items-center justify-center gap-2">
            {questions.map((_, i) => (
              <Star
                key={i}
                className={`w-10 h-10 transition-transform ${
                  i < score
                    ? 'text-amber-400 fill-amber-400 scale-110'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>

          {/* Badge Earned Card */}
          {(score >= 3 || hasBadge) && (
            <div className="max-w-md mx-auto bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4 text-right">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-emerald-700">تم فتح وسام الدرس</div>
                <div className="text-lg font-extrabold text-slate-900">{lesson.badge.title}</div>
                <div className="text-xs font-semibold text-slate-600">
                  {lesson.badge.description}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة التحدي</span>
            </button>

            {onGoNextLesson && (
              <button
                type="button"
                onClick={onGoNextLesson}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold transition-colors cursor-pointer shadow-sm"
              >
                <span>الانتقال للدرس التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RobotCompanion mood={robotMood} message={robotMessage} />

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Progress Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-extrabold text-sky-800 tabular-nums">
            السؤال {qIdx + 1} من {questions.length}
          </div>
          <div className="flex items-center gap-2">
            {questions.map((q, idx) => (
              <span
                key={q.id}
                className={`h-3 w-8 rounded-full transition-colors ${
                  idx < qIdx
                    ? 'bg-emerald-500'
                    : idx === qIdx
                    ? 'bg-sky-600'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          {bestScore > 0 && (
            <div className="text-xs font-bold text-amber-700 tabular-nums">
              أعلى نتيجة سابقة: {bestScore}/{questions.length}
            </div>
          )}
        </div>

        {/* Question */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6">
          <h3 className="font-reading text-xl sm:text-2xl font-extrabold text-slate-900">
            {currentQ.question}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOptIdx === idx;
            const isRightOption = idx === currentQ.correctIndex;

            let style =
              'bg-white border-slate-200 text-slate-900 hover:border-sky-400 hover:bg-sky-50';
            if (answered) {
              if (isRightOption) {
                style = 'bg-emerald-50 border-emerald-500 text-emerald-950';
              } else if (isSelected && !isRightOption) {
                style = 'bg-rose-50 border-rose-400 text-rose-950';
              } else {
                style = 'bg-slate-50 border-slate-200 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-right flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border-2 font-reading text-lg sm:text-xl font-bold transition-all cursor-pointer disabled:cursor-default ${style}`}
              >
                <span>{option}</span>
                {answered && isRightOption && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                {answered && isSelected && !isRightOption && (
                  <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next */}
        {answered && (
          <div
            className={`animate-pop-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl p-4 border ${
              isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="text-base font-bold">{currentQ.explanation}</div>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm transition-colors cursor-pointer shrink-0"
            >
              <span>{qIdx + 1 < questions.length ? 'السؤال التالي' : 'عرض النتيجة والوسام'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
