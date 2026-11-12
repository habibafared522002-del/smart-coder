import React from 'react';
import { Language } from '../types';
import { translations } from '../locales/translations';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <img
                src="/assets/aistudio/Asset_2_4787d13f.png"
                alt="SmartTech Training Center"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">SMART CODERS</h3>
              <p className="text-sm text-red-400 font-semibold">{t.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#about" className="hover:text-white transition-colors">
              {language === 'ar' ? 'عن المنصة' : 'About Platform'}
            </a>
            <a href="#curriculum" className="hover:text-white transition-colors">
              {language === 'ar' ? 'المناهج التعليمية' : 'Curricula'}
            </a>
            <a href="#materials" className="hover:text-white transition-colors">
              {t.materialsLibrary}
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              {language === 'ar' ? 'اتصل بمركز سمارت تك' : 'Contact SmartTech'}
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          <p>{t.footerText}</p>
        </div>
      </div>
    </footer>
  );
};
