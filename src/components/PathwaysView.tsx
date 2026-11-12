import React from 'react';
import { Bot, Cpu, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Language, LearningPathway } from '../types';

interface PathwaysViewProps {
  language: Language;
  onSelectPathway: (pathway: LearningPathway) => void;
}

export const PathwaysView: React.FC<PathwaysViewProps> = ({ language, onSelectPathway }) => {
  const isAr = language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'مسارات التعلم العمرية' : 'Age-Based Learning Pathways'}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {isAr ? 'اختر مسار التعلم المناسب لعمر طفلك' : 'Choose the Right Pathway for Your Child'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isAr
              ? 'مناهج مصممة خصيصاً لكل مرحلة عمرية لتنمية مهارات التفكير الحسابي والابتكار التقني.'
              : 'Curricula tailored specifically for each age stage to develop computational thinking and technical innovation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Junior Pathway */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-red-500 transition-all transform hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full">
                {isAr ? 'الأعمار 3-6 سنوات' : 'Ages 3-6 Years'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                SMART CODERS JUNIOR
              </h3>
              <p className="text-red-600 dark:text-red-400 font-bold text-sm mb-4">
                {isAr ? 'استكشف، العب واكتشف' : 'Explore, Play and Discover'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {isAr
                  ? 'مقدمة ممتعة للأمان الرقمي، استخدام الفأرة، الألغاز البصرية، والتسلسل البرمجي المبكر.'
                  : 'Fun introduction to digital safety, mouse use, visual puzzles, and early coding sequencing.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPathway('junior')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>{isAr ? 'ابدأ مسار جونيور' : 'Start Junior Pathway'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Explorer Pathway */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500 transition-all transform hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
                {isAr ? 'الأعمار 7-10 سنوات' : 'Ages 7-10 Years'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                SMART CODERS EXPLORER
              </h3>
              <p className="text-amber-600 dark:text-amber-400 font-bold text-sm mb-4">
                {isAr ? 'فكر، برم وابتكر' : 'Think, Code and Create'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {isAr
                  ? 'انتقال إلى البرمجة بكتل الأكواد (Scratch)، الحلقات المتداخلة، الشروط، وتطوير الألعاب البسيطة.'
                  : 'Transition to block coding (Scratch), nested loops, conditionals, and simple game development.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPathway('explorer')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>{isAr ? 'ابدأ مسار إكسبلورر' : 'Start Explorer Pathway'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Innovator Pathway */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-500 transition-all transform hover:-translate-y-1">
            <div>
              <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                {isAr ? 'الأعمار 10 سنوات فأكثر' : 'Ages 10+ Years'}
              </span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">
                SMART CODERS INNOVATOR
              </h3>
              <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-4">
                {isAr ? 'ابنِ، هندس وابتكر' : 'Build, Engineer and Innovate'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                {isAr
                  ? 'أساسيات لغة Python، تطوير الويب (HTML/CSS/JS)، محاكاة الإلكترونيات و Arduino، ومفاهيم الذكاء الاصطناعي.'
                  : 'Python fundamentals, web development, electronics/Arduino simulation, and AI concepts.'}
              </p>
            </div>
            <button
              onClick={() => onSelectPathway('innovator')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>{isAr ? 'ابدأ مسار إينوفاتور' : 'Start Innovator Pathway'}</span>
              {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
