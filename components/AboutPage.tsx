
import React from 'react';
import { UITranslations } from '../types';

interface AboutPageProps {
  translations: UITranslations;
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ translations: t, onBack }) => {
  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {t.about_link}
          </h2>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.terms_back}
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl"></div>
          <div className="space-y-10 relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tight font-borel pt-2">
              {t.about_title}
            </h3>
            
            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 text-lg md:text-xl font-medium leading-[1.8] whitespace-pre-line">
                {t.about_content}
              </p>
            </div>

            <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <p className="text-white font-black font-borel text-2xl mb-1 italic">
                {t.about_signature}
              </p>
              
              <a 
                href="https://spoonful-studios.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-start md:items-end gap-2 p-6 bg-zinc-900/40 border border-zinc-800 rounded-[2rem] hover:bg-zinc-800 hover:border-indigo-500/50 transition-all shadow-2xl"
              >
                <span className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-indigo-400 transition-colors">
                  Discover more stories at
                </span>
                <span className="text-white font-black text-lg md:text-xl uppercase tracking-tighter flex items-center gap-3">
                  Spoonful Studios
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 text-center text-zinc-600">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            {t.footer_built_with}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
