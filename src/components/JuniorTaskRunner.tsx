import React, { useState } from 'react';
import { Volume2, Play, RotateCcw, CheckCircle2, AlertCircle, Star, Award, Sparkles, ThumbsUp, Meh, Frown, Video, Speaker } from 'lucide-react';
import { Language, StudentProgress } from '../types';
import { JuniorTask, JuniorLevel } from '../data/juniorCurriculumData';

interface JuniorTaskRunnerProps {
  language: Language;
  level: JuniorLevel;
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
  onBackToMap: () => void;
}

export const JuniorTaskRunner: React.FC<JuniorTaskRunnerProps> = ({
  language,
  level,
  progress,
  onUpdateProgress,
  onBackToMap,
}) => {
  const isAr = language === 'ar';
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskState, setTaskState] = useState<'intro' | 'demo' | 'interaction' | 'success' | 'retry' | 'enjoyment'>('intro');
  const [userAnswerGiven, setUserAnswerGiven] = useState(false);
  const [enjoymentSelected, setEnjoymentSelected] = useState<string | null>(null);

  const currentTask: JuniorTask = level.tasks[currentTaskIndex] || level.tasks[0];

  const playAudioFeedback = (type: 'correct' | 'retry' | 'start') => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(
        type === 'correct' ? currentTask.correctMessage[language] : type === 'retry' ? currentTask.retryMessage[language] : currentTask.instruction[language]
      );
      msg.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      window.speechSynthesis.speak(msg);
    }
  };

  const handleStartTask = () => {
    setTaskState('demo');
    playAudioFeedback('start');
    setTimeout(() => {
      setTaskState('interaction');
    }, 2000);
  };

  const handleValidateAnswer = (isCorrect: boolean) => {
    setUserAnswerGiven(true);
    if (isCorrect) {
      setTaskState('success');
      playAudioFeedback('correct');
      if (!progress.completedActivityIds.includes(currentTask.id)) {
        const updated = {
          ...progress,
          completedActivityIds: [...progress.completedActivityIds, currentTask.id],
          starsEarned: progress.starsEarned + 1,
        };
        onUpdateProgress(updated);
      }
    } else {
      setTaskState('retry');
      playAudioFeedback('retry');
    }
  };

  const handleNextStep = () => {
    if (currentTaskIndex < level.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setTaskState('intro');
      setUserAnswerGiven(false);
    } else {
      setTaskState('enjoyment');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-100 dark:border-slate-800 max-w-4xl mx-auto my-8 overflow-hidden">
      {/* Code.org Style Instruction Banner (as requested in user screenshot) */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-red-600 text-white px-3 py-1 rounded-lg">
            {level.title[language]}
          </span>
          <span className="text-sm font-bold text-slate-300">
            {currentTask.title[language]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => playAudioFeedback('start')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700"
            title="Read Instruction"
          >
            <Volume2 className="w-4 h-4 text-red-400" />
            <span>{isAr ? 'استماع' : 'Audio'}</span>
          </button>
          <button
            onClick={onBackToMap}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            {isAr ? '← الخريطة' : '← Map'}
          </button>
        </div>
      </div>

      {/* Code.org Style Top Instruction Box */}
      <div className="bg-white dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            💡
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
              {currentTask.instruction[language]}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'اتبع الإرشادات وأكمل المهمة بنجاح.' : 'Follow instructions and complete the task successfully.'}
            </p>
          </div>
        </div>

        {/* Action Controls matching Code.org style */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => playAudioFeedback('start')}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              title="Play Audio"
            >
              <Volume2 className="w-5 h-5 text-red-600" />
            </button>
            <button
              onClick={() => setTaskState('demo')}
              className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              title="Video Hint"
            >
              <Video className="w-5 h-5 text-indigo-600" />
            </button>
          </div>

          {taskState === 'intro' && (
            <button
              onClick={handleStartTask}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md text-sm transition-colors"
            >
              {isAr ? 'حسناً (Got it)' : "Got it / Let's go"}
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Step 1: Introduction */}
        {taskState === 'intro' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-950 text-red-600 rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-inner animate-bounce">
              🤖
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
              {currentTask.instruction[language]}
            </p>
            <button
              onClick={handleStartTask}
              className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl text-lg flex items-center gap-2 mx-auto"
            >
              <Play className="w-5 h-5" />
              <span>{isAr ? 'ابدأ المهمة الآن' : 'Start Task Now'}</span>
            </button>
          </div>
        )}

        {/* Step 2: Demonstration */}
        {taskState === 'demo' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse">
              👁️
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">
              {isAr ? 'شاهد الروبوت يوضح الطريقة...' : 'Watch robot demonstrate...'}
            </h4>
            <p className="text-xs text-slate-500">
              {isAr ? 'جاري التحضير لتجربتك...' : 'Preparing your turn...'}
            </p>
          </div>
        )}

        {/* Step 3 & 4: Child Interaction & Validation */}
        {taskState === 'interaction' && (
          <div className="space-y-6 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                <button
                  onClick={() => handleValidateAnswer(true)}
                  className="w-36 h-36 bg-amber-400 hover:bg-amber-500 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl animate-bounce cursor-pointer gap-2"
                >
                  <span>⭐</span>
                  <span className="text-xs font-black text-slate-900">{isAr ? 'انقر هنا' : 'Click Here'}</span>
                </button>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleValidateAnswer(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-sm"
                  >
                    {isAr ? '✅ إنجاز المهمة (نجاح)' : '✅ Complete Task (Success)'}
                  </button>
                  <button
                    onClick={() => handleValidateAnswer(false)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-md text-sm"
                  >
                    {isAr ? '❌ محاولة خاطئة (اختبار)' : '❌ Incorrect Test'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success Feedback */}
        {taskState === 'success' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">
              🎉
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentTask.correctMessage[language]}
            </h4>
            <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full font-bold text-sm">
              <Star className="w-5 h-5 fill-current" />
              <span>+{currentTask.xpReward} XP</span>
            </div>
            <div>
              <button
                onClick={handleNextStep}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl"
              >
                {isAr ? 'المهمة التالية ←' : 'Next Task →'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Retry Feedback */}
        {taskState === 'retry' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              💪
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {currentTask.retryMessage[language]}
            </h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              💡 {currentTask.hintMessage[language]}
            </div>
            <div>
              <button
                onClick={() => setTaskState('interaction')}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl"
              >
                {isAr ? 'حاول مرة أخرى 🔄' : 'Try Again 🔄'}
              </button>
            </div>
          </div>
        )}

        {/* Enjoyment Rating Prompt */}
        {taskState === 'enjoyment' && (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-950 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl">
              ⭐
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? 'انبسطت في اللعبة؟' : 'Did you enjoy the game?'}
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
              <button
                onClick={() => setEnjoymentSelected('not_really')}
                className={`p-4 rounded-2xl border font-bold text-sm flex flex-col items-center gap-2 ${enjoymentSelected === 'not_really' ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-slate-800'}`}
              >
                <span className="text-3xl">🙁</span>
                <span>{isAr ? 'مش حاببها' : "Didn't enjoy"}</span>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={onBackToMap}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl"
              >
                {isAr ? 'إنهاء المستوى العودة للخرائط 🏆' : 'Complete Level & Return to Map 🏆'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
