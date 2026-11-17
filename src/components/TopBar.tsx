import React from 'react';
import { Volume2, VolumeX, Star } from 'lucide-react';

interface TopBarProps {
  stars: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigateHome: () => void;
  onScrollToSection?: (sectionId: string) => void;
  isInsideLesson: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  stars,
  soundEnabled,
  onToggleSound,
  onNavigateHome,
  onScrollToSection,
  isInsideLesson,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-amber-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-lg sm:text-xl font-extrabold text-sky-700 hover:text-sky-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          بطلة اللغة العربية
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            الرئيسية
          </button>
          {!isInsideLesson && onScrollToSection && (
            <>
              <button
                type="button"
                onClick={() => onScrollToSection('achievements-board')}
                className="hover:text-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                لوحة الإنجازات
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('units-section')}
                className="hover:text-sky-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                الوحدات الدراسية
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Sound toggle + Stars counter (primary interactive action) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Star className="w-4 h-4 fill-slate-900 text-slate-900" />
            <span className="tabular-nums">{stars}</span>
            <span>نجمة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
