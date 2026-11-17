import React, { useState } from 'react';
import { Heart, Lightbulb, Volume2, CheckCircle2 } from 'lucide-react';
import { LessonData } from '../../types/curriculum';
import { RobotCompanion } from '../RobotCompanion';
import { speakSinglePhrase } from '../../utils/soundAndSpeech';

interface EgyptianExplainTabProps {
  lesson: LessonData;
  studentName: string;
}

export const EgyptianExplainTab: React.FC<EgyptianExplainTabProps> = ({ lesson, studentName }) => {
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (word: string) => {
    setRevealedCards((prev) => ({ ...prev, [word]: !prev[word] }));
    speakSinglePhrase(word);
  };

  return (
    <div className="space-y-6">
      <RobotCompanion
        mood="happy"
        title="روبي بيحكيلك الحدوتة بالعامية المصرية"
        message={`تعالي يا ${studentName} نقعد سوا وأحكيلك حكاية درس «${lesson.title}» بالعامية المصرية البسيطة، وبعدها نشوف معاني الكلمات الجديدة وإيه اللي اتعلمناه!`}
      />

      {/* Egyptian Arabic Storytelling Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            الحدوتة بالعامية المصرية
          </h3>
          <button
            type="button"
            onClick={() => speakSinglePhrase(lesson.egyptianStory.join(' '))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-sm transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>اسمع الشرح</span>
          </button>
        </div>

        <div className="space-y-4">
          {lesson.egyptianStory.map((paragraph, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 sm:p-5"
            >
              <span className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                {idx + 1}
              </span>
              <p className="text-slate-800 text-lg leading-relaxed font-medium">{paragraph}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Vocabulary Flashcards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-5">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1">
            قاموس الكلمات الجديدة
          </h3>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            اضغطي على أي بطاقة عشان تسمعي الكلمة وتشوفي معناها بالعامية المصرية!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lesson.vocabulary.map((item) => {
            const isOpen = Boolean(revealedCards[item.word]);
            return (
              <button
                key={item.word}
                type="button"
                onClick={() => toggleCard(item.word)}
                className={`text-right rounded-2xl border p-5 transition-all cursor-pointer ${
                  isOpen
                    ? 'bg-sky-50 border-sky-300 shadow-sm'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-amber-50/60 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-xl border text-lg font-extrabold ${item.colorClass}`}>
                    {item.word}
                  </span>
                  <Volume2 className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1.5">
                  <div className="text-base font-bold text-slate-900">
                    <span className="text-sky-700">{item.meaningLabel}: </span>
                    <span>{item.meaningValue}</span>
                  </div>
                  {item.extraLabel && (
                    <div className="text-sm font-bold text-rose-700">
                      <span>{item.extraLabel}: </span>
                      <span>{item.extraValue}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 font-medium pt-1">
                    {item.egyptianHint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons Learned & Grammar Quick Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6">
          <div className="flex items-center gap-2.5 text-emerald-900 font-extrabold text-xl mb-4">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            <span>إيه اللي اتعلمناه يا بطلة؟</span>
          </div>
          <ul className="space-y-3">
            {lesson.lessonsLearned.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-800 font-semibold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-6">
          <div className="flex items-center gap-2.5 text-sky-900 font-extrabold text-xl mb-4">
            <Lightbulb className="w-6 h-6 text-amber-500 fill-amber-400" />
            <span>{lesson.grammarSummaryTitle}</span>
          </div>
          <ul className="space-y-3">
            {lesson.grammarSummaryPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-800 font-semibold text-base">
                <span className="w-6 h-6 rounded-full bg-sky-200 text-sky-900 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
