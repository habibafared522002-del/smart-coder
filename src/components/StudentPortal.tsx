import React, { useState } from 'react';
import { Award, Star, Play, CheckCircle2, BookOpen, Compass, Cpu, Laptop, ListOrdered, Repeat, GitBranch, Wrench, Sparkles, Volume2 } from 'lucide-react';
import { Language, Program, StudentProgress, Lesson } from '../types';
import { translations } from '../locales/translations';
import { RobotMazeGame } from './RobotMazeGame';
import { SafeChoicesGame } from './games/SafeChoicesGame';
import { DragDropShapesGame } from './games/DragDropShapesGame';
import { CompassGame } from './games/CompassGame';
import { MouseExplorerGame } from './games/MouseExplorerGame';
import { PuzzleStudioGame } from './games/PuzzleStudioGame';

interface StudentPortalProps {
  language: Language;
  programs: Program[];
  progress: StudentProgress;
  onUpdateProgress: (newProgress: StudentProgress) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  language,
  programs,
  progress,
  onUpdateProgress,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-1');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [showGame, setShowGame] = useState<boolean>(false);

  const activeProgram = programs[0];
  const activeLevel = activeProgram.levels[0];
  const units = activeLevel.units;

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  const handleCompleteLesson = (lessonId: string, starsEarned: number) => {
    if (!progress.completedLessonIds.includes(lessonId)) {
      const updated = {
        ...progress,
        completedLessonIds: [...progress.completedLessonIds, lessonId],
        starsEarned: progress.starsEarned + starsEarned,
      };
      onUpdateProgress(updated);
    }
  };

  const handleGameSuccess = (stars: number) => {
    if (activeLesson) {
      handleCompleteLesson(activeLesson.id, stars);
    }
  };

