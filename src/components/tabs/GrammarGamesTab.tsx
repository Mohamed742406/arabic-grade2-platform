import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Gamepad2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Star,
  ArrowLeft,
} from 'lucide-react';
import {
  ChoicePrompt,
  GameBlock,
  LessonData,
  RobotMood,
  SequenceItem,
  SortCategory,
  SortItem,
  SyllableWord,
} from '../../types/curriculum';
import { RobotCompanion } from '../RobotCompanion';
import { playSuccessSound, playTryAgainSound, speakSinglePhrase } from '../../utils/soundAndSpeech';

interface GrammarGamesTabProps {
  lesson: LessonData;
  studentName: string;
  soundEnabled: boolean;
  completedGames: string[];
  onGameComplete: (gameId: string, starsEarned: number, celebrationMessage: string) => void;
}

function deterministicShuffle<T>(items: T[], seedOffset = 1): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (i * 7 + seedOffset * 3) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Ensure order isn't identical if length > 1
  if (arr.length > 1 && arr.every((item, idx) => item === items[idx])) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

// ---------------------------------------------------------------------------
// 1. Syllable Splitter & Builder Game
// ---------------------------------------------------------------------------
const SyllablesGame: React.FC<{
  title: string;
  items: SyllableWord[];
  soundEnabled: boolean;
  isCompletedBefore: boolean;
  onRobotUpdate: (mood: RobotMood, msg: string) => void;
  onFinish: () => void;
}> = ({ items, soundEnabled, onRobotUpdate, onFinish }) => {
  const [wordIdx, setWordIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [wordSolved, setWordSolved] = useState(false);

  const current = items[wordIdx];

  const shuffledTiles = useMemo(() => {
    const tagged = current.syllables.map((s, idx) => ({ id: `${current.id}-${idx}`, text: s }));
    return deterministicShuffle(tagged, wordIdx + 2);
  }, [current, wordIdx]);

  const [usedTileIds, setUsedTileIds] = useState<string[]>([]);

  const handleTileClick = (tileId: string, text: string) => {
    if (wordSolved || usedTileIds.includes(tileId)) return;

    const nextExpected = current.syllables[placed.length];
    if (text === nextExpected) {
      const nextPlaced = [...placed, text];
      const nextUsed = [...usedTileIds, tileId];
      setPlaced(nextPlaced);
      setUsedTileIds(nextUsed);
      playSuccessSound(soundEnabled);

      if (nextPlaced.length === current.syllables.length) {
        setWordSolved(true);
        onRobotUpdate('cheering', `برافو عليكي! قطعتي كلمة «${current.word}» صح ١٠٠٪!`);
      } else {
        onRobotUpdate('happy', 'شطورة! كملي باقي المقاطع الصوتية.');
      }
    } else {
      playTryAgainSound(soundEnabled);
      onRobotUpdate('encouraging', `جربي تاني يا بطلة! ${current.hint}`);
    }
  };

  const handleNextWord = () => {
    if (wordIdx + 1 < items.length) {
      setWordIdx(wordIdx + 1);
      setPlaced([]);
      setUsedTileIds([]);
      setShowHint(false);
      setWordSolved(false);
      onRobotUpdate('happy', 'يلا على الكلمة اللي بعدها يا شطورة!');
    } else {
      onFinish();
    }
  };

  const handleResetWord = () => {
    setPlaced([]);
    setUsedTileIds([]);
    setWordSolved(false);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm font-bold text-slate-600">
        <span className="tabular-nums">
          الكلمة {wordIdx + 1} من {items.length}
        </span>
        <div className="flex items-center gap-1.5">
          {items.map((item, idx) => (
            <span
              key={item.id}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                idx < wordIdx ? 'bg-emerald-500' : idx === wordIdx ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Target Word Display */}
      <div className="bg-amber-50/80 border-2 border-amber-200 rounded-3xl p-6 text-center space-y-3">
        <div className="text-xs font-extrabold text-amber-800">
          فككي الكلمة إلى مقاطعها الصوتية بالترتيب:
        </div>
        <button
          type="button"
          onClick={() => speakSinglePhrase(current.word)}
          className="font-reading text-4xl sm:text-5xl font-extrabold text-slate-900 hover:text-sky-700 transition-colors cursor-pointer"
        >
          {current.word}
        </button>
        {current.hasShadda && (
          <div className="text-xs font-bold text-rose-700">
            انتبهي: هذه الكلمة فيها حرف مشدد (يفك إلى حرفين: ساكن + متحرك)!
          </div>
        )}
      </div>

      {/* Target Slots */}
      <div className="flex flex-wrap items-center justify-center gap-3 min-h-[76px]">
        {current.syllables.map((syl, idx) => {
          const filled = placed[idx];
          return (
            <div
              key={idx}
              className={`min-w-[74px] h-16 px-4 rounded-2xl border-2 flex items-center justify-center font-reading text-2xl font-extrabold transition-all ${
                filled
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs animate-pop-in'
                  : idx === placed.length
                  ? 'bg-sky-50 border-sky-400 border-dashed text-sky-400'
                  : 'bg-slate-50 border-slate-200 border-dashed text-slate-300'
              }`}
            >
              {filled || `${idx + 1}`}
            </div>
          );
        })}
      </div>

      {/* Clickable Syllable Tiles */}
      <div className="space-y-2">
        <div className="text-center text-sm font-bold text-slate-600">
          اختاري المقاطع بالترتيب الصحيح (من اليمين لليسار):
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {shuffledTiles.map((tile) => {
            const isUsed = usedTileIds.includes(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                disabled={isUsed || wordSolved}
                onClick={() => handleTileClick(tile.id, tile.text)}
                className={`min-w-[76px] h-14 px-5 rounded-2xl border-2 font-reading text-2xl font-extrabold transition-all cursor-pointer ${
                  isUsed
                    ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-default'
                    : 'bg-white border-sky-300 text-slate-900 hover:bg-sky-50 hover:-translate-y-0.5 shadow-xs'
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Helper & Next Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-sm font-bold hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>مساعدة روبي</span>
          </button>
          <button
            type="button"
            onClick={handleResetWord}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الكلمة</span>
          </button>
        </div>

        {wordSolved && (
          <button
            type="button"
            onClick={handleNextWord}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-colors cursor-pointer shadow-sm"
          >
            <span>{wordIdx + 1 < items.length ? 'الكلمة التالية' : 'إنهاء اللعبة واستلام النجوم'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {showHint && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-sm font-bold text-sky-900">
          تلميح روبي: {current.hint}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Category Sorting Game (Drag & Drop + Tap-to-Place)
// ---------------------------------------------------------------------------
const ClassifyGame: React.FC<{
  categories: SortCategory[];
  items: SortItem[];
  soundEnabled: boolean;
  onRobotUpdate: (mood: RobotMood, msg: string) => void;
  onFinish: () => void;
}> = ({ categories, items, soundEnabled, onRobotUpdate, onFinish }) => {
  const [placedMap, setPlacedMap] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const remainingItems = items.filter((item) => !placedMap[item.id]);
  const allPlaced = remainingItems.length === 0;

  const tryPlace = (itemId: string, targetCategoryId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.categoryId === targetCategoryId) {
      const nextMap = { ...placedMap, [itemId]: targetCategoryId };
      setPlacedMap(nextMap);
      setSelectedId(null);
      setDraggedId(null);
      playSuccessSound(soundEnabled);

      if (Object.keys(nextMap).length === items.length) {
        onRobotUpdate('cheering', 'يا سلام عليكي! صنفتي كل الكلمات صح مية في المية!');
        onFinish();
      } else {
        onRobotUpdate('cheering', `برافو عليكي! «${item.text}» في مكانها الصح!`);
      }
    } else {
      playTryAgainSound(soundEnabled);
      onRobotUpdate('encouraging', `فكري تاني يا جميلة! ${item.hint}`);
    }
  };

  const categoryColorStyles: Record<SortCategory['color'], string> = {
    sky: 'bg-sky-50/80 border-sky-300 text-sky-900',
    amber: 'bg-amber-50/80 border-amber-300 text-amber-900',
    emerald: 'bg-emerald-50/80 border-emerald-300 text-emerald-900',
    rose: 'bg-rose-50/80 border-rose-300 text-rose-900',
  };

  return (
    <div className="space-y-6">
      {/* Unplaced Word Cards */}
      {!allPlaced ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5">
          <div className="text-sm font-bold text-slate-600 mb-3 text-center">
            اسحبي البطاقة إلى الصندوق المناسب، أو اضغطي على البطاقة ثم اضغطي على الصندوق!
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {remainingItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={() => setDraggedId(item.id)}
                  onClick={() => {
                    setSelectedId(isSelected ? null : item.id);
                    speakSinglePhrase(item.text);
                  }}
                  className={`px-5 py-3 rounded-2xl border-2 font-reading text-xl font-extrabold transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-sky-600 border-sky-700 text-white scale-105'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 text-center space-y-2">
          <div className="text-xl font-extrabold text-emerald-900">
            أحسنتِ يا بطلة! اكتمل التصنيف بنجاح!
          </div>
          <button
            type="button"
            onClick={() => {
              setPlacedMap({});
              setSelectedId(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-sm font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>العب مرة تانية</span>
          </button>
        </div>
      )}

      {/* Baskets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const itemsInBasket = items.filter((i) => placedMap[i.id] === cat.id);
          return (
            <div
              key={cat.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedId) tryPlace(draggedId, cat.id);
              }}
              onClick={() => {
                if (selectedId) tryPlace(selectedId, cat.id);
              }}
              className={`rounded-3xl border-2 p-5 min-h-[190px] transition-all ${
                categoryColorStyles[cat.color]
              } ${selectedId ? 'ring-2 ring-sky-400 ring-offset-2 cursor-pointer' : ''}`}
            >
              <div className="text-center mb-4">
                <div className="text-lg sm:text-xl font-extrabold">{cat.title}</div>
                <div className="text-xs font-bold opacity-80">{cat.subtitle}</div>
              </div>

              <div className="flex flex-wrap gap-2.5 justify-center">
                {itemsInBasket.length === 0 ? (
                  <div className="text-sm font-semibold opacity-60 py-6">
                    {selectedId ? 'اضغطي هنا لوضع البطاقة' : 'اسحبي الكلمات هنا'}
                  </div>
                ) : (
                  itemsInBasket.map((placed) => (
                    <span
                      key={placed.id}
                      className="animate-pop-in inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-slate-900 font-reading text-lg font-bold shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{placed.text}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. Interactive Choice Game
// ---------------------------------------------------------------------------
const ChoiceGame: React.FC<{
  ruleTip?: string;
  items: ChoicePrompt[];
  soundEnabled: boolean;
  onRobotUpdate: (mood: RobotMood, msg: string) => void;
  onFinish: () => void;
}> = ({ ruleTip, items, soundEnabled, onRobotUpdate, onFinish }) => {
  const [qIdx, setQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  const current = items[qIdx];

  const handleChoose = (opt: string) => {
    if (isCorrect) return;
    setSelectedOpt(opt);
    if (opt === current.correctOption) {
      setIsCorrect(true);
      playSuccessSound(soundEnabled);
      onRobotUpdate('cheering', current.egyptianFeedback);
    } else {
      playTryAgainSound(soundEnabled);
      onRobotUpdate('encouraging', 'ولا يهمك يا بطلة، فكري ثانية وجربي اختيار تاني!');
    }
  };

  const handleNext = () => {
    if (qIdx + 1 < items.length) {
      setQIdx(qIdx + 1);
      setSelectedOpt(null);
      setIsCorrect(false);
    } else {
      onFinish();
    }
  };

  return (
    <div className="space-y-5">
      {ruleTip && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm font-bold text-amber-900">
          القاعدة الذهبية: {ruleTip}
        </div>
      )}

      <div className="flex items-center justify-between text-sm font-bold text-slate-600">
        <span className="tabular-nums">
          السؤال {qIdx + 1} من {items.length}
        </span>
        <div className="flex items-center gap-1.5">
          {items.map((item, idx) => (
            <span
              key={item.id}
              className={`h-2.5 w-8 rounded-full transition-colors ${
                idx < qIdx ? 'bg-emerald-500' : idx === qIdx ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 text-center">
        <p className="font-reading text-2xl sm:text-3xl font-extrabold text-slate-900">
          {current.prompt}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {current.options.map((opt) => {
          const chosen = selectedOpt === opt;
          const correctChoice = opt === current.correctOption;
          let btnClass =
            'bg-white border-slate-200 text-slate-900 hover:border-sky-400 hover:bg-sky-50';
          if (chosen && isCorrect && correctChoice) {
            btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
          } else if (chosen && !correctChoice) {
            btnClass = 'bg-rose-50 border-rose-400 text-rose-900';
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleChoose(opt)}
              className={`min-h-[60px] px-5 py-4 rounded-2xl border-2 font-reading text-xl font-extrabold transition-all cursor-pointer ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {isCorrect && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base transition-colors cursor-pointer shadow-sm"
          >
            <span>{qIdx + 1 < items.length ? 'السؤال التالي' : 'إنهاء اللعبة واستلام النجوم'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. Story Sequence Game
// ---------------------------------------------------------------------------
const SequenceGame: React.FC<{
  items: SequenceItem[];
  soundEnabled: boolean;
  onRobotUpdate: (mood: RobotMood, msg: string) => void;
  onFinish: () => void;
}> = ({ items, soundEnabled, onRobotUpdate, onFinish }) => {
  const shuffledItems = useMemo(() => deterministicShuffle(items, 5), [items]);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const nextStepNumber = orderedIds.length + 1;
  const isComplete = orderedIds.length === items.length;

  const handleSelect = (item: SequenceItem) => {
    if (orderedIds.includes(item.id)) return;
    if (item.correctOrder === nextStepNumber) {
      const next = [...orderedIds, item.id];
      setOrderedIds(next);
      playSuccessSound(soundEnabled);
      if (next.length === items.length) {
        onRobotUpdate('cheering', 'برافو عليكي يا بطلة! رتبتي أحداث القصة كلها بالترتيب الصح!');
        onFinish();
      } else {
        onRobotUpdate('happy', `شطورة! ده الحدث رقم ${nextStepNumber}. إيه اللي حصل بعده؟`);
      }
    } else {
      playTryAgainSound(soundEnabled);
      onRobotUpdate('encouraging', `فكري تاني يا جميلة! إحنا بندور على الحدث رقم ${nextStepNumber}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Ordered Timeline */}
      {orderedIds.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-sm font-extrabold text-emerald-800">الترتيب الصحيح للأحداث:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orderedIds.map((id, idx) => {
              const item = items.find((i) => i.id === id)!;
              return (
                <div
                  key={id}
                  className="animate-pop-in flex items-center gap-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4"
                >
                  <span className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="font-reading text-base font-bold text-slate-900">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remaining Cards */}
      {!isComplete ? (
        <div className="space-y-3">
          <div className="text-sm font-extrabold text-sky-800 tabular-nums">
            اضغطي على الحدث رقم ({nextStepNumber}):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shuffledItems
              .filter((i) => !orderedIds.includes(i.id))
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-3 text-right bg-white border-2 border-sky-200 hover:border-sky-400 hover:bg-sky-50 rounded-2xl p-4 transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="font-reading text-base sm:text-lg font-bold text-slate-900">
                    {item.text}
                  </span>
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setOrderedIds([])}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة ترتيب القصة</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main GrammarGamesTab Wrapper
// ---------------------------------------------------------------------------
export const GrammarGamesTab: React.FC<GrammarGamesTabProps> = ({
  lesson,
  studentName,
  soundEnabled,
  completedGames,
  onGameComplete,
}) => {
  const [activeGameIdx, setActiveGameIdx] = useState(0);
  const currentGame: GameBlock = lesson.games[activeGameIdx];
  const [robotState, setRobotState] = useState<{ mood: RobotMood; message: string }>({
    mood: 'happy',
    message: currentGame.robotIntro,
  });

  const handleSwitchGame = (idx: number) => {
    setActiveGameIdx(idx);
    setRobotState({
      mood: 'happy',
      message: lesson.games[idx].robotIntro,
    });
  };

  const handleFinishGame = (gameId: string) => {
    const alreadyDone = completedGames.includes(gameId);
    onGameComplete(
      gameId,
      alreadyDone ? 0 : 2,
      alreadyDone ? `أحسنتِ يا ${studentName}!` : `ممتازة يا ${studentName}! كسبتِ نجمتين!`
    );
  };

  return (
    <div className="space-y-6">
      <RobotCompanion mood={robotState.mood} message={robotState.message} />

      {/* Game Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-2">
        {lesson.games.map((game, idx) => {
          const isActive = idx === activeGameIdx;
          const isDone = completedGames.includes(game.id);
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => handleSwitchGame(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-transparent text-slate-700 hover:bg-sky-50'
              }`}
            >
              <Gamepad2 className="w-4 h-4 shrink-0" />
              <span>{game.title}</span>
              {isDone && (
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-emerald-600'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Game Arena */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-extrabold text-slate-900">{currentGame.title}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-700">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>
              {completedGames.includes(currentGame.id) ? 'أكملتِ هذه اللعبة' : 'المكافأة: +٢ نجمة'}
            </span>
          </div>
        </div>

        {currentGame.type === 'syllables' && (
          <SyllablesGame
            key={currentGame.id}
            title={currentGame.title}
            items={currentGame.items}
            soundEnabled={soundEnabled}
            isCompletedBefore={completedGames.includes(currentGame.id)}
            onRobotUpdate={(mood, msg) => setRobotState({ mood, message: msg })}
            onFinish={() => handleFinishGame(currentGame.id)}
          />
        )}

        {currentGame.type === 'classify' && (
          <ClassifyGame
            key={currentGame.id}
            categories={currentGame.categories}
            items={currentGame.items}
            soundEnabled={soundEnabled}
            onRobotUpdate={(mood, msg) => setRobotState({ mood, message: msg })}
            onFinish={() => handleFinishGame(currentGame.id)}
          />
        )}

        {currentGame.type === 'choice' && (
          <ChoiceGame
            key={currentGame.id}
            ruleTip={currentGame.ruleTip}
            items={currentGame.items}
            soundEnabled={soundEnabled}
            onRobotUpdate={(mood, msg) => setRobotState({ mood, message: msg })}
            onFinish={() => handleFinishGame(currentGame.id)}
          />
        )}

        {currentGame.type === 'sequence' && (
          <SequenceGame
            key={currentGame.id}
            items={currentGame.items}
            soundEnabled={soundEnabled}
            onRobotUpdate={(mood, msg) => setRobotState({ mood, message: msg })}
            onFinish={() => handleFinishGame(currentGame.id)}
          />
        )}
      </div>
    </div>
  );
};
