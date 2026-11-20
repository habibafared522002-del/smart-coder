import React from 'react';
import {
  Sun,
  Moon,
  Globe,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Home,
  Cpu,
  CreditCard,
  Flame,
  Heart,
} from 'lucide-react';
import { Language, Theme, UserRole } from '../types';
import { translations } from '../locales/translations';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  onNavigateToLabs: () => void;
  onNavigateToMembership: () => void;
  dailyStreak?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
  currentRole,
  setCurrentRole,
  onNavigateToLabs,
  onNavigateToMembership,
  dailyStreak = 1,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  return (
    <header className="print:hidden sticky top-0 z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand & Logo */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0"
          onClick={() => setCurrentRole('home')}
        >
          <div className="h-9 sm:h-11 w-auto bg-white p-1 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center shadow-sm shrink-0">
            <img
              src="/assets/aistudio/Asset_2_4787d13f.png"
              alt="SmartTech Training Center Logo"
              className="h-6 sm:h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              SMART CODERS
            </h1>
            <span className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Navigation links & Portals */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentRole('home')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentRole === 'home'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>{t.home}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToLabs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{isAr ? 'المعامل التفاعلية' : 'STEM Labs'}</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToMembership}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{isAr ? 'الباقات والعضويات' : 'Memberships'}</span>
          </button>

          <button
            type="button"
            data-testid="nav-role-student"
            onClick={() => setCurrentRole('student')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentRole === 'student'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>{t.studentPortal}</span>
          </button>

          <button
            type="button"
            data-testid="nav-role-parent"
            onClick={() => setCurrentRole('parent')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentRole === 'parent'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 shrink-0" />
            <span>{t.parentPortal}</span>
          </button>

          <button
            type="button"
            data-testid="nav-role-teacher"
            onClick={() => setCurrentRole('teacher')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentRole === 'teacher'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t.teacherDashboard}</span>
          </button>

          <button
            type="button"
            data-testid="nav-role-admin"
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              currentRole === 'admin'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{t.adminDashboard}</span>
          </button>
        </nav>

        {/* Controls: Daily Streak, Language & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentRole('student')}
            data-testid="header-daily-streak"
            title={
              isAr
                ? `حماس يومي متواصل: ${dailyStreak} أيام`
                : `Daily Streak: ${dailyStreak} consecutive days`
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-black whitespace-nowrap shrink-0 border border-amber-300 dark:border-amber-800 hover:border-orange-500 transition-colors shadow-sm tabular-nums cursor-pointer"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 shrink-0" />
            <span>{dailyStreak}</span>
            <span className="hidden sm:inline text-[11px] font-bold">
              {isAr ? (dailyStreak === 1 ? 'يوم حماس' : 'أيام حماس') : 'Day Streak'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-colors shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4 text-red-600 shrink-0" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Compact Mobile/Tablet Portal Strip so all 5 roles stay reachable on small screens */}
      <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto bg-slate-50/90 dark:bg-slate-900/90">
        {(
          [
            { role: 'home' as const, label: t.home },
            { role: 'student' as const, label: t.studentPortal },
            { role: 'parent' as const, label: t.parentPortal },
            { role: 'teacher' as const, label: t.teacherDashboard },
            { role: 'admin' as const, label: t.adminDashboard },
          ]
        ).map((item) => (
          <button
            key={item.role}
            type="button"
            onClick={() => setCurrentRole(item.role)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              currentRole === item.role
                ? item.role === 'parent'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-red-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