  const renderActiveGame = () => {
    if (!activeLesson || activeLesson.activities.length === 0) {
      return <RobotMazeGame language={language} onSuccess={handleGameSuccess} />;
    }
    const actType = activeLesson.activities[0].type;
    if (actType === 'safe_choices') {
      return <SafeChoicesGame language={language} onSuccess={handleGameSuccess} />;
    }
    if (actType === 'mouse_explorer') {
      return <MouseExplorerGame language={language} onSuccess={handleGameSuccess} />;
    }
    if (actType === 'puzzle_studio') {
      return <PuzzleStudioGame language={language} onSuccess={handleGameSuccess} />;
    }
    if (actType === 'drag_drop_shapes') {
      return <DragDropShapesGame language={language} onSuccess={handleGameSuccess} />;
    }
    if (actType === 'compass_game') {
      return <CompassGame language={language} onSuccess={handleGameSuccess} />;
    }
    return <RobotMazeGame language={language} onSuccess={handleGameSuccess} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Child Friendly Header & Stats */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl p-8 text-white shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner">
              🤖
            </div>
            <div>
              <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                {isAr ? 'مسار صغار المبرمجين (Junior - Course A)' : 'Smart Coders Junior (Course A)'}
              </span>
              <h2 className="text-3xl font-black mt-2">
                {isAr ? 'مرحباً بك يا بطل البرمجة!' : 'Welcome, Coding Hero!'}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {isAr ? 'استمر في استكشاف الدروس وحل الألغاز لكسب النجوم والأوسمة.' : 'Keep exploring lessons and solving puzzles to earn stars and badges.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-400 text-slate-900 font-black rounded-xl shadow-md">
              <Star className="w-5 h-5 fill-current" />
              <span className="text-xl">{progress.starsEarned}</span>
              <span className="text-xs">{t.stars}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-black rounded-xl shadow-md">
              <Award className="w-5 h-5" />
              <span>{progress.badges.length}</span>
              <span className="text-xs">{t.badges}</span>
            </div>
          </div>
        </div>

        {/* Active Lesson Modal / Viewer */}
        {activeLesson ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-red-100 dark:border-slate-800 mb-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
                  {currentUnit.title[language]}
                </span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {activeLesson.title[language]}
                </h3>
              </div>
              <button
                onClick={() => {
                  setActiveLesson(null);
                  setShowGame(false);
                }}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-sm hover:bg-slate-200"
              >
                {isAr ? '← العودة للوحدات' : 'Back to Units →'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Explanation Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                      {isAr ? '📖 قصة الدرس والشرح' : '📖 Lesson Story & Explanation'}
                    </h4>
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(activeLesson.explanation[language]);
                          u.lang = language === 'ar' ? 'ar-SA' : 'en-US';
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-red-700"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{t.audioNarration}</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                    {activeLesson.explanation[language]}
                  </p>
                </div>

                {/* Objectives */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-800 dark:text-white text-md mb-3">
                    {t.learningObjectives}
                  </h4>
                  <ul className="space-y-2">
                    {activeLesson.objectives[language].map((obj, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar Actions & Game Trigger */}
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-950/40 p-6 rounded-2xl border border-red-200 dark:border-red-900 text-center">
                  <span className="text-4xl mb-3 block">⭐</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    {isAr ? 'جائزة إكمال الدرس' : 'Lesson Reward'}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    +{activeLesson.starsReward} {t.stars}
                  </p>
                  <button
                    onClick={() => {
                      handleCompleteLesson(activeLesson.id, activeLesson.starsReward);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 px-6 rounded-xl shadow-lg transition-colors"
                  >
                    {progress.completedLessonIds.includes(activeLesson.id)
                      ? isAr ? '✅ تم إكمال الدرس' : '✅ Lesson Completed'
                      : isAr ? 'إكمال الدرس والحصول على النجوم' : 'Complete Lesson & Earn Stars'}
                  </button>
                </div>

                {/* Interactive Activity Trigger */}
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-center">
                  <span className="text-4xl mb-3 block">🎮</span>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    {activeLesson.activities[0]?.title[language] || (isAr ? 'النشاط التفاعلي' : 'Interactive Activity')}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                    {isAr ? 'العب اللعبة التفاعلية الخاصة بهذا الدرس.' : 'Play the interactive game for this lesson.'}
                  </p>
                  <button
                    onClick={() => setShowGame(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>{t.playActivity}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Game Activity Modal */}
            {showGame && (
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeLesson.activities[0]?.title[language]}
                  </h4>
                  <button
                    onClick={() => setShowGame(false)}
                    className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950 px-3 py-1.5 rounded-lg"
                  >
                    {isAr ? 'إغلاق اللعبة' : 'Close Game'}
                  </button>
                </div>
                {renderActiveGame()}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Units Tabs / Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {isAr ? 'وحدات منهج جونيور (Ages 3-6) - اختر وحدة للبدء' : 'Junior Units (Ages 3-6) - Select a unit'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {units.map((unit) => {
                  const isSelected = unit.id === selectedUnitId;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => setSelectedUnitId(unit.id)}
                      className={`p-5 rounded-2xl border text-start transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600 shadow-xl scale-105'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-2xl">
                          {unit.code === 'U1' && '🛡️'}
                          {unit.code === 'U2' && '🧭'}
                          {unit.code === 'U3' && '🔄'}
                          {unit.code === 'U4' && '✨'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          {unit.code}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm leading-snug">{unit.title[language]}</h4>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lessons List for Selected Unit */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">{currentUnit.code}</span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {currentUnit.title[language]}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                    {currentUnit.description[language]}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentUnit.lessons.map((lesson) => {
                  const isCompleted = progress.completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:border-red-500 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'}`}>
                            {isCompleted ? (isAr ? 'مكتمل ✅' : 'Completed ✅') : (isAr ? 'متاح للتعلم' : 'Available')}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span>+{lesson.starsReward}</span>
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                          {lesson.title[language]}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                          {lesson.summary[language]}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>{t.startLesson}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
