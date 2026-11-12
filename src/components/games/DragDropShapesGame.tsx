import React, { useState } from 'react';
import { CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Language } from '../../types';

interface DragDropShapesGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

export const DragDropShapesGame: React.FC<DragDropShapesGameProps> = ({ language, onSuccess }) => {
  const isAr = language === 'ar';
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const items = [
    { id: 'shape-1', name: { ar: 'دائرة حمراء 🔴', en: 'Red Circle 🔴' } },
    { id: 'shape-2', name: { ar: 'مربع أزرق 🟦', en: 'Blue Square 🟦' } },
    { id: 'shape-3', name: { ar: 'نجمة ذهبية ⭐', en: 'Golden Star ⭐' } },
  ];

  const handleDropItem = (id: string) => {
    if (!placedItems.includes(id)) {
      const updated = [...placedItems, id];
      setPlacedItems(updated);
      if (updated.length === items.length) {
        setSuccess(true);
        onSuccess(3);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {isAr ? 'لعبة السحب والإفلات السحرية' : 'Magic Drag and Drop Game'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
        {isAr ? 'اضغط على الأشكال لسحبها إلى مكانها الصحيح!' : 'Click or tap shapes to place them correctly!'}
      </p>

      {!success ? (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-4">
            {items.map((item) => {
              const isPlaced = placedItems.includes(item.id);
              if (isPlaced) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleDropItem(item.id)}
                  className="bg-red-50 dark:bg-red-950/60 border-2 border-red-300 dark:border-red-800 hover:scale-105 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl font-black text-lg shadow-md transition-all cursor-pointer"
                >
                  {item.name[language]}
                </button>
              );
            })}
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40">
            <h4 className="text-sm font-bold text-slate-500 mb-4">
              {isAr ? 'منطقة الهدف المخصص 👇' : 'Target Drop Zone 👇'}
            </h4>
            <div className="flex flex-wrap justify-center gap-3 min-h-[60px] items-center">
              {placedItems.length === 0 ? (
                <span className="text-slate-400 text-sm italic">
                  {isAr ? 'اسحب الأشكال هنا...' : 'Drop items here...'}
                </span>
              ) : (
                placedItems.map((id) => {
                  const itm = items.find((i) => i.id === id);
                  return (
                    <span
                      key={id}
                      className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 animate-bounce"
                    >
                      <span>✅</span>
                      <span>{itm?.name[language]}</span>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            🏆
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'رائع جداً! أتممت مهارة السحب بنجاح' : 'Amazing! Drag & Drop completed successfully'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isAr ? 'لقد ربحت 3 نجوم!' : 'You earned 3 stars!'}
          </p>
        </div>
      )}
    </div>
  );
};
