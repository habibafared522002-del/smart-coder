import React from 'react';
import { Users, BookOpen, Award, CheckCircle2, Star, TrendingUp, Search } from 'lucide-react';
import { Language, Program, StudentProgress } from '../types';
import { translations } from '../locales/translations';

interface TeacherDashboardProps {
  language: Language;
  programs: Program[];
  progress: StudentProgress;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  language,
  programs,
  progress,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {isAr ? 'لوحة متابعة المعلم' : 'Teacher Monitoring Dashboard'}
            </span>
            <h2 className="text-3xl font-black mt-2">
              {isAr ? 'متابعة الفصول والطلاب' : 'Classes & Student Monitoring'}
            </h2>
            <p className="text-white/90 text-sm mt-1">
              {isAr ? 'استعراض تقدم الطلاب في مسار صغار المبرمجين وتقييم الأداء.' : 'Review student progress in Smart Coders path and evaluate performance.'}
            </p>
          </div>
          <div className="flex gap-4 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
            <div>
              <span className="block text-2xl font-black">1</span>
              <span className="text-xs text-white/80">{isAr ? 'الفصول النشطة' : 'Active Classes'}</span>
            </div>
            <div className="border-r border-white/20 px-2"></div>
            <div>
              <span className="block text-2xl font-black">12</span>
              <span className="text-xs text-white/80">{isAr ? 'عدد الطلاب' : 'Students'}</span>
            </div>
          </div>
        </div>

        {/* Classes & Student Progress Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes list */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {isAr ? 'الفصول المسندة إليك' : 'Assigned Classes'}
            </h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 cursor-pointer">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300">KG1 - {isAr ? 'مجموعة البرمجة الذكية' : 'Smart Coding Group'}</h4>
                  <span className="text-xs font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded">12 {isAr ? 'طالب' : 'Students'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Smart Coders - Early Coding</p>
              </div>
            </div>
          </div>

          {/* Student list & progress */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'قائمة الطلاب وتقرير التقدم' : 'Student Progress Report'}
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    <th className="pb-3 text-start">{isAr ? 'اسم الطالب' : 'Student Name'}</th>
                    <th className="pb-3 text-start">{isAr ? 'الدروس المكتملة' : 'Completed'}</th>
                    <th className="pb-3 text-start">{isAr ? 'النجوم' : 'Stars'}</th>
                    <th className="pb-3 text-start">{isAr ? 'الأوسمة' : 'Badges'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <span>👶</span>
                      <span>أحمد محمد (Sample Child)</span>
                    </td>
                    <td className="py-4">
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">
                        {progress.completedLessonIds.length} / 9 {isAr ? 'دروس' : 'Lessons'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{progress.starsEarned}</span>
                    </td>
                    <td className="py-4 text-xs text-slate-600 dark:text-slate-400">
                      {progress.badges.join(', ')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
