import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Star } from 'lucide-react';
import { Language } from '../../types';

interface PuzzleStudioGameProps {
  language: Language;
  onSuccess: (stars: number) => void;
}

export const PuzzleStudioGame: React.FC<PuzzleStudioGameProps> = ({ language, onSuccess }) => {
  const isAr = language === 'ar';
  const [placedPieces, setPlacedPieces] = useState<number[]>([]);
  const totalPieces = 3;

  const handlePlacePiece = (pieceIdx: number) => {
    if (!placedPieces.includes(pieceIdx)) {
      const updated = [...placedPieces, pieceIdx];
      setPlacedPieces(updated);
      if (updated.length === totalPieces) {
        onSuccess(5);
      }
    }
  };

  const isCompleted = placedPieces.length === totalPieces;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
        {isAr ? 'استوديو الصور المقطعة (Puzzle Studio)' : 'Puzzle Studio Game'}
      </h3>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
        {isAr ? 'اسحب قطع الصورة وركبها في مكانها الصحيح لتكتمل الصورة!' : 'Drag puzzle pieces into their correct spots to complete the picture!'}
      </p>

      {!isCompleted ? (
        <div className="space-y-6">
          {/* Puzzle board slots */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border-2 border-dashed border-red-300 dark:border-red-900 min-h-[140px] items-center justify-center">
            {[0, 1, 2].map((slot) => {
              const placed = placedPieces.includes(slot);
              return (
                <div
                  key={slot}
                  className={`h-24 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                    placed
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  {placed ? `✅ ${isAr ? 'قطعة ' : 'Piece '}${slot + 1}` : `📍 ${isAr ? 'مكان ' : 'Slot '}${slot + 1}`}
                </div>
              );
            })}
          </div>

          {/* Tray of pieces */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2].map((pieceIdx) => {
              const isPlaced = placedPieces.includes(pieceIdx);
              if (isPlaced) return null;
              return (
                <button
                  key={pieceIdx}
                  onClick={() => handlePlacePiece(pieceIdx)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  🧩 {isAr ? 'قطعة رقم ' : 'Piece #'}{pieceIdx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-8 space-y-4">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl">
            🏆
          </div>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? 'أحسنت! اكتملت الصورة بنجاح' : 'Amazing! Puzzle completed successfully'}
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {isAr ? 'لقد ربحت 5 نجوم!' : 'You earned 5 stars!'}
          </p>
        </div>
      )}
    </div>
  );
};
