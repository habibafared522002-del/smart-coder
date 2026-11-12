import { Language } from '../types';

let audioCtx: AudioContext | null = null;
let isMuted = false;

export const setAudioMuted = (muted: boolean) => {
  isMuted = muted;
  if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

export const getAudioMuted = () => isMuted;

const getContext = (): AudioContext | null => {
  if (isMuted || typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

const playTone = (freq: number, duration: number, type: OscillatorType = 'sine', delay = 0, gainVal = 0.12) => {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  } catch {
    // Audio playback blocked or unavailable in headless environment
  }
};

export const playPickupSfx = () => {
  playTone(440, 0.08, 'sine', 0, 0.09);
  playTone(587.33, 0.08, 'sine', 0.04, 0.09);
};

export const playSnapSfx = () => {
  playTone(523.25, 0.11, 'triangle', 0, 0.13);
  playTone(783.99, 0.16, 'triangle', 0.07, 0.14);
};

export const playRetrySfx = () => {
  playTone(260, 0.14, 'sawtooth', 0, 0.07);
  playTone(210, 0.18, 'sawtooth', 0.1, 0.06);
};

export const playSuccessFanfareSfx = () => {
  playTone(523.25, 0.14, 'triangle', 0, 0.14);
  playTone(659.25, 0.14, 'triangle', 0.11, 0.14);
  playTone(783.99, 0.14, 'triangle', 0.22, 0.14);
  playTone(1046.5, 0.35, 'triangle', 0.33, 0.16);
};

export const speakInstruction = (text: string, language: Language) => {
  if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch {
    // SpeechSynthesis unavailable
  }
};
