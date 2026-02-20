
import React from 'react';
import { UITranslations, UserStats } from '../types';

interface SettingsPageProps {
  translations: UITranslations;
  userStats: UserStats;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ translations: t, userStats, onBack }) => {
  const disclosureSections = [
    {
      icon: "✨",
      title: t.terms_ai_gen_title,
      desc: t.terms_ai_gen_desc
    },
    {
      icon: "🔒",
      title: t.terms_data_title,
      desc: t.terms_data_desc
    },
    {
      icon: "🛡️",
      title: t.terms_moderation_title,
      desc: t.terms_moderation_desc
    },
    {
      icon: "📜",
      title: t.terms_ownership_title,
      desc: t.terms_ownership_desc
    }
  ];

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            {t.terms_title}
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

        {/* SCREEN 5: MEMBERSHIP MANAGEMENT */}
        <section className="space-y-8 bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">💎</div>
          <div className="space-y-2">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Your Plan</h3>
            <p className="text-white text-3xl font-black tracking-tighter">
              {userStats.plan === 'plus' ? t.pw_plan_active : 'Storia Basic'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pt-4">
             <div className="space-y-1">
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.pw_plan_used}</p>
               <p className="text-white font-bold text-lg">{userStats.monthlyUsed} / {userStats.plan === 'plus' ? '20' : '5'}</p>
             </div>
             <div className="space-y-1">
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.pw_plan_reset}</p>
               <p className="text-white font-bold text-lg">{userStats.nextResetDate}</p>
             </div>
             <div className="space-y-1">
               <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.pw_plan_extras}</p>
               <p className="text-white font-bold text-lg">{userStats.bundlesRemaining} remaining</p>
             </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-800">
             <button className="px-6 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors">{t.pw_plan_change}</button>
             <button className="px-6 py-3 bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors">{t.pw_plan_yearly}</button>
             <button className="px-6 py-3 border border-zinc-800 text-zinc-500 text-xs font-black uppercase tracking-widest rounded-xl hover:text-white transition-colors">{t.pw_plan_restore}</button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {disclosureSections.map((section, idx) => (
            <div 
              key={idx}
              className="p-8 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 group"
            >
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Magic Responsibly &copy; 2026 Storia Labs
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
