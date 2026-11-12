import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Sparkles, Star, User, Lock, CreditCard } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface MembershipViewProps {
  language: Language;
}

export const MembershipView: React.FC<MembershipViewProps> = ({ language }) => {
  const t = translations[language];
  const isAr = language === 'ar';
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const plans = [
    {
      id: 'plan-basic',
      name: { ar: 'باقة صغار المبرمجين الأساسية', en: 'Smart Coders Basic Plan' },
      price: '299',
      currency: 'SAR',
      duration: { ar: 'لكل شهر', en: 'per month' },
      description: { ar: 'مثالية للأطفال من سن 4-6 سنوات لبدء رحلة البرمجة ومتاهة الروبوت.', en: 'Ideal for ages 4-6 to start coding and robot maze journey.' },
      features: {
        ar: ['الوصول لمسار Course A كامل', '13 درس تفاعلي ومعامل ذكية', 'متاهة الروبوت والألعاب', 'متابعة تقدم الطالب'],
        en: ['Full Course A access', '13 interactive lessons & smart labs', 'Robot maze & games', 'Student progress tracking']
      }
    },
    {
      id: 'plan-pro',
      name: { ar: 'باقة المبتكرين المتقدمة', en: 'Advanced Innovators Plan' },
      price: '599',
      currency: 'SAR',
      duration: { ar: 'لكل 6 أشهر', en: 'per 6 months' },
      description: { ar: 'باقة شاملة تتضمن الروبوتات، الإلكترونيات الافتراضية والبرمجة الإبداعية.', en: 'Comprehensive plan including robotics, virtual electronics & creative coding.' },
      features: {
        ar: ['جميع مميزات الباقة الأساسية', 'معمل الإلكترونيات الافتراضي', 'معمل مستشعرات الروبوت', 'جلسات توجيه ودعم مخصصة'],
        en: ['All Basic features', 'Virtual Electronics Lab', 'Robot Sensors Lab', 'Dedicated guidance & support']
      }
    }
  ];

  const handleSubmitRequest = (planName: string) => {
    setSelectedPlan(planName);
    setRequestSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'عضويات مركز سمارت تك للتدريب' : 'SmartTech Training Center Memberships'}</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            {isAr ? 'اختر الباقة المناسبة لطفلك' : 'Choose the Right Plan for Your Child'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {isAr ? 'باقات مدروسة بعناية لتوفير تجربة تعليمية متكاملة في البرمجة والتقنية.' : 'Carefully designed plans to provide an integrated EdTech experience.'}
          </p>
        </div>

        {!requestSubmitted ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-red-500 transition-all"
              >
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    {plan.name[language]}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    {plan.description[language]}
                  </p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-black text-red-600">{plan.price}</span>
                    <span className="text-sm font-bold text-slate-500">{plan.currency} / {plan.duration[language]}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features[language].map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubmitRequest(plan.name[language])}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{isAr ? 'طلب الاشتراك في الباقة' : 'Request Subscription'}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
              ✅
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? 'تم استلام طلب اشتراكك بنجاح!' : 'Subscription Request Received!'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {isAr ? `تم تسجيل طلبك للباقة (${selectedPlan}). سيتواصل معك فريق مركز سمارت تك قريباً لتأكيد التفعيل.` : `Your request for (${selectedPlan}) is registered. SmartTech team will contact you soon.`}
            </p>
            <button
              onClick={() => setRequestSubmitted(false)}
              className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold px-6 py-3 rounded-xl text-sm"
            >
              {isAr ? 'العودة للباقات' : 'Back to Plans'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
