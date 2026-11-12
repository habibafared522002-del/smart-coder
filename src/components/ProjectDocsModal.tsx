import React from 'react';
import { BookOpen, ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface ProjectDocsModalProps {
  language: Language;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ language, onClose }) => {
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
              <img
                src="/assets/aistudio/Asset_2_4787d13f.png"
                alt="SmartTech Training Center Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                SMART CODERS
              </h3>
              <p className="text-xs text-red-600 font-bold">
                {isAr ? 'وثائق المشروع والتوثيق الرسمي - مركز سمارت تك للتدريب' : 'Project Documentation - SmartTech Training Center'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
          >
            {isAr ? 'إغلاق التوثيق' : 'Close Docs'}
          </button>
        </div>

        {/* Documentation Content */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              {isAr ? '1. نبذة عن المنصة والترخيص' : '1. Platform Overview & Branding'}
            </h4>
            <p className="leading-relaxed">
              {isAr
                ? 'منصة سمارت كودرز (SMART CODERS) هي منصة تعليمية تقنية متقدمة لإدارة التعلم ومختبرات الذكاء الاصطناعي والبرمجة، مدعومَة بالكامل من مركز سمارت تك للتدريب (SmartTech Training Center).'
                : 'Smart Coders is a premium EdTech learning management platform for programming, robotics, and STEM education, powered by SmartTech Training Center.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              {isAr ? '2. المنهج التعليمي (Course A)' : '2. Curriculum Architecture (Course A)'}
            </h4>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'الوحدة 1: المواطنة الرقمية والمهارات الأساسية' : 'Unit 1: Digital Citizenship & Basic Skills'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'الوحدة 2: التسلسل المنطقي ومتاهة الروبوت' : 'Unit 2: Sequencing & Robot Maze'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'الوحدة 3: التكرار والحلقات البرمجية' : 'Unit 3: Loops & Repetition'}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'الوحدة 4: الأحداث والمشاريع الإبداعية' : 'Unit 4: Events & Creative Projects'}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              {isAr ? '3. المعامل الافتراضية والتقنيات' : '3. Virtual Labs & Technologies'}
            </h4>
            <p className="leading-relaxed">
              {isAr
                ? 'تضم المنصة عارض ثلاثي الأبعاد (3D Robot Scene) باستخدام Three.js، معمل برمجة تفاعلي، معمل إلكترونيات افتراضي، ومستشعرات ذكية.'
                : 'The platform features a 3D engineered humanoid robot scene via Three.js, programming playground, virtual electronics lab, and smart sensors lab.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
