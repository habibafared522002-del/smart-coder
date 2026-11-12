import React from 'react';
import { Cpu, Sparkles, CheckCircle2, Play, BookOpen } from 'lucide-react';
import { Language, LearningPathway } from '../types';

interface ExplorerInnovatorViewProps {
  language: Language;
  pathway: LearningPathway;
  onBack: () => void;
}

export const ExplorerInnovatorView: React.FC<ExplorerInnovatorViewProps> = ({ language, pathway, onBack }) => {
  const isAr = language === 'ar';
  const isExplorer = pathway === 'explorer';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${isExplorer ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
              {isExplorer ? (isAr ? 'مسار إكسبلورر (7-10 سنوات)' : 'Explorer Pathway (7-10 Yrs)') : (isAr ? 'مسار إينوفاتور (10 سنوات فأكثر)' : 'Innovator Pathway (10+ Yrs)')}
            </span>
            <h2 className="text-3xl font-black mt-2">
              {isExplorer
                ? (isAr ? 'تفكير خوارزمي وتطوير الألعاب' : 'Algorithmic Thinking & Game Development')
                : (isAr ? 'لغات البرمجة، بايثون ومحاكاة الإلكترونيات' : 'Programming Languages, Python & Electronics')}
            </h2>
          </div>
          <button
            onClick={onBack}
            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
          >
            {isAr ? '← العودة للمسارات' : '← Back to Pathways'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(isExplorer
            ? [
                { title: { ar: '1. أساسيات الخوارزميات وحل المشكلات', en: '1. Algorithms & Problem Solving' }, desc: { ar: 'تصميم خطوات الحل المنطقي وحل التحديات', en: 'Logical solution steps' } },
                { title: { ar: '2. البرمجة بكتل الأكواد (Scratch Blocks)', en: '2. Scratch Block Programming' }, desc: { ar: 'بناء ألعاب تفاعلية ورسوم متحركة', en: 'Build interactive games' } },
                { title: { ar: '3. الحلقات المتداخلة والشروط المتقدمة', en: '3. Nested Loops & Conditionals' }, desc: { ar: 'اتخاذ القرارات البرمجية الذكية', en: 'Smart coding decisions' } },
                { title: { ar: '4. تصميم وتطوير الألعاب المستقلة', en: '4. Independent Game Development' }, desc: { ar: 'ابتكار لعبة فيديو خاصة بك', en: 'Create your own video game' } },
              ]
            : [
                { title: { ar: '1. أساسيات لغة Python البرمجية', en: '1. Python Programming Fundamentals' }, desc: { ar: 'المتغيرات، الدوال، والهياكل البيانية', en: 'Variables, functions & data structures' } },
                { title: { ar: '2. تطوير الويب (HTML, CSS, JavaScript)', en: '2. Web Development (HTML/CSS/JS)' }, desc: { ar: 'بناء وتصميم مواقع ويب تفاعلية', en: 'Build interactive web pages' } },
                { title: { ar: '3. محاكاة الإلكترونيات و Arduino', en: '3. Electronics & Arduino Simulation' }, desc: { ar: 'دوائر التحكم والذكاء الاصطناعي المبكر', en: 'Control circuits & early AI' } },
                { title: { ar: '4. مشروع هندسي تطبيقي متكامل', en: '4. Integrated Engineering Project' }, desc: { ar: 'ابتكار نظام تقني متكامل', en: 'Innovate a complete technical system' } },
              ]
          ).map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-2xl mb-3 block">🚀</span>
                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {item.title[language]}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  {item.desc[language]}
                </p>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById(`mod-status-${idx}`);
                  if (el) el.textContent = isAr ? 'تم تفعيل وحدة التدريب التفاعلية لهذا المسار.' : 'Interactive module queued for this track.';
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{isAr ? 'بدء التعلم والتجربة' : 'Start Learning'}</span>
              </button>
              <p id={`mod-status-${idx}`} className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 text-center min-h-[16px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
