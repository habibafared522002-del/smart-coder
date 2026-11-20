import React, { useState, useEffect, useMemo } from 'react';
import { Star, Search, Award, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { Language, Program, StudentProgress } from '../types';
import { translations } from '../locales/translations';
import { ChildProfileRecord, loadChildProfiles } from '../data/ageGamesData';
import { loadChapterLibraries, loadChildChapterProgress } from '../data/chapterGameLibraryData';
import {
  SEVEN_EDUCATIONAL_WORLDS,
  computeWorldMasteryPct,
  getSummarizedChildMastery,
  loadChildPlatformState,
} from '../data/sevenWorldsPlatformData';

interface TeacherDashboardProps {
  language: Language;
  programs: Program[];
  progress: StudentProgress;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  language,
  programs: _programs,
  progress: _progress,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  const [children, setChildren] = useState<ChildProfileRecord[]>(() => loadChildProfiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => children[0]?.id || 'child-1'
  );
  const [chapterLibraries] = useState(() => loadChapterLibraries());
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const syncAll = () => {
      setChildren(loadChildProfiles());
      setRefreshTick((tick) => tick + 1);
    };
    window.addEventListener('smartcoders:children-updated', syncAll);
    window.addEventListener('smartcoders:whole-child-updated', syncAll);
    window.addEventListener('smartcoders:chapter-progress-updated', syncAll);
    return () => {
      window.removeEventListener('smartcoders:children-updated', syncAll);
      window.removeEventListener('smartcoders:whole-child-updated', syncAll);
      window.removeEventListener('smartcoders:chapter-progress-updated', syncAll);
    };
  }, []);

  const enrichedRows = useMemo(() => {
    void refreshTick;
    return children.map((child) => {
      const platformState = loadChildPlatformState(child.id);
      const chapterProg = loadChildChapterProgress(child.id);
      const summary = getSummarizedChildMastery(child);

      let completedChapterLevels = 0;
      Object.values(chapterProg.games).forEach((g) => {
        completedChapterLevels += g.completedLevels.length;
      });

      const worldMasteries = SEVEN_EDUCATIONAL_WORLDS.map((w) => ({
        world: w,
        stats: computeWorldMasteryPct(w, chapterProg, platformState, chapterLibraries),
      }));

      return {
        child,
        platformState,
        chapterProg,
        summary,
        completedChapterLevels,
        worldMasteries,
      };
    });
  }, [children, chapterLibraries, refreshTick]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrichedRows;
    return enrichedRows.filter(
      (r) =>
        r.child.name.ar.toLowerCase().includes(q) ||
        r.child.name.en.toLowerCase().includes(q) ||
        r.child.ageGroup.includes(q)
    );
  }, [enrichedRows, searchQuery]);

  const selectedDetail =
    enrichedRows.find((r) => r.child.id === selectedStudentId) || enrichedRows[0];

  const totalAssessmentsDone = enrichedRows.reduce(
    (sum, r) => sum + r.summary.assessmentsCount,
    0
  );

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8"
      data-testid="teacher-dashboard-view"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {isAr ? 'لوحة متابعة المعلم الذكية' : 'Teacher Analytics & Class Monitoring'}
            </span>
            <h2 className="text-3xl font-black mt-2">
              {isAr ? 'متابعة الفصول وتقارير الأطفال الحقيقية' : 'Classes & Live Student Monitoring'}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {isAr
                ? 'استعراض التقدم الفعلي لكل طفل عبر العوالم السبعة، مستويات الفصول، ونتائج التقييمات التكيفية.'
                : 'Live per-student progress across the Seven Worlds, chapter levels, badges, and adaptive pace.'}
            </p>
          </div>
          <div className="flex gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="block text-2xl font-black tabular-nums">{children.length}</span>
              <span className="text-xs text-white/80">{isAr ? 'حسابات الأطفال' : 'Student Profiles'}</span>
            </div>
            <div className="border-r border-white/20 px-2"></div>
            <div>
              <span className="block text-2xl font-black tabular-nums">{totalAssessmentsDone}</span>
              <span className="text-xs text-white/80">{isAr ? 'تقييمات منجزة' : 'Assessments'}</span>
            </div>
          </div>
        </div>

        {/* Classes & Student Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Student List & Live Search */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'قائمة الطلاب وتقرير الإتقان الحي' : 'Live Student Progress Report'}
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  data-testid="teacher-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    <th className="pb-3 text-start">{isAr ? 'الطالب' : 'Student'}</th>
                    <th className="pb-3 text-start">{isAr ? 'المستوى العمري' : 'Age Tier'}</th>
                    <th className="pb-3 text-start">{isAr ? 'إتقان العوالم' : 'Mastery'}</th>
                    <th className="pb-3 text-start">{isAr ? 'مراحل الفصول' : 'Chapter Lvls'}</th>
                    <th className="pb-3 text-start">{isAr ? 'النقاط والنجوم' : 'XP & Stars'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRows.map((row) => {
                    const isSelected = row.child.id === selectedDetail.child.id;
                    return (
                      <tr
                        key={row.child.id}
                        data-testid={`teacher-student-row-${row.child.id}`}
                        onClick={() => setSelectedStudentId(row.child.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-50/80 dark:bg-amber-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <span className="text-xl">{row.child.avatarEmoji}</span>
                          <div>
                            <div>{row.child.name[language]}</div>
                            <div className="text-[11px] text-slate-500">
                              {row.summary.assessmentsCount}/7 {isAr ? 'تقييمات' : 'quizzes'} ·{' '}
                              {row.summary.creativeProjectsCount} {isAr ? 'مشاريع' : 'projects'}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {row.child.ageGroup} {isAr ? 'سنوات' : 'yrs'}
                        </td>
                        <td className="py-4">
                          <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full text-xs font-black tabular-nums">
                            {row.summary.overallPct}%
                          </span>
                        </td>
                        <td className="py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {row.completedChapterLevels} {isAr ? 'مرحلة' : 'lvls'}
                        </td>
                        <td className="py-4 font-bold text-amber-600 dark:text-amber-400 tabular-nums text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{row.child.progress.starsEarned}</span>
                            <span className="text-slate-400">·</span>
                            <span>{row.child.progress.xpEarned ?? 0} XP</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Student 7-World Insights & Reinforcement Panel */}
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5"
            data-testid="teacher-student-detail-panel"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedDetail.child.avatarEmoji}</span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedDetail.child.name[language]}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {selectedDetail.summary.badgesCount} {isAr ? 'أوسمة' : 'badges'} ·{' '}
                    {selectedDetail.summary.completedModulesCount}{' '}
                    {isAr ? 'وحدات منجزة' : 'modules done'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black tabular-nums">
                {selectedDetail.summary.overallPct}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'تقدم العوالم السبعة ووضع التكيّف:' : '7-World Mastery & Adaptive Pace:'}</span>
              </div>
              {selectedDetail.worldMasteries.map(({ world, stats }) => (
                <div key={world.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                      {world.icon} {world.title[language]}
                    </span>
                    <span className="font-black text-slate-600 dark:text-slate-400 shrink-0 ms-2 tabular-nums">
                      {stats.pct}% ·{' '}
                      {stats.paceMode === 'challenge_boost'
                        ? '⚡'
                        : stats.paceMode === 'simplify'
                        ? '🌱'
                        : '✓'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${world.gradient} rounded-full`}
                      style={{ width: `${stats.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{isAr ? 'توصية التعزيز التربوية:' : 'Recommended Reinforcement:'}</span>
              </div>
              {selectedDetail.summary.needsPractice.length > 0 ? (
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {isAr
                    ? `يُنصح بمراجعة أنشطة: ${selectedDetail.summary.needsPractice
                        .map((n) => n.ar)
                        .join('، ')}`
                    : `Focus next practice on: ${selectedDetail.summary.needsPractice
                        .map((n) => n.en)
                        .join(', ')}`}
                </p>
              ) : (
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'أداء متوازن! يمكن ترشيح تحديات STEM أو استوديو المشاريع الإبداعية.'
                      : 'Balanced progress! Ready for STEM labs or Creative Story Studio.'}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
