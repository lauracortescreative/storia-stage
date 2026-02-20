
import React, { useState } from 'react';
import { StoryConfig, UITranslations, ScreenMode } from '../types';

interface RefinementPageProps {
  translations: UITranslations;
  onBack: () => void;
  onStart: (refinedSettings: Partial<StoryConfig>) => void;
}

const RefinementPage: React.FC<RefinementPageProps> = ({ translations: t, onBack, onStart }) => {
  const [settings, setSettings] = useState<Partial<StoryConfig>>({
    screenMode: 'visuals',
    meditationEnabled: false,
    repeat: false,
    repeatCount: 1,
    repeatVariation: 'remixed_story',
    sleepFade: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === 'repeatCount') {
      val = parseInt(value, 10);
    }
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleToggle = (name: keyof StoryConfig, value: any) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-2">
           {t.step_3_label}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.refine_title}</h2>
        <p className="text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">{t.refine_subtitle}</p>
      </div>

      <div className="space-y-6">
        {/* Screen Experience */}
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl">🖼️</div>
             <div>
                <h3 className="text-white font-black text-lg tracking-tight">{t.label_experience}</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.refine_visual_style}</p>
             </div>
          </div>
          <div className="flex gap-2 p-1 bg-zinc-800 rounded-2xl border-2 border-zinc-700 h-[64px]">
            <button 
              type="button" 
              onClick={() => handleToggle('screenMode', 'visuals')} 
              className={`flex-1 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${settings.screenMode === 'visuals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.opt_visuals}
            </button>
            <button 
              type="button" 
              onClick={() => handleToggle('screenMode', 'dark')} 
              className={`flex-1 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${settings.screenMode === 'dark' ? 'bg-zinc-100 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.opt_dark}
            </button>
          </div>
        </div>

        {/* Meditation Wind-down */}
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-2xl">🧘</div>
               <div>
                  <h3 className="text-white font-black text-lg tracking-tight">{t.label_meditation}</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.refine_sleepy_vis}</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="meditationEnabled" 
                checked={settings.meditationEnabled} 
                onChange={handleChange} 
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed font-medium pl-2 border-l-2 border-indigo-500/30">
            {t.desc_meditation}
          </p>
        </div>

        {/* Nightly Routine / Repeat */}
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl">🔄</div>
               <div>
                  <h3 className="text-white font-black text-lg tracking-tight">{t.label_nightly_routine}</h3>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.label_repeats_remixes}</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="repeat" 
                checked={settings.repeat} 
                onChange={handleChange} 
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {settings.repeat && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-zinc-400 text-xs font-black uppercase tracking-widest">{t.label_repeat_count}</label>
                  <span className="text-indigo-400 font-black text-lg">{settings.repeatCount} {t.refine_times}</span>
                </div>
                <input 
                  type="range" 
                  name="repeatCount" 
                  min="1" 
                  max="5" 
                  value={settings.repeatCount} 
                  onChange={handleChange} 
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <label className="text-zinc-400 text-xs font-black uppercase tracking-widest block px-1">{t.label_variation_type}</label>
                <div className="flex gap-2 p-1 bg-zinc-800 rounded-2xl border-2 border-zinc-700 h-[64px]">
                  <button 
                    type="button" 
                    onClick={() => handleToggle('repeatVariation', 'same_story')} 
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.repeatVariation === 'same_story' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {t.opt_exact_repeat}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleToggle('repeatVariation', 'remixed_story')} 
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.repeatVariation === 'remixed_story' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    ✨ {t.opt_magical_remix}
                  </button>
                </div>
                <p className="text-zinc-500 text-[10px] italic px-4 text-center leading-relaxed">
                  {settings.repeatVariation === 'remixed_story' 
                    ? t.desc_remix_magical 
                    : t.desc_remix_exact}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          onClick={() => onStart(settings)}
          className="w-full py-7 bg-white text-black font-black text-2xl rounded-[2.5rem] hover:bg-zinc-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95"
        >
          {t.refine_button}
        </button>
        <button 
          onClick={onBack}
          className="w-full py-4 text-zinc-500 hover:text-white font-bold transition-colors"
        >
          {t.refine_back}
        </button>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #4f46e5;
          cursor: pointer;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 15px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default RefinementPage;
