import React, { useState, useRef } from 'react';
import { Volume2, Play, RotateCcw, CheckCircle2, AlertCircle, Star, Award, Sparkles } from 'lucide-react';
import { Language, StudentProgress } from '../types';
import { mouseExplorerLevels, MouseExplorerLevelConfig } from '../data/mouseExplorerData';

interface MouseExplorerGamePlayerProps {
  language: Language;
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
  onExit: () => void;
}

export const MouseExplorerGamePlayer: React.FC<MouseExplorerGamePlayerProps> = ({
  language,
  progress,
  onUpdateProgress,
  onExit,
}) => {
  const isAr = language === 'ar';
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [levelState, setLevelState] = useState<'instruction' | 'workspace' | 'success' | 'retry' | 'enjoyment'>('instruction');
  const [enjoymentSelected, setEnjoymentSelected] = useState<string | null>(null);

  // True pointer drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const starRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const currentLevel: MouseExplorerLevelConfig = mouseExplorerLevels[currentLevelIndex] || mouseExplorerLevels[0];

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(msg);
    }
  };

  const handleStartWorkspace = () => {
    setLevelState('workspace');
    playAudio(currentLevel.instruction[language]);
    setDragPos({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    if (starRef.current) {
      starRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    setDragPos({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (starRef.current && targetRef.current) {
      const starRect = starRef.current.getBoundingClientRect();
      const targetRect = targetRef.current.getBoundingClientRect();

      // Check overlap between star and target
      const isOverlapping = !(
        starRect.right < targetRect.left ||
        starRect.left > targetRect.right ||
        starRect.bottom < targetRect.top ||
        starRect.top > targetRect.bottom
      );

      if (isOverlapping) {
        // Success drop
        setLevelState('success');
        playAudio(currentLevel.correctMessage[language]);
        if (!progress.completedActivityIds.includes(`me-lvl-${currentLevel.levelNumber}`)) {
          const updated = {
            ...progress,
            completedActivityIds: [...progress.completedActivityIds, `me-lvl-${currentLevel.levelNumber}`],
            starsEarned: progress.starsEarned + 1,
            starsEarnedToday: (progress.starsEarned || 0) + currentLevel.xpReward,
          };
          onUpdateProgress(updated);
        }
      } else {
        // Incorrect drop - return smoothly
        setDragPos({ x: 0, y: 0 });
        setLevelState('retry');
        playAudio(currentLevel.retryMessage[language]);
      }
    }
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < mouseExplorerLevels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setLevelState('instruction');
      setDragPos({ x: 0, y: 0 });
      setEnjoymentSelected(null);
    } else {
      setLevelState('enjoyment');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-100 dark:border-slate-800 max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg">
            {isAr ? 'الفصل 01: مستكشف الفأرة' : 'Chapter 01: Mouse Explorer'}
          </span>
          <span className="text-sm font-bold text-slate-300">
            {currentLevel.title[language]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-amber-400 text-slate-900 px-3 py-1 rounded-xl text-xs font-black">
            <Star className="w-4 h-4 fill-current" />
            <span>XP: {progress.starsEarned * 5}</span>
          </div>
          <button
            onClick={onExit}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {isAr ? 'خروج ✕' : 'Exit ✕'}
          </button>
        </div>
      </div>

      {/* Instruction Panel (Code.org Style) */}
      <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            🤖
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {currentLevel.instruction[language]}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'اسحب النجمة وضعها في الهدف المخصص.' : 'Drag the star and place it in the target.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => playAudio(currentLevel.instruction[language])}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-bold"
          >
            <Volume2 className="w-4 h-4 text-red-600" />
            <span>{isAr ? 'استماع للإرشادات' : 'Audio'}</span>
          </button>

          {levelState === 'instruction' && (
            <button
              onClick={handleStartWorkspace}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md text-sm transition-colors"
            >
              {isAr ? 'حسنًا (OK)' : 'OK / Start'}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Workspace with True Pointer Drag and Drop */}
      <div className="p-8">
        {levelState === 'instruction' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-950 text-red-600 rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-inner animate-bounce">
              🎯
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 max-w-md mx-auto">
              {currentLevel.instruction[language]}
            </p>
            <button
              onClick={handleStartWorkspace}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl text-lg flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>{isAr ? 'ابدأ المستوى' : 'Start Level'}</span>
            </button>
          </div>
        )}

        {levelState === 'workspace' && (
          <div className="space-y-6 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-10 rounded-3xl border-2 border-dashed border-red-300 dark:border-red-900 shadow-inner min-h-[350px] relative flex items-center justify-around overflow-hidden select-none" style={{ touchAction: 'none' }}>
              <span className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isAr ? `منطقة السحب والإفلات - المستوى ${currentLevel.levelNumber}` : `Drag & Drop Workspace - Level ${currentLevel.levelNumber}`}
              </span>

              {/* Draggable Star Element */}
              <div
                ref={starRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`w-32 h-32 bg-amber-400 rounded-3xl flex flex-col items-center justify-center text-5xl shadow-2xl cursor-grab active:cursor-grabbing transition-transform ${isDragging ? 'scale-110 shadow-2xl z-50 ring-4 ring-red-500' : 'hover:scale-105'}`}
                style={{
                  transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
                  touchAction: 'none',
                  userSelect: 'none',
                }}
              >
                <span>⭐</span>
                <span className="text-[10px] font-black text-slate-900 mt-1">{isAr ? 'اسحبني' : 'Drag Me'}</span>
              </div>

              {/* Drop Target Element */}
              <div
                ref={targetRef}
                className="w-40 h-40 bg-indigo-50 dark:bg-indigo-950/40 border-4 border-dashed border-indigo-500 rounded-3xl flex flex-col items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shadow-inner"
              >
                <span>🎯</span>
                <span className="mt-2">{isAr ? 'الهدف الصحيح' : 'Target Goal'}</span>
              </div>
            </div>
          </div>
        )}

        {levelState === 'success' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
              🎉
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentLevel.correctMessage[language]}
            </h4>
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full font-bold text-sm">
              <Star className="w-5 h-5 fill-current" />
              <span>+{currentLevel.xpReward} XP</span>
            </div>
            <div>
              <button
                onClick={handleNextLevel}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 mx-auto"
              >
                <span>{isAr ? 'المستوى التالي ←' : 'Next Level →'}</span>
              </button>
            </div>
          </div>
        )}

        {levelState === 'retry' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              💪
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentLevel.retryMessage[language]}
            </h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              💡 {currentLevel.hintMessage[language]}
            </div>
            <div>
              <button
                onClick={handleStartWorkspace}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl"
              >
                {isAr ? 'حاول مرة أخرى 🔄' : 'Try Again 🔄'}
              </button>
            </div>
          </div>
        )}

        {levelState === 'enjoyment' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-950 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              🏆
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? 'أتممت جميع مستويات مستكشف الفأرة (12/12) بنجاح!' : 'Completed all 12 Mouse Explorer levels successfully!'}
            </h4>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setEnjoymentSelected('loved')}
                className={`p-4 rounded-2xl border font-bold text-sm flex flex-col items-center gap-2 ${enjoymentSelected === 'loved' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800'}`}
              >
                <span className="text-3xl">😍</span>
                <span>{isAr ? 'انبسطت جدًا' : 'Loved it!'}</span>
              </button>
              <button
                onClick={() => setEnjoymentSelected('okay')}
                className={`p-4 rounded-2xl border font-bold text-sm flex flex-col items-center gap-2 ${enjoymentSelected === 'okay' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800'}`}
              >
                <span className="text-3xl">🙂</span>
                <span>{isAr ? 'كانت عادية' : 'It was okay'}</span>
              </button>
            </div>
            <div className="pt-4">
              <button
                onClick={onExit}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl"
              >
                {isAr ? 'العودة للقائمة الرئيسية 🌟' : 'Return to Main Menu 🌟'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
