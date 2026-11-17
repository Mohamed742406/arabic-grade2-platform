import React from 'react';
import { RobotMood } from '../types/curriculum';

interface RobotCompanionProps {
  mood?: RobotMood;
  message: string;
  title?: string;
  compact?: boolean;
  className?: string;
}

export const RobotCompanion: React.FC<RobotCompanionProps> = ({
  mood = 'happy',
  message,
  title = 'صديقك الروبوت «روبي»',
  compact = false,
  className = '',
}) => {
  const isSpeaking = mood === 'speaking';
  const isCheering = mood === 'cheering';

  return (
    <div
      className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white border border-sky-200 rounded-3xl p-4 sm:p-5 shadow-sm ${className}`}
    >
      {/* Cute Cartoon Robot SVG inspired by the textbook mascot */}
      <div className={`shrink-0 ${compact ? 'w-20 h-20' : 'w-24 h-24 sm:w-28 sm:h-28'} animate-float-slow`}>
        <svg
          viewBox="0 0 140 140"
          className="w-full h-full drop-shadow-sm"
          aria-label="الروبوت الصديق روبي"
          role="img"
        >
          {/* Antenna */}
          <line x1="70" y1="18" x2="70" y2="32" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx="70"
            cy="13"
            r="7"
            fill={isCheering ? '#F59E0B' : isSpeaking ? '#10B981' : '#38BDF8'}
            stroke="#0284C7"
            strokeWidth="2.5"
          />

          {/* Ears / Side sensors */}
          <rect x="20" y="54" width="12" height="22" rx="6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2.5" />
          <rect x="108" y="54" width="12" height="22" rx="6" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2.5" />

          {/* Head */}
          <rect x="30" y="32" width="80" height="60" rx="22" fill="#FB923C" stroke="#C2410C" strokeWidth="3" />
          {/* Face Screen */}
          <rect x="39" y="42" width="62" height="40" rx="14" fill="#1E293B" />

          {/* Cheeks */}
          <circle cx="48" cy="69" r="4" fill="#FDA4AF" opacity="0.75" />
          <circle cx="92" cy="69" r="4" fill="#FDA4AF" opacity="0.75" />

          {/* Eyes */}
          {mood === 'cheering' ? (
            <>
              <path d="M50 58 Q55 51 60 58" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M80 58 Q85 51 90 58" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : mood === 'thinking' ? (
            <>
              <circle cx="55" cy="57" r="5.5" fill="#38BDF8" />
              <circle cx="57" cy="55" r="2" fill="#FFFFFF" />
              <ellipse cx="85" cy="58" rx="6" ry="3.5" fill="#38BDF8" />
            </>
          ) : (
            <>
              <circle cx="55" cy="57" r="6" fill="#38BDF8" />
              <circle cx="57" cy="55" r="2.2" fill="#FFFFFF" />
              <circle cx="85" cy="57" r="6" fill="#38BDF8" />
              <circle cx="87" cy="55" r="2.2" fill="#FFFFFF" />
            </>
          )}

          {/* Mouth */}
          {isSpeaking ? (
            <ellipse cx="70" cy="71" rx="7" ry="5" fill="#FDE047" />
          ) : mood === 'encouraging' ? (
            <path d="M60 70 Q70 76 80 70" fill="none" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <path d="M58 68 Q70 78 82 68" fill="none" stroke="#FDE047" strokeWidth="3.2" strokeLinecap="round" />
          )}

          {/* Body */}
          <rect x="42" y="95" width="56" height="34" rx="14" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
          {/* Chest heart / star badge */}
          <circle cx="70" cy="112" r="9" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
          <path
            d="M70 106 L71.8 109.8 L76 110.3 L72.9 113.1 L73.7 117.2 L70 115.2 L66.3 117.2 L67.1 113.1 L64 110.3 L68.2 109.8 Z"
            fill="#F59E0B"
          />

          {/* Waving Arms */}
          {isCheering ? (
            <>
              <path d="M42 104 Q24 92 22 76" fill="none" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
              <circle cx="22" cy="74" r="5.5" fill="#FDE047" stroke="#C2410C" strokeWidth="2" />
              <path d="M98 104 Q116 92 118 76" fill="none" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
              <circle cx="118" cy="74" r="5.5" fill="#FDE047" stroke="#C2410C" strokeWidth="2" />
            </>
          ) : (
            <>
              <path d="M42 106 Q26 110 24 120" fill="none" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
              <circle cx="24" cy="122" r="5" fill="#FDE047" stroke="#C2410C" strokeWidth="2" />
              <path d="M98 104 Q114 96 116 82" fill="none" stroke="#FB923C" strokeWidth="7" strokeLinecap="round" />
              <circle cx="116" cy="80" r="5" fill="#FDE047" stroke="#C2410C" strokeWidth="2" />
            </>
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      <div className="flex-1 min-w-0 text-center sm:text-right">
        <div className="text-xs font-bold text-sky-700 mb-1.5">{title}</div>
        <div className="bg-sky-50/90 border border-sky-200 rounded-2xl px-4 py-3 text-slate-800 text-base sm:text-lg font-medium leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
};
