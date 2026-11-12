import React, { useState } from 'react';
import { MousePointer, Puzzle, Compass, Map, Cpu, Wrench, Repeat, Sparkles, Star, Play, Award } from 'lucide-react';
import { Language, StudentProgress } from '../types';
import { juniorChaptersData, JuniorChapter, JuniorGame, JuniorLevel } from '../data/juniorCurriculumData';
import { JuniorTaskRunner } from './JuniorTaskRunner';
import { MouseExplorerGamePlayer } from './MouseExplorerGamePlayer';
import { JigsawGameEngine } from './JigsawGameEngine';

interface JuniorCurriculumViewProps {
  language: Language;
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
}

export const JuniorCurriculumView: React.FC<JuniorCurriculumViewProps> = ({
  language,
  progress,
  onUpdateProgress,
}) => {
  const isAr = language === 'ar';
  const [selectedChapter, setSelectedChapter] = useState<JuniorChapter | null>(null);
  const [activeLevel, setActiveLevel] = useState<JuniorLevel | null>(null);
  const [showMouseExplorer12, setShowMouseExplorer12] = useState<boolean>(false);
  const [showJigsaw12, setShowJigsaw12] = useState<boolean>(false);

  if (showMouseExplorer12) {
    return (
      <MouseExplorerGamePlayer
        language={language}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onExit={() => setShowMouseExplorer12(false)}
      />
    );
  }

  if (showJigsaw12) {
    return (
      <JigsawGameEngine
        language={language}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onExit={() => setShowJigsaw12(false)}
      />
    );
  }

  if (activeLevel) {
    return (
      <JuniorTaskRunner
        language={language}
        level={activeLevel}
        progress={progress}
        onUpdateProgress={onUpdateProgress}
        onBackToMap={() => setActiveLevel(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Junior Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl p-8 text-white shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner">
              🤖
            </div>
            <div>
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {isAr ? 'مسار صغار المبرمجين جونيور (3-6 سنوات)' : 'Smart Coders Junior (Ages 3-6)'}
              </span>
              <h2 className="text-3xl font-black mt-2">
                {isAr ? 'عالم التعلم التفاعلي والألعاب' : 'Interactive Learning & Game World'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {isAr ? '8 فصول تعليمية متكاملة مصممة خصيصاً لمرحلة الطفولة المبكرة.' : '8 integrated learning chapters specially designed for early childhood.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 font-black rounded-xl shadow-md tabular-nums">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xl">{progress.xpEarned ?? progress.starsEarned * 10}</span>
              <span className="text-xs">XP</span>
            </div>
            <button
              onClick={() => setShowMouseExplorer12(true)}
              data-testid="launch-mouse-explorer-btn"
              className="bg-slate-900 hover:bg-black text-white font-black px-5 py-3 rounded-xl shadow-lg text-xs flex items-center gap-2 border border-white/20"
            >
              <MousePointer className="w-4 h-4 text-red-500" />
              <span>{isAr ? 'مستكشف الفأرة (12 مستوى)' : 'Mouse Explorer (12L)'}</span>
            </button>
            <button
              onClick={() => setShowJigsaw12(true)}
              data-testid="launch-jigsaw-btn"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-xl shadow-lg text-xs flex items-center gap-2"
            >
              <Puzzle className="w-4 h-4" />
              <span>{isAr ? 'مغامرات تركيب الصور (12 مستوى)' : 'Jigsaw Adv (12L)'}</span>
            </button>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {juniorChaptersData.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 cursor-pointer transition-all transform hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center font-bold mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {chapter.chapterNumber}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {chapter.title[language]}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-6 leading-relaxed">
                  {chapter.description[language]}
                </p>
              </div>

              <div className="flex items-center text-red-600 dark:text-red-400 font-bold text-xs gap-2">
                <span>{isAr ? 'استعراض الألعاب' : 'Explore Games'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chapter Games Modal / Drawer */}
        {selectedChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedChapter.title[language]}
                </h3>
                <button
                  onClick={() => setSelectedChapter(null)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>

              <div className="space-y-6">
                {selectedChapter.chapterNumber === 1 && (
                  <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
                        {isAr ? 'تجربة مستكشف الفأرة الكاملة (12 مستوى)' : 'Complete Mouse Explorer (12 Levels)'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {isAr ? 'ابدأ رحلة المستكشف الكاملة من المستوى 1 إلى 12' : 'Start the complete explorer journey from level 1 to 12'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapter(null);
                        setShowMouseExplorer12(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md"
                    >
                      {isAr ? 'إطلاق اللعبة الكاملة' : 'Launch 12 Levels'}
                    </button>
                  </div>
                )}

                {selectedChapter.chapterNumber === 2 && (
                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                        {isAr ? 'مغامرات تركيب الصور (12 مستوى جيسو)' : 'Jigsaw Adventures (12 Levels)'}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {isAr ? 'ابدأ استوديو الألغاز والتركيب الكامل' : 'Start the complete jigsaw puzzle studio'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedChapter(null);
                        setShowJigsaw12(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md"
                    >
                      {isAr ? 'إطلاق مغامرات الجيسو' : 'Launch Jigsaw Adv'}
                    </button>
                  </div>
                )}

                {selectedChapter.games.map((game) => (
                  <div key={game.id} className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                      {game.title[language]}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {game.description[language]}
                    </p>

                    <div className="space-y-3">
                      {game.levels.map((lvl) => (
                        <div key={lvl.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <span className="font-bold text-sm text-slate-800 dark:text-white">
                            {lvl.title[language]}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedChapter(null);
                              setActiveLevel(lvl);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1 shadow-md"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>{isAr ? 'ابدأ اللعب' : 'Play Level'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
