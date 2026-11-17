import React, { useEffect } from 'react';
import { Star } from 'lucide-react';

interface StarCelebrationProps {
  visible: boolean;
  message: string;
  starsEarned?: number;
  onDone: () => void;
}

const CONFETTI_ITEMS = [
  { x: '12%', y: '20%', color: 'text-amber-400', delay: '0ms' },
  { x: '25%', y: '12%', color: 'text-rose-400', delay: '60ms' },
  { x: '38%', y: '24%', color: 'text-sky-400', delay: '120ms' },
  { x: '52%', y: '10%', color: 'text-emerald-400', delay: '40ms' },
  { x: '68%', y: '18%', color: 'text-amber-500', delay: '100ms' },
  { x: '82%', y: '14%', color: 'text-violet-400', delay: '80ms' },
  { x: '18%', y: '72%', color: 'text-emerald-400', delay: '140ms' },
  { x: '78%', y: '74%', color: 'text-rose-400', delay: '90ms' },
];

export const StarCelebration: React.FC<StarCelebrationProps> = ({
  visible,
  message,
  starsEarned = 1,
  onDone,
}) => {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDone, 2100);
    return () => window.clearTimeout(timer);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4"
      aria-live="polite"
    >
      {/* Floating stars */}
      {CONFETTI_ITEMS.map((item, idx) => (
        <div
          key={idx}
          style={{ left: item.x, top: item.y, animationDelay: item.delay }}
          className={`absolute ${item.color} animate-bounce`}
        >
          <Star className="w-8 h-8 fill-current drop-shadow" />
        </div>
      ))}

      {/* Central celebration card */}
      <div className="animate-pop-in bg-white border-2 border-amber-300 shadow-xl rounded-3xl px-8 py-6 text-center max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          {Array.from({ length: Math.min(starsEarned, 5) }).map((_, i) => (
            <Star key={i} className="w-10 h-10 text-amber-400 fill-amber-400 drop-shadow-sm" />
          ))}
        </div>
        <div className="text-2xl font-extrabold text-slate-900 mb-1">{message}</div>
        <div className="text-sm font-bold text-amber-700 tabular-nums">
          +{starsEarned} {starsEarned === 1 ? 'نجمة ذهبية جديدة!' : 'نجوم ذهبية جديدة!'}
        </div>
      </div>
    </div>
  );
};
