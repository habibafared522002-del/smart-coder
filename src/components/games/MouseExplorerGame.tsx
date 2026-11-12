import React, { useState } from 'react';
import { MousePointer, CheckCircle2, Star } from 'lucide-react';
import { Language } from '../../types';

interface MouseExplorerGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

export const MouseExplorerGame: React.FC<MouseExplorerGameProps> = ({ language, onSuccess }) => {
  const isAr = language === 'ar';
  const [targetClicked, setTargetClicked] = useState(false);

  const handleClickTarget = () => {
    setTargetClicked(true);
    onSuccess(4);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <MousePointer className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {isAr ? 'لعبة مستكشف الفأرة (Mouse Explorer)' : 'Mouse Explorer Game'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
        {isAr ? 'حرّك مؤشر الفأرة أو إصبعك واضغط على النجمة الذهبية الظاهرة!' : 'Move your pointer or finger and click the golden star!'}
      </p>

      {!targetClicked ? (
        <div className="h-64 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 relative flex items-center justify-center">
          <button
            onClick={handleClickTarget}
            className="absolute top-12 left-16 animate-bounce bg-amber-400 hover:bg-amber-500 text-slate-900 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-transform hover:scale-110 cursor-pointer"
            title="Click Me!"
          >
            ⭐
          </button>
          <span className="text-xs text-slate-400">
            {isAr ? 'ابحث عن النجمة واضغط عليها داخل الصندوق!' : 'Find the star inside the box and click it!'}
          </span>
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            🏆
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'رائع جداً! أتقنت مهارة النقر والتحكم' : 'Wonderful! Mastered clicking and pointer control'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isAr ? 'لقد ربحت 4 نجوم!' : 'You earned 4 stars!'}
          </p>
        </div>
      )}
    </div>
  );
};
