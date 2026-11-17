// Sound effects via Web Audio API and Arabic reading via Web Speech API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSuccessSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 cheerful triad
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.001, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.26);
  });
}

export function playTryAgainSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.24);
}

export function playFanfareSound(enabled: boolean): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.1);
    gain.gain.setValueAtTime(0.001, now + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.1 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.1);
    osc.stop(now + idx * 0.1 + 0.38);
  });
}

export interface SpeechController {
  stop: () => void;
}

export function speakArabicLines(
  lines: string[],
  options: {
    rate?: number;
    onLineStart?: (index: number) => void;
    onComplete?: () => void;
    onVoiceStatus?: (hasArabicVoice: boolean) => void;
  }
): SpeechController {
  let cancelled = false;
  let fallbackTimer: number | null = null;
  const rate = options.rate ?? 0.9;

  const stop = () => {
    cancelled = true;
    if (fallbackTimer !== null) {
      window.clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onVoiceStatus?.(false);
    // Visual karaoke fallback so the child can still follow line by line
    let idx = 0;
    const step = () => {
      if (cancelled) return;
      if (idx >= lines.length) {
        options.onComplete?.();
        return;
      }
      options.onLineStart?.(idx);
      const duration = Math.max(2200, lines[idx].length * (rate < 0.85 ? 90 : 65));
      idx += 1;
      fallbackTimer = window.setTimeout(step, duration);
    };
    step();
    return { stop };
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const voices = synth.getVoices();
  const arabicVoice =
    voices.find((v) => v.lang.toLowerCase().startsWith('ar-eg')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('ar-sa')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

  options.onVoiceStatus?.(Boolean(arabicVoice));

  let index = 0;

  const speakNext = () => {
    if (cancelled) return;
    if (index >= lines.length) {
      options.onComplete?.();
      return;
    }

    const currentIdx = index;
    options.onLineStart?.(currentIdx);

    const utterance = new SpeechSynthesisUtterance(lines[currentIdx]);
    utterance.lang = arabicVoice ? arabicVoice.lang : 'ar-EG';
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1.08; // Friendly cheerful robot tone

    let advanced = false;
    const advance = () => {
      if (advanced || cancelled) return;
      advanced = true;
      index += 1;
      speakNext();
    };

    utterance.onend = advance;
    utterance.onerror = () => {
      // If browser blocks or lacks TTS voice, smoothly pace visually so it doesn't freeze
      const duration = Math.max(2000, lines[currentIdx].length * 60);
      fallbackTimer = window.setTimeout(advance, duration);
    };

    synth.speak(utterance);

    // Safety guard if onend never fires in certain browsers without Arabic TTS engines
    if (!arabicVoice && voices.length > 0) {
      const safetyDuration = Math.max(2400, lines[currentIdx].length * 70);
      fallbackTimer = window.setTimeout(() => {
        if (!advanced && !synth.speaking) {
          advance();
        }
      }, safetyDuration);
    }
  };

  speakNext();
  return { stop };
}

export function speakSinglePhrase(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices();
  const arabicVoice =
    voices.find((v) => v.lang.toLowerCase().startsWith('ar-eg')) ||
    voices.find((v) => v.lang.toLowerCase().startsWith('ar'));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = arabicVoice ? arabicVoice.lang : 'ar-EG';
  if (arabicVoice) utterance.voice = arabicVoice;
  utterance.rate = 0.92;
  utterance.pitch = 1.08;
  synth.speak(utterance);
}
