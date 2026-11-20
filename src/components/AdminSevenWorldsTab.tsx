import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Globe2, HelpCircle, Users, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { ChildProfileRecord, loadChildProfiles } from '../data/ageGamesData';
import { loadChapterLibraries, loadChildChapterProgress } from '../data/chapterGameLibraryData';
import {
  AWARDABLE_BADGES,
  EducationalWorldId,
  SEVEN_EDUCATIONAL_WORLDS,
  WORLD_ASSESSMENT_QUESTIONS,
  computeWorldMasteryPct,
  loadChildPlatformState,
} from '../data/sevenWorldsPlatformData';

interface AdminSevenWorldsTabProps {
  language: Language;
}

export const AdminSevenWorldsTab: React.FC<AdminSevenWorldsTabProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [selectedWorldId, setSelectedWorldId] = useState<EducationalWorldId>('world_digital');
  const [children, setChildren] = useState<ChildProfileRecord[]>(() => loadChildProfiles());
  const [chapterLibraries] = useState(() => loadChapterLibraries());

  useEffect(() => {
    const sync = () => setChildren(loadChildProfiles());
    window.addEventListener('smartcoders:children-updated', sync);
    window.addEventListener('smartcoders:whole-child-updated', sync);
    return () => {
      window.removeEventListener('smartcoders:children-updated', sync);
      window.removeEventListener('smartcoders:whole-child-updated', sync);
    };
  }, []);

  const selectedWorld =
    SEVEN_EDUCATIONAL_WORLDS.find((w) => w.id === selectedWorldId) || SEVEN_EDUCATIONAL_WORLDS[0];
  const worldQuestions = WORLD_ASSESSMENT_QUESTIONS.filter((q) => q.worldId === selectedWorldId);

  return (
    <div className="space-y-8" data-testid="admin-seven-worlds-panel">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-violet-600" />
          <span>
            {isAr
              ? 'خريطة العوالم التعليمية السبعة وبنك التقييمات والأوسمة'
              : 'Seven Educational Worlds, Assessments & Badges Overview'}
          </span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isAr
            ? 'مراجعة ارتباط الفصول الثمانية والوحدات التخصصية وبنك أسئلة كل عالم ونتائج الأطفال الفعلية.'
            : 'Inspect chapter mappings, specialized modules, assessment questions, badges, and live student quiz performance.'}
        </p>
      </div>

      {/* 7 Worlds Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEVEN_EDUCATIONAL_WORLDS.map((w) => {
          const isSelected = w.id === selectedWorldId;
          const qCount = WORLD_ASSESSMENT_QUESTIONS.filter((q) => q.worldId === w.id).length;
          return (
            <button
              key={w.id}
              type="button"
              data-testid={`admin-world-card-${w.id}`}
              onClick={() => setSelectedWorldId(w.id)}
              className={`p-4 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                isSelected
                  ? 'border-violet-600 bg-violet-50/70 dark:bg-violet-950/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-2xl">{w.icon}</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-black">
                  {qCount} {isAr ? 'أسئلة' : 'Quiz Qs'}
                </span>
              </div>
              <div className="font-black text-sm text-slate-900 dark:text-white">
                {w.title[language]}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {w.mappedChapterIds.length > 0
                  ? isAr
                    ? `الفصول المدمجة: ${w.mappedChapterIds.join('، ')}`
                    : `Mapped Chapters: ${w.mappedChapterIds.join(', ')}`
                  : isAr
                  ? `وحدات متخصصة (${w.specializedModules.length})`
                  : `Specialized Modules (${w.specializedModules.length})`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected World Detail + Questions Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-violet-600" />
              <span>
                {selectedWorld.icon} {selectedWorld.title[language]} —{' '}
                {isAr ? 'بنك أسئلة التقييم' : 'Assessment Bank'}
              </span>
            </h4>
            <span className="text-xs font-bold text-slate-500">
              {worldQuestions.length} {isAr ? 'أسئلة' : 'questions'}
            </span>
          </div>

          <div className="space-y-3">
            {worldQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-violet-600 dark:text-violet-400">
                    #{idx + 1} · {q.skillTag[language]}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-bold text-[10px]">
                    {q.minAgeGroup}+
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {q.visualCue} {q.prompt[language]}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {q.options.map((opt) => (
                    <span
                      key={opt.id}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                        opt.id === q.correctOptionId
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-800 dark:text-emerald-200'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {opt.icon} {opt.label[language]}
                      {opt.id === q.correctOptionId && ' ✓'}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Badges Catalog & Live Student Scores for Selected World */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'أداء الطلاب في هذا العالم' : 'Student Scores in Selected World'}</span>
            </h4>
            <div className="space-y-2.5">
              {children.map((child) => {
                const pState = loadChildPlatformState(child.id);
                const chProg = loadChildChapterProgress(child.id);
                const mastery = computeWorldMasteryPct(
                  selectedWorld,
                  chProg,
                  pState,
                  chapterLibraries
                );
                const assess = pState.assessmentsByWorld[selectedWorldId];
                return (
                  <div
                    key={child.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{child.avatarEmoji}</span>
                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white">
                          {child.name[language]}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {assess
                            ? isAr
                              ? `تقييم: ${assess.scorePct}%`
                              : `Quiz: ${assess.scorePct}%`
                            : isAr
                            ? 'لم يختبر بعد'
                            : 'Not quizzed'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black tabular-nums">
                      {mastery.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'دليل الأوسمة المعتمدة' : 'Awardable Badges Catalog'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AWARDABLE_BADGES.map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs flex items-center gap-2"
                >
                  <span className="text-lg">{b.icon}</span>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 dark:text-white truncate">
                      {b.title[language]}
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-300">
                      +{b.xpBonus} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
