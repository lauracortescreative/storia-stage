
import React, { useState, useEffect, useRef } from 'react';
import { StoryConfig, StoryMode, VoiceGender, VoiceStyle, Region, VoiceProfile, UITranslations, Soundscape, StoryPace, StoryStyle } from '../types';
import { StoryService } from '../services/gemini';
import { checkSafety } from '../services/moderation';

interface FormProps {
  onSubmit: (config: Partial<StoryConfig>) => void;
  onJoinMembership: () => void;
  onBack: () => void;
  translations: UITranslations;
  generationCount: number;
  initialData?: Partial<StoryConfig>;
}

export const SUPPORTED_LANGUAGES = [
  "English", "French", "Portuguese (Brazil)", "Portuguese (Portugal)", "Spanish"
];

export const RAW_REGION_DATA: Record<Region, { label: string; flag: string; lang: string; currency: string; themes: string[] }> = {
  global: { label: 'Global / Multi-Culture', flag: '🌍', lang: 'English', currency: '$', themes: ['theme_global_1', 'theme_global_2', 'theme_global_3', 'theme_global_4', 'theme_global_5', 'theme_global_6', 'theme_global_7', 'theme_global_8', 'theme_global_9', 'theme_global_10', 'theme_global_11', 'theme_global_12'] },
  australia: { label: 'Australia', flag: '🇦🇺', lang: 'English', currency: 'A$', themes: ['theme_australia_1', 'theme_australia_2', 'theme_australia_3', 'theme_australia_4', 'theme_australia_5', 'theme_australia_6'] },
  brazil: { label: 'Brazil', flag: '🇧🇷', lang: 'Portuguese (Brazil)', currency: 'R$', themes: ['theme_brazil_1', 'theme_brazil_2', 'theme_brazil_3', 'theme_brazil_4', 'theme_brazil_5', 'theme_brazil_6'] },
  bulgaria: { label: 'Bulgaria', flag: '🇧🇬', lang: 'English', currency: 'лв', themes: ['theme_bulgaria_1', 'theme_bulgaria_2', 'theme_bulgaria_3', 'theme_bulgaria_4', 'theme_bulgaria_5', 'theme_bulgaria_6'] },
  canada: { label: 'Canada', flag: '🇨🇦', lang: 'English', currency: 'C$', themes: ['theme_canada_1', 'theme_canada_2', 'theme_canada_3', 'theme_canada_4', 'theme_canada_5', 'theme_canada_6'] },
  china: { label: 'China', flag: '🇨🇳', lang: 'English', currency: '¥', themes: ['theme_china_1', 'theme_china_2', 'theme_china_3', 'theme_china_4', 'theme_china_5', 'theme_china_6'] },
  egypt: { label: 'Egypt', flag: '🇪🇬', lang: 'English', currency: 'E£', themes: ['theme_egypt_1', 'theme_egypt_2', 'theme_egypt_3', 'theme_egypt_4', 'theme_egypt_5', 'theme_egypt_6'] },
  finland: { label: 'Finland', flag: '🇫🇮', lang: 'English', currency: '€', themes: ['theme_finland_1', 'theme_finland_2', 'theme_finland_3', 'theme_finland_4', 'theme_finland_5', 'theme_finland_6'] },
  france: { label: 'France', flag: '🇫🇷', lang: 'French', currency: '€', themes: ['theme_france_1', 'theme_france_2', 'theme_france_3', 'theme_france_4', 'theme_france_5', 'theme_france_6'] },
  germany: { label: 'Germany', flag: '🇩🇪', lang: 'English', currency: '€', themes: ['theme_germany_1', 'theme_germany_2', 'theme_germany_3', 'theme_germany_4', 'theme_germany_5', 'theme_germany_6'] },
  greece: { label: 'Greece', flag: '🇬🇷', lang: 'English', currency: '€', themes: ['theme_greece_1', 'theme_greece_2', 'theme_greece_3', 'theme_greece_4', 'theme_greece_5', 'theme_greece_6'] },
  india: { label: 'India', flag: '🇮🇳', lang: 'English', currency: '₹', themes: ['theme_india_1', 'theme_india_2', 'theme_india_3', 'theme_india_4', 'theme_india_5', 'theme_india_6'] },
  ireland: { label: 'Ireland', flag: '🇮🇪', lang: 'English', currency: '€', themes: ['theme_ireland_1', 'theme_ireland_2', 'theme_ireland_3', 'theme_ireland_4', 'theme_ireland_5', 'theme_ireland_6'] },
  italy: { label: 'Italy', flag: '🇮🇹', lang: 'English', currency: '€', themes: ['theme_italy_1', 'theme_italy_2', 'theme_italy_3', 'theme_italy_4', 'theme_italy_5', 'theme_italy_6'] },
  japan: { label: 'Japan', flag: '🇯🇵', lang: 'English', currency: '¥', themes: ['theme_japan_1', 'theme_japan_2', 'theme_japan_3', 'theme_japan_4', 'theme_japan_5', 'theme_japan_6'] },
  kenya: { label: 'Kenya', flag: '🇰🇪', lang: 'English', currency: 'KSh', themes: ['theme_kenya_1', 'theme_kenya_2', 'theme_kenya_3', 'theme_kenya_4', 'theme_kenya_5', 'theme_kenya_6'] },
  korea: { label: 'Korea', flag: '🇰🇷', lang: 'English', currency: '₩', themes: ['theme_korea_1', 'theme_korea_2', 'theme_korea_3', 'theme_korea_4', 'theme_korea_5', 'theme_korea_6'] },
  mexico: { label: 'Mexico', flag: '🇲🇽', lang: 'Spanish', currency: '$', themes: ['theme_mexico_1', 'theme_mexico_2', 'theme_mexico_3', 'theme_mexico_4', 'theme_mexico_5', 'theme_mexico_6'] },
  morocco: { label: 'Morocco', flag: '🇲🇦', lang: 'English', currency: 'DH', themes: ['theme_morocco_1', 'theme_morocco_2', 'theme_morocco_3', 'theme_morocco_4', 'theme_morocco_5', 'theme_morocco_6'] },
  nordic: { label: 'Nordic', flag: '🌍', lang: 'English', currency: 'kr', themes: ['theme_nordic_1', 'theme_nordic_2', 'theme_nordic_3', 'theme_nordic_4', 'theme_nordic_5', 'theme_nordic_6'] },
  peru: { label: 'Peru', flag: '🇵🇪', lang: 'Spanish', currency: 'S/', themes: ['theme_peru_1', 'theme_peru_2', 'theme_peru_3', 'theme_peru_4', 'theme_peru_5', 'theme_peru_6'] },
  portugal: { label: 'Portugal', flag: '🇵🇹', lang: 'Portuguese (Portugal)', currency: '€', themes: ['theme_portugal_1', 'theme_portugal_2', 'theme_portugal_3', 'theme_portugal_4', 'theme_portugal_5', 'theme_portugal_6'] },
  thailand: { label: 'Thailand', flag: '🇹🇭', lang: 'English', currency: '฿', themes: ['theme_thailand_1', 'theme_thailand_2', 'theme_thailand_3', 'theme_thailand_4', 'theme_thailand_5', 'theme_thailand_6'] },
  ukraine: { label: 'Ukraine', flag: '🇺🇦', lang: 'English', currency: '₴', themes: ['theme_ukraine_1', 'theme_ukraine_2', 'theme_ukraine_3', 'theme_ukraine_4', 'theme_ukraine_5', 'theme_ukraine_6'] },
  usa: { label: 'USA', flag: '🇺🇸', lang: 'English', currency: '$', themes: ['theme_usa_1', 'theme_usa_2', 'theme_usa_3', 'theme_usa_4', 'theme_usa_5', 'theme_usa_6'] },
  netherlands: { label: 'Netherlands', flag: '🇳🇱', lang: 'English', currency: '€', themes: ['theme_netherlands_1', 'theme_netherlands_2', 'theme_netherlands_3', 'theme_netherlands_4', 'theme_netherlands_5', 'theme_netherlands_6'] },
  turkey: { label: 'Turkey', flag: '🇹🇷', lang: 'English', currency: '₺', themes: ['theme_turkey_1', 'theme_turkey_2', 'theme_turkey_3', 'theme_turkey_4', 'theme_turkey_5', 'theme_turkey_6'] },
  vietnam: { label: 'Vietnam', flag: '🇻🇳', lang: 'English', currency: '₫', themes: ['theme_vietnam_1', 'theme_vietnam_2', 'theme_vietnam_3', 'theme_vietnam_4', 'theme_vietnam_5', 'theme_vietnam_6'] },
  israel: { label: 'Israel', flag: '🇮🇱', lang: 'English', currency: '₪', themes: ['theme_israel_1', 'theme_israel_2', 'theme_israel_3', 'theme_israel_4', 'theme_israel_5', 'theme_israel_6'] },
  poland: { label: 'Poland', flag: '🇵🇱', lang: 'English', currency: 'zł', themes: ['theme_poland_1', 'theme_poland_2', 'theme_poland_3', 'theme_poland_4', 'theme_poland_5', 'theme_poland_6'] },
  indonesia: { label: 'Indonesia', flag: '🇮🇩', lang: 'English', currency: 'Rp', themes: ['theme_indonesia_1', 'theme_indonesia_2', 'theme_indonesia_3', 'theme_indonesia_4', 'theme_indonesia_5', 'theme_indonesia_6'] },
  russia: { label: 'Russia', flag: '🇷🇺', lang: 'English', currency: '₽', themes: ['theme_russia_1', 'theme_russia_2', 'theme_russia_3', 'theme_russia_4', 'theme_russia_5', 'theme_russia_6'] },
  sweden: { label: 'Sweden', flag: '🇸🇪', lang: 'English', currency: 'kr', themes: ['theme_sweden_1', 'theme_sweden_2', 'theme_sweden_3', 'theme_sweden_4', 'theme_sweden_5', 'theme_sweden_6'] },
  denmark: { label: 'Denmark', flag: '🇩🇰', lang: 'English', currency: 'kr', themes: ['theme_denmark_1', 'theme_denmark_2', 'theme_denmark_3', 'theme_denmark_4', 'theme_denmark_5', 'theme_denmark_6'] },
  norway: { label: 'Norway', flag: '🇳🇴', lang: 'English', currency: 'kr', themes: ['theme_norway_1', 'theme_norway_2', 'theme_norway_3', 'theme_norway_4', 'theme_norway_5', 'theme_norway_6'] },
  argentina: { label: 'Argentina', flag: '🇦🇷', lang: 'Spanish', currency: '$', themes: ['theme_argentina_1', 'theme_argentina_2', 'theme_argentina_3', 'theme_argentina_4', 'theme_argentina_5', 'theme_argentina_6'] },
  switzerland: { label: 'Switzerland', flag: '🇨🇭', lang: 'English', currency: 'CHF', themes: ['theme_switzerland_1', 'theme_switzerland_2', 'theme_switzerland_3', 'theme_switzerland_4', 'theme_switzerland_5', 'theme_switzerland_6'] },
  south_africa: { label: 'South Africa', flag: '🇿🇦', lang: 'English', currency: 'R', themes: ['theme_south_africa_1', 'theme_south_africa_2', 'theme_south_africa_3', 'theme_south_africa_4', 'theme_south_africa_5', 'theme_south_africa_6'] },
  singapore: { label: 'Singapore', flag: '🇸🇬', lang: 'English', currency: 'S$', themes: ['theme_singapore_1', 'theme_singapore_2', 'theme_singapore_3', 'theme_singapore_4', 'theme_singapore_5', 'theme_singapore_6'] },
  romania: { label: 'Romania', flag: '🇷🇴', lang: 'English', currency: 'lei', themes: ['theme_romania_1', 'theme_romania_2', 'theme_romania_3', 'theme_romania_4', 'theme_romania_5', 'theme_romania_6'] },
  hungary: { label: 'Hungary', flag: '🇭🇺', lang: 'English', currency: 'Ft', themes: ['theme_hungary_1', 'theme_hungary_2', 'theme_hungary_3', 'theme_hungary_4', 'theme_hungary_5', 'theme_hungary_6'] },
  czech_republic: { label: 'Czech Republic', flag: '🇨🇿', lang: 'English', currency: 'Kč', themes: ['theme_czech_republic_1', 'theme_czech_republic_2', 'theme_czech_republic_3', 'theme_czech_republic_4', 'theme_czech_republic_5', 'theme_czech_republic_6'] },
  philippines: { label: 'Philippines', flag: '🇵🇭', lang: 'English', currency: '₱', themes: ['theme_philippines_1', 'theme_philippines_2', 'theme_philippines_3', 'theme_philippines_4', 'theme_philippines_5', 'theme_philippines_6'] },
  malaysia: { label: 'Malaysia', flag: '🇲🇾', lang: 'English', currency: 'RM', themes: ['theme_malaysia_1', 'theme_malaysia_2', 'theme_malaysia_3', 'theme_malaysia_4', 'theme_malaysia_5', 'theme_malaysia_6'] },
  chile: { label: 'Chile', flag: '🇨🇱', lang: 'Spanish', currency: '$', themes: ['theme_chile_1', 'theme_chile_2', 'theme_chile_3', 'theme_chile_4', 'theme_chile_5', 'theme_chile_6'] },
  new_zealand: { label: 'New Zealand', flag: '🇳🇿', lang: 'English', currency: 'NZ$', themes: ['theme_new_zealand_1', 'theme_new_zealand_2', 'theme_new_zealand_3', 'theme_new_zealand_4', 'theme_new_zealand_5', 'theme_new_zealand_6'] },
  colombia: { label: 'Colombia', flag: '🇨🇴', lang: 'Spanish', currency: '$', themes: ['theme_colombia_1', 'theme_colombia_2', 'theme_colombia_3', 'theme_colombia_4', 'theme_colombia_5', 'theme_colombia_6'] },
  custom: { label: 'Other Country', flag: '🏳️', lang: 'English', currency: '$', themes: ['theme_custom_1', 'theme_custom_2', 'theme_custom_3', 'theme_custom_4', 'theme_custom_5', 'theme_custom_6'] }
};

