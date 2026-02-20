
import React, { useState, useEffect, useMemo } from 'react';
import { Region, UITranslations, StoryConfig } from '../types';
import { REGION_DATA, RAW_REGION_DATA } from './Form';
import { checkSafety } from '../services/moderation';

interface StorySeedPageProps {
  translations: UITranslations;
  initialRegion: Region;
  onNext: (seed: Partial<StoryConfig>) => void;
  onBack: () => void;
}

const getGlobalThemes = (t: UITranslations) => [
  { id: "None", label: t.gt_none },
  { id: "Animals", label: t.gt_animals },
  { id: "Biology", label: t.gt_biology },
  { id: "Diversity & Inclusion", label: t.gt_diversity },
  { id: "Food & Agriculture", label: t.gt_food },
  { id: "Nature", label: t.gt_nature },
  { id: "People", label: t.gt_people },
  { id: "Science", label: t.gt_science },
  { id: "Social Impact", label: t.gt_social },
  { id: "Society", label: t.gt_society },
  { id: "Technology", label: t.gt_technology },
  { id: "Transportation", label: t.gt_transportation },
  { id: "Weather & Climate", label: t.gt_weather }
];

const StorySeedPage: React.FC<StorySeedPageProps> = ({ translations: t, initialRegion, onNext, onBack }) => {
  const [seed, setSeed] = useState<Partial<StoryConfig>>({
    region: initialRegion,
    theme: 'None',
    globalTheme: 'None',
    keywords: ''
  });
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [liveSafetyIssue, setLiveSafetyIssue] = useState<string | null>(null);

  useEffect(() => {
    setSeed(prev => ({ ...prev, region: initialRegion }));
  }, [initialRegion]);

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSeed(prev => ({ ...prev, keywords: val }));
    
    const unsafeWord = checkSafety(val);
    if (unsafeWord) {
      setLiveSafetyIssue(t.error_safety_title || "Keep it kind & magical ✨");
    } else {
      setLiveSafetyIssue(null);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value as Region;
    setSeed(prev => ({ 
      ...prev, 
      region: newRegion, 
      theme: 'None'
    }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.keywords?.trim()) return;

    if (checkSafety(seed.keywords)) {
      setShowSafetyWarning(true);
      return;
    }
    onNext(seed);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-2">
           {t.step_2_label}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.seed_header}</h2>
        <p className="text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">{t.form_subtitle}</p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Region */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_region}</label>
              <div className="relative">
                <select 
                  value={seed.region} 
                  onChange={handleRegionChange} 
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm shadow-inner"
                >
                  {Object.entries(REGION_DATA).map(([key, data]) => <option key={key} value={key}>{data.flag} {data.label}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Traditional Theme */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_theme}</label>
              <div className="relative">
                <select 
                  value={seed.theme} 
                  onChange={(e) => setSeed(prev => ({ ...prev, theme: e.target.value }))} 
                  className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm shadow-inner"
                >
                  <option value="None">{t.opt_none}</option>
                  {RAW_REGION_DATA[seed.region as Region]?.themes.map(themeKey => <option key={themeKey} value={themeKey}>{(t[themeKey] as string) || themeKey}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Global Theme */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_global_theme}</label>
            <div className="relative">
              <select 
                value={seed.globalTheme} 
                onChange={(e) => setSeed(prev => ({ ...prev, globalTheme: e.target.value }))} 
                className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm shadow-inner"
              >
                {getGlobalThemes(t).map(theme => <option key={theme.id} value={theme.id}>{theme.label}</option>)}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_keywords} *</label>
            <div className="relative group">
               <textarea 
                required 
                value={seed.keywords}
                onChange={handleKeywordsChange}
                placeholder={t.placeholder_keywords}
                rows={3}
                className={`w-full px-6 py-5 rounded-3xl bg-zinc-800 border-2 text-white placeholder-zinc-500 focus:outline-none transition-all font-bold text-lg resize-none shadow-inner ${liveSafetyIssue ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-zinc-700 focus:border-indigo-500'}`}
               />
               <div className="absolute right-4 bottom-4 opacity-20 group-focus-within:opacity-100 transition-opacity">
                  <span className="text-2xl">{liveSafetyIssue ? '🛡️' : '✍️'}</span>
               </div>
            </div>
            {liveSafetyIssue && (
              <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest ml-1 animate-pulse">
                {liveSafetyIssue}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            type="submit"
            disabled={!seed.keywords?.trim() || !!liveSafetyIssue}
            className="w-full py-7 bg-white text-black font-black text-2xl rounded-[2.5rem] hover:bg-zinc-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t.pw_continue || "Continue"} →
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="w-full py-4 text-zinc-500 hover:text-white font-bold transition-colors"
          >
            Back to Personalization
          </button>
        </div>
      </form>

      {showSafetyWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-zinc-900 border-2 border-amber-500/30 rounded-[3rem] p-10 text-center space-y-8 shadow-[0_0_100px_rgba(245,158,11,0.1)]">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
              <span className="text-7xl relative">🛡️</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tighter font-borel pt-2">{t.error_safety_title}</h2>
              <p className="text-zinc-400 text-base leading-relaxed font-medium">{t.error_safety_desc}</p>
            </div>
            <button onClick={() => setShowSafetyWarning(false)} className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black text-lg rounded-2xl transition-all shadow-xl active:scale-95">{t.error_safety_button}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorySeedPage;
