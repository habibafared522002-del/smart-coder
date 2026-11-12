import React, { useState } from 'react';
import { Bot, GraduationCap, BookOpen, ShieldCheck, Library, ArrowRight, ArrowLeft, Sparkles, Cpu, Zap, Radio, FileText } from 'lucide-react';
import { Language, UserRole, Program } from '../types';
import { translations } from '../locales/translations';
import { Robot3DScene } from './Robot3DScene';
import { ProjectDocsModal } from './ProjectDocsModal';

interface HomeViewProps {
  language: Language;
  setCurrentRole: (role: UserRole) => void;
  programs: Program[];
  onNavigateToLabs: () => void;
  onNavigateToMembership: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  setCurrentRole,
  programs,
  onNavigateToLabs,
  onNavigateToMembership,
}) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [showDocsModal, setShowDocsModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section with 3D Robot */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-red-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-6 border border-red-200 dark:border-red-900 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t.tagline}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                {isAr ? 'اكتشف عالم التكنولوجيا... وابدأ رحلة الابتكار' : 'Explore Technology. Create. Innovate.'}
                <span className="block text-red-600 dark:text-red-500 mt-2 text-xl sm:text-3xl font-extrabold">
                  {isAr ? 'من البرمجة إلى الروبوتات والإلكترونيات' : 'Programming, Robotics & Electronics'}
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? 'من البرمجة إلى الروبوتات والإلكترونيات، تعلّم من خلال التجربة، واكتشف مهارات جديدة مع SMART CODERS.'
                  : 'Discover programming, robotics and electronics through interactive learning experiences designed to build real skills.'}
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setCurrentRole('student')}
                  className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl hover:shadow-red-600/30 transition-all flex items-center gap-3 text-base group"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>{isAr ? 'ابدأ رحلتك' : 'Start Journey'}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                <button
                  onClick={onNavigateToLabs}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-red-600 font-bold px-6 py-4 rounded-2xl shadow-sm transition-all flex items-center gap-2 text-base"
                >
                  <Cpu className="w-5 h-5 text-red-600" />
                  <span>{isAr ? 'جرّب المعمل التفاعلي' : 'Try STEM Labs'}</span>
                </button>
                <button
                  onClick={() => setShowDocsModal(true)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold px-4 py-4 rounded-2xl transition-all flex items-center gap-2 text-sm"
                  title="Project Documentation & Logo"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <span>{isAr ? 'توثيق المشروع' : 'Project Docs'}</span>
                </button>
              </div>
            </div>

            {/* 3D Interactive Robot Hero Display */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-gradient-to-tr from-slate-200/50 to-red-100/40 dark:from-slate-900 dark:to-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <Robot3DScene language={language} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEM Labs & Features Preview Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4">
            {isAr ? 'المعامل والمسارات التعليمية' : 'Interactive STEM Labs & Learning Paths'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {isAr ? 'منصة متكاملة تجمع بين البرمجة، الروبوتات الافتراضية، والإلكترونيات للأطفال.' : 'An integrated platform combining programming, virtual robotics, and electronics for children.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            onClick={onNavigateToLabs}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-14 h-14 bg-red-100 dark:bg-red-950 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {isAr ? 'معمل البرمجة والروبوت' : 'Robot Programming Lab'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {isAr ? 'بناء الأوامر البرمجية وتوجيه الروبوت عبر بيئة تفاعلية ممتعة.' : 'Build command sequences and guide robots in a fun interactive environment.'}
            </p>
            <span className="text-red-600 font-bold text-sm flex items-center gap-2">
              {isAr ? 'استكشف المعمل' : 'Explore Lab'} →
            </span>
          </div>

          <div
            onClick={onNavigateToLabs}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {isAr ? 'معمل الإلكترونيات' : 'Virtual Electronics Lab'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {isAr ? 'توصيل الدوائر الكهربائية البصرية والمصابيح واختبار التوصيل.' : 'Connect visual electrical circuits and LEDs to test connections.'}
            </p>
            <span className="text-amber-600 font-bold text-sm flex items-center gap-2">
              {isAr ? 'استكشف المعمل' : 'Explore Lab'} →
            </span>
          </div>

          <div
            onClick={onNavigateToMembership}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 hover:border-red-500 cursor-pointer transition-all transform hover:-translate-y-1 group"
          >
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              {isAr ? 'باقات العضويات' : 'Membership Plans'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {isAr ? 'باقات تدريبية معتمدة من مركز سمارت تك للتدريب لجميع المستويات.' : 'Certified training packages from SmartTech Training Center for all levels.'}
            </p>
            <span className="text-indigo-600 font-bold text-sm flex items-center gap-2">
              {isAr ? 'عرض الباقات' : 'View Plans'} →
            </span>
          </div>
        </div>
      </section>

      {/* Project Docs Modal */}
      {showDocsModal && <ProjectDocsModal language={language} onClose={() => setShowDocsModal(false)} />}
    </div>
  );
};