export const REGION_DATA = Object.fromEntries(
  Object.entries(RAW_REGION_DATA).sort(([aKey, aVal], [bKey, bVal]) => {
    if (aKey === 'global') return -1;
    if (bKey === 'global') return 1;
    return aVal.label.localeCompare(bVal.label);
  })
);

const Form: React.FC<FormProps> = ({ onSubmit, onJoinMembership, onBack, translations: t, generationCount, initialData = {} }) => {
  const [config, setConfig] = useState<Partial<StoryConfig>>({
    childName: '',
    friendNames: '',
    storyMode: 'toddler',
    language: 'English',
    voiceGender: 'female',
    voiceStyle: 'clear',
    pace: 'medium',
    rhymeMode: 'regular',
    storyLength: 5, 
    soundscape: 'none',
    parentVoiceEnabled: false,
    ...initialData
  });

  const [safetyIssues, setSafetyIssues] = useState<Record<string, string | null>>({
    childName: null,
    friendNames: null
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [voiceAnalysisLoading, setVoiceAnalysisLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(config.parentVoiceProfile || null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        analyzeVoice(blob);
      };
      
      setRecordingProgress(0);
      const startTime = Date.now();
      recordingIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / 8000) * 100);
        setRecordingProgress(progress);
        if (progress >= 100) stopRecording();
      }, 50);

      recorder.start();
      setIsRecording(true);
      setVoiceProfile(null); 
    } catch (err) {
      console.error("Mic access failed", err);
    }
  };

  const stopRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const analyzeVoice = async (blob: Blob) => {
    setVoiceAnalysisLoading(true);
    setAnalysisProgress(0);
    
    analysisIntervalRef.current = window.setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) {
           if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
           return 95;
        }
        return prev + 0.8;
      });
    }, 100);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const service = new StoryService();
        const profile = await service.analyzeVoice(base64);
        setAnalysisProgress(100);
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        setVoiceProfile(profile);
        setConfig(prev => ({ ...prev, parentVoiceProfile: profile }));
      };
    } catch (err) {
      console.error("Voice analysis error", err);
    } finally {
      setTimeout(() => {
        setVoiceAnalysisLoading(false);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: any = value;
    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === 'storyLength' || type === 'range') {
      val = parseInt(value, 10);
    }
    setConfig(prev => ({ ...prev, [name]: val }));

    // Real-time safety check for text inputs
    if (name === 'childName' || name === 'friendNames') {
      const unsafeWord = checkSafety(val);
      setSafetyIssues(prev => ({
        ...prev,
        [name]: unsafeWord ? (t.error_safety_title || "Keep it kind & magical ✨") : null
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(safetyIssues).some(issue => issue !== null)) return;
    onSubmit(config);
  };

  const getLangLabel = (lang: string) => {
    const key = `lang_${lang.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '')}` as keyof UITranslations;
    return (t[key] as string) || lang;
  };

  const hasSafetyIssues = Object.values(safetyIssues).some(issue => issue !== null);

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-2">
           {t.step_1_label}
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.pers_header}</h2>
        <p className="text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">{t.pers_subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-8 rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Child Name */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_child_name}</label>
              <div className="relative">
                <input 
                  name="childName" 
                  value={config.childName} 
                  onChange={handleChange} 
                  placeholder={t.placeholder_child_name} 
                  className={`w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 text-white placeholder-zinc-500 focus:outline-none transition-all font-bold text-sm shadow-inner ${safetyIssues.childName ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-zinc-700 focus:border-indigo-500'}`} 
                />
                {safetyIssues.childName && (
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1 animate-pulse">
                    {safetyIssues.childName}
                  </p>
                )}
              </div>
            </div>

            {/* Friend Names */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_friend_names}</label>
              <div className="relative">
                <input 
                  name="friendNames" 
                  value={config.friendNames} 
                  onChange={handleChange} 
                  placeholder={t.placeholder_friend_names} 
                  className={`w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 text-white placeholder-zinc-500 focus:outline-none transition-all font-bold text-sm shadow-inner ${safetyIssues.friendNames ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-zinc-700 focus:border-indigo-500'}`} 
                />
                {safetyIssues.friendNames && (
                  <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1 animate-pulse">
                    {safetyIssues.friendNames}
                  </p>
                )}
              </div>
            </div>

            {/* Language */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_language}</label>
              <div className="relative">
                <select name="language" value={config.language} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm shadow-inner">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{getLangLabel(lang)}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Story Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_mode}</label>
              <div className="flex gap-2 p-1 bg-zinc-800 rounded-2xl border-2 border-zinc-700 h-[58px]">
                <button type="button" onClick={() => setConfig(prev => ({ ...prev, storyMode: 'toddler' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.storyMode === 'toddler' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>2-3</button>
                <button type="button" onClick={() => setConfig(prev => ({ ...prev, storyMode: 'preschool' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.storyMode === 'preschool' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>4-5</button>
              </div>
            </div>

            {/* Narrator Voice */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_voice}</label>
              <div className="flex gap-2 h-[58px]">
                {!config.parentVoiceEnabled ? (
                  <div className="flex w-full gap-2 p-1 bg-zinc-800 rounded-2xl border-2 border-zinc-700">
                    <button type="button" onClick={() => setConfig(prev => ({ ...prev, voiceGender: 'female' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.voiceGender === 'female' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.opt_female}</button>
                    <button type="button" onClick={() => setConfig(prev => ({ ...prev, voiceGender: 'male' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${config.voiceGender === 'male' ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{t.opt_male}</button>
                  </div>
                ) : (
                  <div className="flex-1 px-4 py-3 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center italic">
                    ✨ {t.voice_cloned}
                  </div>
                )}
              </div>
            </div>
            
            {/* Length */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_length}</label>
              <div className="relative">
                <select name="storyLength" value={config.storyLength} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer font-bold text-sm shadow-inner">
                  <option value="2">{t.opt_duration_short} (2 {t.opt_minutes})</option>
                  <option value="5">{t.opt_duration_medium} (5 {t.opt_minutes})</option>
                  <option value="10">{t.opt_duration_long} (10 {t.opt_minutes})</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Soundscape */}
            <div className="space-y-3 col-span-full">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">{t.label_soundscape}</label>
              <div className="flex flex-wrap gap-2 p-1 bg-zinc-800 rounded-2xl border-2 border-zinc-700">
                {(['none', 'rain', 'forest', 'ocean', 'wind'] as const).map(s => (
                  <button 
                    key={s}
                    type="button" 
                    onClick={() => setConfig(prev => ({ ...prev, soundscape: s }))} 
                    className={`flex-1 min-w-[80px] py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${config.soundscape === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {s === 'none' ? t.opt_silent : (t[`sound_${s}`] as string) || s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Lab Box */}
        <div className="p-8 rounded-[3rem] bg-indigo-900/10 border-2 border-indigo-500/20 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-lg">🎙️</div>
              <div>
                <h3 className="text-white font-bold text-sm">{t.voice_lab_title}</h3>
                <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">{t.voice_lab_subtitle}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="parentVoiceEnabled" 
                checked={config.parentVoiceEnabled} 
                onChange={handleChange} 
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed border-l-2 border-indigo-500/30 pl-3 font-medium">{t.voice_lab_desc}</p>
          {config.parentVoiceEnabled && (
            <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <button type="button" disabled={voiceAnalysisLoading} onClick={isRecording ? stopRecording : startRecording} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 relative overflow-hidden ${isRecording ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'} disabled:opacity-50`}>
                {isRecording && <div className="absolute inset-y-0 left-0 bg-red-600/50 transition-all duration-75" style={{ width: `${recordingProgress}%` }} />}
                <span className="relative z-10 flex items-center gap-2">
                  {isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                      {t.voice_stop} ({Math.ceil(8 - (recordingProgress * 0.08))}s)
                    </>
                  ) : (
                    t.voice_record
                  )}
                </span>
              </button>
              {voiceAnalysisLoading && (
                <div className="space-y-4 py-2 relative overflow-hidden p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400"><span>{t.voice_matching}</span><span>{Math.round(analysisProgress)}%</span></div>
                  <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-indigo-600 to-cyan-400 transition-all duration-300 relative" style={{ width: `${analysisProgress}%` }}><div className="absolute inset-0 bg-white/30 animate-[scan_1s_ease-in-out_infinite]" /></div></div>
                </div>
              )}
              {voiceProfile && !voiceAnalysisLoading && (
                <div className="p-4 bg-zinc-950/50 rounded-2xl border border-indigo-500/10 flex items-center gap-4 animate-in zoom-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(79,70,229,0.4)]">✨</div>
                  <div><div className="flex items-center gap-2 mb-1"><p className="text-white font-bold text-sm">{t.voice_matched}: {voiceProfile.matchedVoice}</p><span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[8px] font-black uppercase rounded-full">{t.voice_success}</span></div><p className="text-zinc-500 text-[10px] italic">"{voiceProfile.personalityDesc}"</p></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button 
            type="submit"
            disabled={hasSafetyIssues}
            className="w-full py-7 bg-white text-black font-black text-2xl rounded-[2.5rem] hover:bg-zinc-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t.pw_continue || "Continue"} →
          </button>
          <button 
            type="button"
            onClick={onBack}
            className="w-full py-4 text-zinc-500 hover:text-white font-bold transition-colors"
          >
            {t.terms_back || "Cancel"}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

export default Form;
