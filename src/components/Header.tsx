import React from 'react';
import { Sun, Moon, Globe, BookOpen, GraduationCap, ShieldCheck, Home, Cpu, CreditCard, FileText } from 'lucide-react';
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
}) => {
  const t = translations[language];
  const isAr = language === 'ar';

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setCurrentRole('home')}>
          <div className="h-11 w-auto bg-white p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center shadow-sm shrink-0">
            <img
              src="/assets/aistudio/Asset_2_4787d13f.png"
              alt="SmartTech Training Center Logo"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              SMART CODERS
            </h1>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Navigation links & Portals */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => setCurrentRole('home')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              currentRole === 'home'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span>{t.home}</span>
          </button>

          <button
            onClick={onNavigateToLabs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <Cpu className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{isAr ? 'المعامل التفاعلية' : 'STEM Labs'}</span>
          </button>

          <button
            onClick={onNavigateToMembership}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{isAr ? 'الباقات والعضويات' : 'Memberships'}</span>
          </button>

          <button
            onClick={() => setCurrentRole('student')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              currentRole === 'student'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>{t.studentPortal}</span>
          </button>

          <button
            onClick={() => setCurrentRole('teacher')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              currentRole === 'teacher'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>{t.teacherDashboard}</span>
          </button>

          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
              currentRole === 'admin'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{t.adminDashboard}</span>
          </button>
        </nav>

        {/* Controls: Language & Theme Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4 text-red-600 shrink-0" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-red-500 transition-colors shadow-sm shrink-0"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
