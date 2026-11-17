import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Square, Sparkles, BookOpen, Gauge } from 'lucide-react';
import { LessonData, VocabItem } from '../../types/curriculum';
import { RobotCompanion } from '../RobotCompanion';
import { speakArabicLines, speakSinglePhrase, SpeechController } from '../../utils/soundAndSpeech';

interface ReadListenTabProps {
  lesson: LessonData;
  studentName: string;
}

export const ReadListenTab: React.FC<ReadListenTabProps> = ({ lesson, studentName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const [slowMode, setSlowMode] = useState(false);
  const [selectedVocab, setSelectedVocab] = useState<VocabItem | null>(null);
  const [hasArabicVoice, setHasArabicVoice] = useState<boolean | null>(null);
  const controllerRef = useRef<SpeechController | null>(null);

  useEffect(() => {
    return () => {
      controllerRef.current?.stop();
    };
  }, [lesson.id]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      controllerRef.current?.stop();
      setIsPlaying(false);
      setActiveLineIdx(null);
      return;
    }

    const texts = lesson.lines.map((l) => l.text.replace(/\.\.\./g, ' '));
    setIsPlaying(true);
    controllerRef.current = speakArabicLines(texts, {
      rate: slowMode ? 0.72 : 0.92,
      onVoiceStatus: (available) => setHasArabicVoice(available),
      onLineStart: (idx) => setActiveLineIdx(idx),
      onComplete: () => {
        setIsPlaying(false);
        setActiveLineIdx(null);
      },
    });
  };

  const handleSpeakLine = (text: string, idx: number) => {
    controllerRef.current?.stop();
    setIsPlaying(false);
    setActiveLineIdx(idx);
    speakSinglePhrase(text.replace(/\.\.\./g, ' '));
    window.setTimeout(() => {
      setActiveLineIdx((curr) => (curr === idx ? null : curr));
    }, 2600);
  };

  const renderHighlightedText = (text: string, highlightWords: string[]) => {
    if (!highlightWords.length) return <span>{text}</span>;

    // Build regex for exact highlighted words
    const escaped = highlightWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const matchedVocab = lesson.vocabulary.find(
        (v) => part.includes(v.word) || v.word.includes(part)
      );
      if (highlightWords.includes(part)) {
        const vocabObj = matchedVocab || lesson.vocabulary[0];
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (vocabObj) {
                setSelectedVocab(vocabObj);
                speakSinglePhrase(part);
              }
            }}
            className="inline-block mx-1 px-2 py-0.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold transition-colors cursor-pointer"
            title="اضغطي لمعرفة المعنى"
          >
            {part}
          </button>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      <RobotCompanion
        mood={isPlaying ? 'speaking' : 'happy'}
        message={
          isPlaying
            ? `اسمعيني كويس يا ${studentName} وأنا بقرأ لك الدرس سطر بسطر! تقدري كمان تضغطي على أي كلمة ملونة عشان تعرفي معناها.`
            : `${lesson.robotGreeting} اضغطي على زر «اسمع بصوت الروبوت» أو اضغطي على أي سطر أو كلمة ملونة!`
        }
      />

      {/* Audio Control Bar */}
      <div className="bg-white border border-sky-200 rounded-3xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-extrabold text-base transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                <span>إيقاف القراءة</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>اسمع بصوت الروبوت</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSlowMode((prev) => !prev)}
            disabled={isPlaying}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 ${
              slowMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>{slowMode ? 'قراءة هادئة (مفعلة)' : 'سرعة القراءة: عادية'}</span>
          </button>
        </div>

        <div className="text-sm text-slate-500 font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>اضغطي على الكلمات الملونة لمعرفة معناها</span>
        </div>
      </div>

      {hasArabicVoice === false && isPlaying && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-900 font-semibold">
          ملاحظة لطيفة: جهازك لا يحتوي على صوت عربي مثبت في المتصفح حالياً، لكنني أظلل لكِ السطور سطراً بسطر لتقرئي معي بسهولة!
        </div>
      )}

      {/* Selected Vocab Popover Banner */}
      {selectedVocab && (
        <div className="animate-pop-in bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xl font-extrabold text-amber-950">{selectedVocab.word}</span>
              <span className="text-sm font-bold text-amber-800">
                {selectedVocab.meaningLabel}: {selectedVocab.meaningValue}
              </span>
              {selectedVocab.extraLabel && (
                <span className="text-sm font-bold text-rose-700">
                  · {selectedVocab.extraLabel}: {selectedVocab.extraValue}
                </span>
              )}
            </div>
            <p className="text-slate-700 text-base font-medium">
              روبي بيقولك: {selectedVocab.egyptianHint}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedVocab(null)}
            className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-sm font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
          >
            فهمتها يا روبي
          </button>
        </div>
      )}

      {/* Reading Passage Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="space-y-4">
          {lesson.lines.map((line, idx) => {
            const isActive = activeLineIdx === idx;
            return (
              <div
                key={line.id}
                onClick={() => handleSpeakLine(line.text, idx)}
                className={`group rounded-2xl px-4 py-3 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-sky-50 border-sky-300 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-amber-50/50 hover:border-amber-200/70'
                }`}
              >
                {line.isPoetry && line.poetryHemistichs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-8 text-center font-reading text-xl sm:text-2xl font-bold text-slate-900">
                    <div>{renderHighlightedText(line.poetryHemistichs[0], line.highlightWords)}</div>
                    <div>{renderHighlightedText(line.poetryHemistichs[1], line.highlightWords)}</div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-reading text-xl sm:text-2xl font-semibold text-slate-900 leading-loose">
                      {renderHighlightedText(line.text, line.highlightWords)}
                    </p>
                    <span
                      className={`shrink-0 mt-2 p-1.5 rounded-lg transition-opacity ${
                        isActive
                          ? 'text-sky-600 opacity-100'
                          : 'text-slate-400 opacity-0 group-hover:opacity-100'
                      }`}
                      aria-hidden="true"
                    >
                      <Volume2 className="w-5 h-5" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Highlighted New Words Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-700 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>الكلمات الجديدة في الدرس (اضغطي على أي كلمة):</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {lesson.vocabulary.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => {
                  setSelectedVocab(item);
                  speakSinglePhrase(item.word);
                }}
                className={`px-4 py-2 rounded-2xl border text-base font-bold transition-transform hover:scale-105 cursor-pointer ${item.colorClass}`}
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
