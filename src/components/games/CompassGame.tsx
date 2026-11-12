import React, { useState } from 'react';
import { Compass, CheckCircle2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Language } from '../../types';

interface CompassGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

export const CompassGame: React.FC<CompassGameProps> = ({ language, onSuccess }) => {
  const isAr = language === 'ar';
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null>(null);
  const [success, setSuccess] = useState(false);

  const targetDir = 'RIGHT';

  const handleSelectDir = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    setDirection(dir);
    if (dir === targetDir) {
      setSuccess(true);
      onSuccess(5);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {isAr ? 'لعبة بوصلة المغامرة' : 'Adventure Compass Game'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
        {isAr ? 'الكنز موجود في اتجاه اليمين (Right)! أي سهم تختار؟' : 'The treasure is to the RIGHT! Which arrow do you choose?'}
      </p>

      {!success ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <button
              onClick={() => handleSelectDir('UP')}
              className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-sm"
            >
              <ArrowUp className="w-6 h-6" />
              <span className="text-xs">UP (أمام)</span>
            </button>
            <button
              onClick={() => handleSelectDir('DOWN')}
              className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-sm"
            >
              <ArrowDown className="w-6 h-6" />
              <span className="text-xs">DOWN (خلف)</span>
            </button>
            <button
              onClick={() => handleSelectDir('LEFT')}
              className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-xs">LEFT (يسار)</span>
            </button>
            <button
              onClick={() => handleSelectDir('RIGHT')}
              className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-2xl font-bold flex flex-col items-center gap-2 transition-all shadow-sm"
            >
              <ArrowRight className="w-6 h-6" />
              <span className="text-xs">RIGHT (يمين)</span>
            </button>
          </div>

          {direction && direction !== targetDir && (
            <div className="text-red-600 font-bold text-sm">
              {isAr ? '❌ ليس هذا الاتجاه الصحيح، حاول مرة أخرى!' : '❌ Not the correct direction, try again!'}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            ⭐
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'إجابة صحيحة! عثرت على الكنز' : 'Correct! You found the treasure'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isAr ? 'لقد ربحت 5 نجوم!' : 'You earned 5 stars!'}
          </p>
        </div>
      )}
    </div>
  );
};
