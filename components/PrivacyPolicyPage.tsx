
import React from 'react';
import { UITranslations } from '../types';

interface PrivacyPolicyPageProps {
  translations: UITranslations;
  onBack: () => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ translations: t, onBack }) => {
  const sections = [
    {
      title: t.privacy_usage_title,
      desc: t.privacy_usage_desc
    },
    {
      title: t.privacy_audio_title,
      desc: t.privacy_audio_desc
    },
    {
      title: t.privacy_security_title,
      desc: t.privacy_security_desc
    }
  ];

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            {t.privacy_title}
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

        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
          {t.privacy_intro}
        </p>

        <div className="space-y-10">
          {sections.map((section, idx) => (
            <div 
              key={idx}
              className="p-8 bg-zinc-900/30 rounded-[2rem] border border-zinc-800"
            >
              <h3 className="text-xl font-black text-white mb-4 tracking-tight">
                {section.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                {section.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center text-zinc-600">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">
            Your Privacy Matters &copy; 2026 Storia Labs
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
