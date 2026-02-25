
import React from 'react';
import { UITranslations, UserStats } from '../types';

interface PaywallProps {
  screen: 'intro' | 'plus' | 'limit' | 'topup';
  translations: UITranslations;
  userStats: UserStats;
  onContinue: () => void;
  onSubscribe: (plan: 'monthly' | 'yearly') => void;
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

  // SCREEN 1: FIRST LAUNCH / INTRO
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

  // SCREEN 2: MEMBERSHIP / PLAN SELECTION
  if (screen === 'plus') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in zoom-in duration-500">
        <div className="max-w-lg w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">💎</div>
            <h2 className="text-4xl font-black text-white tracking-tighter">{t.pw_plus_title}</h2>
            <p className="text-zinc-400 font-medium leading-relaxed max-w-lg mx-auto">{t.pw_plus_body}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[t.pw_plus_feat1, t.pw_plus_feat2, t.pw_plus_feat3, t.pw_plus_feat4, t.pw_plus_feat5].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-300 font-bold bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
                <span className="text-indigo-400">✦</span> {f}
              </div>
            ))}
          </div>

          {/* Promo / Instagram notice */}
          <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl px-5 py-4 text-left space-y-1">
            <p className="text-indigo-300 font-black text-sm">🎁 {t.pw_promo_label || 'New member offer'}</p>
            <p className="text-indigo-200/80 text-sm font-medium leading-relaxed">
              Follow{' '}
              <a
                href="https://www.instagram.com/storia.land/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 font-black underline underline-offset-2 hover:text-white transition-colors"
              >
                @storia.land
              </a>
              {' '}on Instagram and DM us for a discount code — £3.99/month for your first 3 months.
            </p>
          </div>

          {/* Plan cards */}
          <div className="space-y-4">

            {/* Monthly */}
            <button
              id="paywall-monthly-btn"
              onClick={() => onSubscribe('monthly')}
              className="w-full p-6 bg-zinc-900 border-2 border-zinc-700 hover:border-indigo-500 rounded-[2rem] text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-lg">{t.settings_monthly || 'Monthly'}</p>
                  <p className="text-zinc-400 text-sm font-medium">{t.pw_plus_feat1 || '20 stories/month'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-2xl">£6.99</p>
                  <p className="text-zinc-500 text-xs">{t.settings_per_month || 'per month'}</p>
                </div>
              </div>
            </button>

            {/* Yearly — highlighted */}
            <button
              id="paywall-yearly-btn"
              onClick={() => onSubscribe('yearly')}
              className="w-full p-6 bg-indigo-600 border-2 border-indigo-500 hover:bg-indigo-500 rounded-[2rem] text-left transition-all relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 bg-white text-indigo-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {t.paywall_yearly_discount || 'Best value'}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-lg">{t.settings_yearly || 'Yearly'}</p>
                  <p className="text-indigo-200 text-sm font-medium">{t.pw_plus_feat1 || '20 stories/month'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-2xl">£59.99</p>
                  <p className="text-indigo-200 text-xs">{t.settings_per_year || 'per year'}</p>
                </div>
              </div>
            </button>
          </div>

          <button onClick={onContinue} className="text-zinc-500 hover:text-white font-bold text-sm tracking-wide transition-colors">
            {t.pw_keep_exploring}
          </button>

          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            {t.pw_trust_tagline}
          </p>
        </div>
      </div>
    );
  }


  // SCREEN 3: FREE STORIES USED UP
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
            {/* Primary: Subscribe */}
            <button
              id="limit-subscribe-btn"
              onClick={() => onSubscribe('monthly')}
              className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2rem] hover:bg-indigo-500 transition-all shadow-xl"
            >
              {t.pw_subscribe_cta || 'Subscribe — £6.99/month'}
            </button>
            {/* Secondary: Top-up */}
            <button
              onClick={() => onAddStories(0)}
              className="w-full py-5 bg-zinc-800 text-zinc-300 font-bold rounded-[2rem] hover:bg-zinc-700 transition-all"
            >
              {t.pw_add_stories}
            </button>
            {/* Tertiary: Replay a saved story */}
            <button
              onClick={onReplay}
              className="w-full py-5 bg-zinc-900 text-zinc-500 font-bold rounded-[2rem] hover:bg-zinc-800 transition-all"
            >
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
      { count: 10, price: '£6.99', title: t.pw_bundle_15_title || '10 Stories', desc: t.pw_bundle_15_desc || 'One-time top-up', popular: true },
    ];

    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-sm w-full space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter">{t.pw_topup_title}</h2>
            <p className="text-zinc-400 font-medium px-8">{t.pw_topup_subtitle}</p>
          </div>

          <div>
            {bundles.map((b, i) => (
              <div
                key={i}
                onClick={() => onAddStories(b.count)}
                className="p-10 rounded-[2.5rem] bg-zinc-900 border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.15)] transition-all cursor-pointer hover:scale-105 flex flex-col items-center text-center space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                <span className="text-white font-black text-2xl">{b.title}</span>
                <p className="text-5xl font-black text-indigo-400">{b.price}</p>
                <p className="text-zinc-500 text-[10px] font-black uppercase leading-tight tracking-widest">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Also offer subscription */}
          <button
            onClick={() => onSubscribe('monthly')}
            className="w-full py-5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold rounded-[2rem] hover:bg-zinc-800 transition-all"
          >
            {t.pw_subscribe_cta || 'Subscribe instead — £6.99/month'}
          </button>

          <div className="text-center space-y-6">
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
