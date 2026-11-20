import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  Printer,
  Palette,
  BookOpen,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { Language } from '../types';
import { ChildProfileRecord, loadChildProfiles } from '../data/ageGamesData';
import { loadChapterLibraries, loadChildChapterProgress } from '../data/chapterGameLibraryData';
import {
  AWARDABLE_BADGES,
  SEVEN_EDUCATIONAL_WORLDS,
  UNPLUGGED_ACTIVITY_CARDS,
  computeWorldMasteryPct,
  getSummarizedChildMastery,
  loadChildPlatformState,
} from '../data/sevenWorldsPlatformData';

interface ParentDashboardProps {
  language: Language;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [children, setChildren] = useState<ChildProfileRecord[]>(() => loadChildProfiles());
  const [selectedChildId, setSelectedChildId] = useState<string>(() => children[0]?.id || 'child-1');
  const [chapterLibraries] = useState(() => loadChapterLibraries());
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setChildren(loadChildProfiles());
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener('smartcoders:children-updated', refresh);
    window.addEventListener('smartcoders:whole-child-updated', refresh);
    window.addEventListener('smartcoders:chapter-progress-updated', refresh);
    return () => {
      window.removeEventListener('smartcoders:children-updated', refresh);
      window.removeEventListener('smartcoders:whole-child-updated', refresh);
      window.removeEventListener('smartcoders:chapter-progress-updated', refresh);
    };
  }, []);

  const activeChild = useMemo(
    () => children.find((c) => c.id === selectedChildId) || children[0],
    [children, selectedChildId]
  );

  const childSummary = useMemo(() => {
    void refreshTick;
    const platformState = loadChildPlatformState(activeChild.id);
    const chapterProgress = loadChildChapterProgress(activeChild.id);
    const summary = getSummarizedChildMastery(activeChild);
    const worldBreakdown = SEVEN_EDUCATIONAL_WORLDS.map((w) => ({
      world: w,
      mastery: computeWorldMasteryPct(w, chapterProgress, platformState, chapterLibraries),
      assessment: platformState.assessmentsByWorld[w.id],
    }));

    return {
      platformState,
      chapterProgress,
      summary,
      worldBreakdown,
    };
  }, [activeChild, chapterLibraries, refreshTick]);

  const unlockedBadges = AWARDABLE_BADGES.filter((b) =>
    childSummary.platformState.unlockedBadgeIds.includes(b.id)
  );

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8"
      data-testid="parent-dashboard-view"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Friendly Parent Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-3xl p-7 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-xs font-black px-3 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5" />
              <span>{isAr ? 'بوابة ولي الأمر الذكية' : 'Smart Parent Insights Portal'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              {isAr
                ? 'رحلة نمو طفلك عبر العوالم التعليمية السبعة'
                : "Your Child's Growth Across the Seven Worlds"}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {isAr
                ? 'متابعة دافئة وبسيطة لنقاط القوة، نتائج التقييمات، المشاريع الإبداعية، والأنشطة المنزلية المقترحة.'
                : 'Warm, clear visibility into strengths, assessments, creative projects, and home unplugged activities.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="print:hidden px-5 py-3 rounded-2xl bg-white text-slate-900 font-black text-xs flex items-center gap-2 shadow-lg shrink-0 cursor-pointer hover:bg-slate-100"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <span>{isAr ? 'طباعة تقرير التقدم' : 'Print Progress Report'}</span>
          </button>
        </div>

        {/* Child Selector Strip */}
        <div className="print:hidden bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">
            {isAr ? 'اختر ملف الطفل لعرض تقريره:' : 'Select Child Profile:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                type="button"
                data-testid={`parent-select-child-${c.id}`}
                onClick={() => setSelectedChildId(c.id)}
                className={`px-4 py-2 rounded-2xl border-2 text-xs font-black flex items-center gap-2 cursor-pointer transition-all ${
                  c.id === activeChild.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="text-lg">{c.avatarEmoji}</span>
                <span>{c.name[language]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'الإتقان العام' : 'Overall Mastery'}</span>
            </div>
            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2 tabular-nums">
              {childSummary.summary.overallPct}%
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{isAr ? 'النجوم والنقاط' : 'Stars & XP'}</span>
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2 tabular-nums">
              {activeChild.progress.starsEarned} ⭐ · {activeChild.progress.xpEarned ?? 0} XP
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'الاختبارات المنجزة' : 'Quizzes Passed'}</span>
            </div>
            <div
              data-testid="parent-assessments-count"
              className="text-3xl font-black text-emerald-600 mt-2 tabular-nums"
            >
              {childSummary.summary.assessmentsCount} / 7
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-fuchsia-600" />
              <span>{isAr ? 'مشاريع الإبداع' : 'Creative Projects'}</span>
            </div>
            <div
              data-testid="parent-creative-count"
              className="text-3xl font-black text-fuchsia-600 mt-2 tabular-nums"
            >
              {childSummary.summary.creativeProjectsCount}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{isAr ? 'الأوسمة والأنشطة المنزلية' : 'Badges & Home Cards'}</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2 tabular-nums">
              {unlockedBadges.length} 🏅 · {childSummary.platformState.completedUnpluggedIds.length}{' '}
              {isAr ? 'منزلي' : 'Home'}
            </div>
          </div>
        </div>

        {/* 7 Worlds Mastery Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-5">
            {isAr
              ? `خريطة إتقان ${activeChild.name.ar} في العوالم السبعة`
              : `${activeChild.name.en}'s Seven Worlds Progress`}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childSummary.worldBreakdown.map(({ world, mastery, assessment }) => (
              <div
                key={world.id}
                data-testid={`parent-world-row-${world.id}`}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{world.icon}</span>
                    <div>
                      <div className="font-black text-sm text-slate-900 dark:text-white">
                        {world.title[language]}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {mastery.paceMode === 'challenge_boost'
                          ? isAr
                            ? '⚡ متفوق وجاهز لتحديات إضافية'
                            : '⚡ Ready for extra challenges'
                          : mastery.paceMode === 'simplify'
                          ? isAr
                            ? '🌱 نسير بخطوات هادئة ومبسطة'
                            : '🌱 Growing at a gentle supported pace'
                          : isAr
                          ? '✨ يتقدم بثبات وتوازن'
                          : '✨ Steady balanced progress'}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {mastery.pct}%
                  </span>
                </div>

                <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${world.gradient} rounded-full transition-all`}
                    style={{ width: `${mastery.pct}%` }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                  <span>
                    {assessment
                      ? isAr
                        ? `التقييم: ${assessment.scorePct}% (${assessment.masteryStatus})`
                        : `Quiz: ${assessment.scorePct}% (${assessment.masteryStatus})`
                      : isAr
                      ? 'لم يجرِ تقييم هذا العالم بعد'
                      : 'World quiz not taken yet'}
                  </span>
                  {mastery.totalChaptersLevels > 0 && (
                    <span className="tabular-nums">
                      {mastery.completedChaptersLevels}/{mastery.totalChaptersLevels}{' '}
                      {isAr ? 'مراحل فصول' : 'chapter levels'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths, Practice Suggestions, Badges & Home Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'نقاط القوة والمهارات البارزة' : 'Top Strengths & Skills'}</span>
            </h3>
            {childSummary.summary.strengths.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {childSummary.summary.strengths.map((s, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold"
                  >
                    🌟 {s[language]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'أكمل أول تقييم أو نشاط في أي عالم لتظهر نقاط القوة المميزة هنا!'
                  : 'Complete a world quiz or module to reveal highlighted strengths here!'}
              </p>
            )}

            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 pt-2">
              {isAr ? 'مهارات تحتاج لممارسة مرحة:' : 'Skills for Gentle Practice:'}
            </h4>
            {childSummary.summary.needsPractice.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {childSummary.summary.needsPractice.map((s, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 font-bold"
                  >
                    🌱 {s[language]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'الأداء متوازن حالياً — يمكن تشجيع الطفل على تجربة مختبر العلوم أو الإبداع.'
                  : 'Performance looks balanced! Try exploring STEM or Creative Studio next.'}
              </p>
            )}
          </div>

          {/* Unlocked Badges */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'الأوسمة والجوائز المكتسبة' : 'Earned Achievement Badges'}</span>
            </h3>
            <div className="space-y-2.5">
              {unlockedBadges.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center gap-3"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <div className="font-black text-xs text-slate-900 dark:text-white">
                      {b.title[language]}
                    </div>
                    <div className="text-[11px] text-slate-500">{b.description[language]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Projects & Suggested Home Unplugged */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-fuchsia-600" />
              <span>{isAr ? 'مشاريع الطفل وأنشطة المنزل المقترحة' : 'Projects & Suggested Home Play'}</span>
            </h3>

            {childSummary.platformState.creativeProjects.length > 0 ? (
              <div className="space-y-2">
                {childSummary.platformState.creativeProjects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200 dark:border-fuchsia-900 text-xs font-bold"
                  >
                    🎨 {proj.title} ({proj.elements.length} {isAr ? 'عناصر' : 'items'})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {isAr ? 'لا توجد مشاريع إبداعية محفوظة بعد.' : 'No saved creative projects yet.'}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                {isAr ? 'أفضل نشاط لاشاشي مقترح اليوم:' : 'Recommended Offline Activity Today:'}
              </div>
              {UNPLUGGED_ACTIVITY_CARDS.slice(0, 2).map((card) => (
                <div
                  key={card.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs space-y-1"
                >
                  <div className="font-black text-slate-800 dark:text-white">
                    ✂️ {card.title[language]}
                  </div>
                  <div className="text-[11px] text-slate-500">{card.whatChildLearns[language]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
