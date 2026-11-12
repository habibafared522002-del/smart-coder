import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { Language } from '../../types';

interface SafeChoicesGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

export const SafeChoicesGame: React.FC<SafeChoicesGameProps> = ({ language, onSuccess }) => {
  const isAr = language === 'ar';
  const [currentScenario, setCurrentScenario] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const scenarios = [
    {
      id: 1,
      title: {
        ar: 'تلقيت رسالة من شخص غريب يطلب كلمة المرور الخاصة بك!',
        en: 'You received a message from a stranger asking for your password!',
      },
      safeChoice: false, // clicking Accept is unsafe
      safeOptionText: { ar: 'إخبار الكبار وحظر الغريب 🛡️', en: 'Tell adult and block stranger 🛡️' },
      unsafeOptionText: { ar: 'إعطاؤهم كلمة المرور ❌', en: 'Give them password ❌' },
      explanation: {
        ar: 'رائع! لا نترك كلمات المرور لأي شخص أبداً ونخبر الوالدين أو المعلم.',
        en: 'Awesome! Never share passwords and always tell parents or teachers.',
      }
    },
    {
      id: 2,
      title: {
        ar: 'تريد اللعب بلعبة تعليمية مفيدة على كمبيوتر سمارت تك.',
        en: 'You want to play an educational learning game on SmartTech computer.',
      },
      safeChoice: true,
      safeOptionText: { ar: 'اللعب بوقت محدد وبإشراف الكبار ⭐', en: 'Play with time limit & adult supervision ⭐' },
      unsafeOptionText: { ar: 'اللعب طوال الليل بدون توقف ❌', en: 'Play all night without stopping ❌' },
      explanation: {
        ar: 'ممتاز! استخدام التكنولوجيا بوقت محدد ونشاط مفيد هو السلوك الذكي الصحيح.',
        en: 'Excellent! Using technology with a time limit and useful activities is smart behavior.'
      }
    }
  ];

  const handleChoice = (isSafeSelected: boolean) => {
    const current = scenarios[currentScenario];
    // In scenario 1: safe option is choice 0 (Tell adult), unsafe is choice 1.
    // Let's make it simpler: clicking the correct safe choice advances.
    const isCorrect = (current.safeChoice && isSafeSelected) || (!current.safeChoice && !isSafeSelected);

    if (isCorrect) {
      setFeedback(current.explanation[language]);
      setScore(score + 1);
      setTimeout(() => {
        setFeedback(null);
        if (currentScenario < scenarios.length - 1) {
          setCurrentScenario(currentScenario + 1);
        } else {
          setCompleted(true);
          onSuccess(3);
        }
      }, 1800);
    } else {
      setFeedback(isAr ? '❌ اختيار غير آمن، حاول مرة أخرى!' : '❌ Unsafe choice, try again!');
    }
  };

  const scenario = scenarios[currentScenario];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {isAr ? 'لعبة المواطن الرقمي الآمن' : 'Safe Digital Citizen Game'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
        {isAr ? 'ساعد سمارتي في اتخاذ القرار الصحيح والأمن!' : 'Help Smarty make the safe and right choice!'}
      </p>

      {!completed ? (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {isAr ? `الموقف ${currentScenario + 1} من 2` : `Scenario ${currentScenario + 1} of 2`}
            </span>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-2">
              {scenario.title[language]}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleChoice(true)}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800 transition-all flex flex-col items-center gap-2 shadow-sm"
            >
              <span className="text-2xl">🛡️</span>
              <span className="text-sm">{scenario.safeOptionText[language]}</span>
            </button>
            <button
              onClick={() => handleChoice(false)}
              className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-800 dark:text-red-200 font-bold border border-red-200 dark:border-red-800 transition-all flex flex-col items-center gap-2 shadow-sm"
            >
              <span className="text-2xl">⚠️</span>
              <span className="text-sm">{scenario.unsafeOptionText[language]}</span>
            </button>
          </div>

          {feedback && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-bold text-sm animate-bounce">
              {feedback}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            ⭐
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'تهانينا! أصبحت مواطناً رقمياً ذكياً' : 'Congratulations! You are a Smart Digital Citizen'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isAr ? 'لقد ربحت 3 نجوم جديدة!' : 'You earned 3 new stars!'}
          </p>
        </div>
      )}
    </div>
  );
};
