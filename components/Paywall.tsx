
import React from 'react';
import { UITranslations, UserStats } from '../types';

interface PaywallProps {
  screen: 'intro' | 'plus' | 'limit' | 'topup';
  translations: UITranslations;
  userStats: UserStats;
  onContinue: () => void;
  onSubscribe: () => void;
  onAddStories: (count: number) => void;
  onBack: () => void;
  onReplay: () => void;
}

const Paywall: React.FC<PaywallProps> = ({
  screen,
  translations: t,
  userStats,
  onContinue,
  onSubscribe,
  onAddStories,
  onBack,
  onReplay
}) => {

  // SCREEN 1: FIRST LAUNCH
  if (screen === 'intro') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="max-w-xl w-full space-y-12 text-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              {t.pw_intro_title}
            </h2>
            <p className="text-indigo-200/70 text-lg font-medium leading-relaxed px-4">
              {t.pw_intro_subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-left max-w-sm mx-auto">
            {[t.pw_intro_feat1, t.pw_intro_feat2, t.pw_intro_feat3, t.pw_intro_feat4].map((feat, i) => (
              <div key={i} className="flex items-center gap-4 text-white font-bold">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400">✓</div>
                {feat}
              </div>
            ))}
          </div>

          <button
            onClick={onContinue}
            className="w-full py-6 bg-white text-black font-black text-2xl rounded-[2.5rem] hover:bg-zinc-100 transition-all shadow-2xl active:scale-95"
          >
            {t.pw_continue}
          </button>
        </div>
      </div>
    );
  }

  // SCREEN 2: MEMBERSHIP INTRO
  if (screen === 'plus') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="max-w-2xl w-full bg-zinc-900 rounded-[3rem] p-10 md:p-16 border border-zinc-800 shadow-2xl space-y-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="space-y-6">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="text-4xl font-black text-white tracking-tighter">{t.pw_plus_title}</h2>
            <p className="text-zinc-400 font-medium leading-relaxed">{t.pw_plus_body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[t.pw_plus_feat1, t.pw_plus_feat2, t.pw_plus_feat3, t.pw_plus_feat4, t.pw_plus_feat5].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm font-bold">
                <span className="text-indigo-500">✦</span> {f}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={onSubscribe} className="p-8 rounded-[2rem] bg-zinc-800 border-2 border-zinc-700 hover:border-indigo-500 transition-all cursor-pointer text-left group">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">{t.paywall_monthly_title}</span>
              <p className="text-3xl font-black text-white">{t.paywall_monthly_price}</p>
              <p className="text-zinc-500 text-[10px] font-bold mt-1">/ month</p>
            </div>
            <div onClick={onSubscribe} className="p-8 rounded-[2rem] bg-indigo-600 border-2 border-white/20 hover:scale-105 transition-all cursor-pointer text-left relative">
              <span className="absolute -top-3 left-6 bg-white text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">{t.paywall_yearly_discount}</span>
              <span className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-2 block">{t.paywall_yearly_title}</span>
              <p className="text-3xl font-black text-white">{t.paywall_yearly_price}</p>
              <p className="text-white/40 text-[10px] font-bold mt-1">/ year</p>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={onSubscribe} className="w-full py-6 bg-white text-black font-black text-xl rounded-[2.5rem] hover:bg-zinc-200 transition-all shadow-xl">
              {t.paywall_button}
            </button>
            <button onClick={onContinue} className="text-zinc-500 hover:text-white font-bold text-sm tracking-wide">
              {t.pw_keep_exploring}
            </button>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 border-t border-zinc-800 pt-6">
            {t.pw_trust_tagline}
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 3: MONTHLY LIMIT REACHED
  if (screen === 'limit') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="max-w-xl w-full bg-zinc-900 rounded-[3rem] p-12 md:p-16 text-center space-y-10 border border-zinc-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500/20"></div>

          <div className="space-y-4">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-4xl font-black text-white tracking-tighter">{t.pw_limit_title}</h2>
            <p className="text-zinc-400 text-lg font-medium">{t.pw_limit_body}</p>
          </div>

          <div className="space-y-4">
            <button onClick={() => onAddStories(0)} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2rem] hover:bg-indigo-500 transition-all shadow-xl">
              {t.pw_add_stories}
            </button>
            <button onClick={onReplay} className="w-full py-5 bg-zinc-800 text-zinc-300 font-bold rounded-[2rem] hover:bg-zinc-700 transition-all">
              {t.pw_limit_replay}
            </button>
          </div>

          {userStats.plan === 'plus' && (
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              {t.pw_limit_reset} {userStats.nextResetDate}
            </p>
          )}
        </div>
      </div>
    );
  }

  // SCREEN 4: TOP-UP SELECTION
  if (screen === 'topup') {
    const bundles = [
      { count: 5, price: '€2.99', title: t.pw_bundle_5_title, desc: t.pw_bundle_5_desc },
      { count: 15, price: '€6.99', title: t.pw_bundle_15_title, desc: t.pw_bundle_15_desc, popular: true },
      { count: 30, price: '€11.99', title: t.pw_bundle_30_title, desc: t.pw_bundle_30_desc }
    ];

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter">{t.pw_topup_title}</h2>
            <p className="text-zinc-400 font-medium px-8">{t.pw_topup_subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bundles.map((b, i) => (
              <div
                key={i}
                onClick={() => onAddStories(b.count)}
                className={`p-8 rounded-[2.5rem] bg-zinc-900 border-2 transition-all cursor-pointer hover:scale-105 flex flex-col items-center text-center space-y-3 relative overflow-hidden group ${b.popular ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.1)]' : 'border-zinc-800'}`}
              >
                {b.popular && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>}
                <span className="text-white font-black text-xl">{b.title}</span>
                <p className="text-3xl font-black text-indigo-400">{b.price}</p>
                <p className="text-zinc-500 text-[10px] font-black uppercase leading-tight">{b.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-8">
            <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">{t.pw_bundle_footer}</p>
            <button onClick={onBack} className="text-zinc-400 hover:text-white font-bold transition-colors">{t.pw_not_now}</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Paywall;
