
import React, { useState } from 'react';
import { UITranslations, UserStats } from '../types';

interface SettingsPageProps {
  translations: UITranslations;
  userStats: UserStats;
  token: string | null;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ translations: t, userStats, token, onBack }) => {
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'yearly' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setCheckoutLoading(plan);
    setCheckoutError(null);
    try {
      const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const res = await fetch(`${BASE}/api/subscribe/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err: any) {
      setCheckoutError(err.message || 'Something went wrong. Please try again.');
      setCheckoutLoading(null);
    }
  };

  const disclosureSections = [
    { icon: '✨', title: t.terms_ai_gen_title, desc: t.terms_ai_gen_desc },
    { icon: '🔒', title: t.terms_data_title, desc: t.terms_data_desc },
    { icon: '🛡️', title: t.terms_moderation_title, desc: t.terms_moderation_desc },
    { icon: '📜', title: t.terms_ownership_title, desc: t.terms_ownership_desc },
  ];

  const isPlus = userStats.plan === 'plus';

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

        {/* MEMBERSHIP MANAGEMENT */}
        <section className="space-y-8 bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="absolute top-0 right-0 p-8 text-4xl opacity-10">💎</div>

          <div className="space-y-2">
            <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Your Plan</h3>
            <p className="text-white text-3xl font-black tracking-tighter">
              {isPlus ? '💎 Storia Plus' : 'Storia Basic'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{t.pw_plan_used}</p>
              <p className="text-white font-bold text-lg">{userStats.monthlyUsed} / {isPlus ? '20' : '5'}</p>
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

          {/* Upgrade section — only shown for free users */}
          {!isPlus && (
            <div className="pt-6 border-t border-zinc-800 space-y-6">
              <div className="space-y-2">
                <h4 className="text-white text-lg font-black tracking-tight">Upgrade to Storia Plus ✨</h4>
                <p className="text-zinc-400 text-sm font-medium">20 stories/month, all regions unlocked, every voice & soundscape.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monthly */}
                <button
                  onClick={() => handleSubscribe('monthly')}
                  disabled={!!checkoutLoading}
                  className="group p-6 rounded-[2rem] bg-zinc-800 border-2 border-zinc-700 hover:border-indigo-500 transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Monthly</span>
                  <p className="text-3xl font-black text-white">{t.paywall_monthly_price}</p>
                  <p className="text-zinc-500 text-xs font-bold mt-1">per month</p>
                  {checkoutLoading === 'monthly' && (
                    <p className="text-indigo-400 text-xs font-bold mt-3 animate-pulse">Redirecting to checkout…</p>
                  )}
                </button>

                {/* Yearly */}
                <button
                  onClick={() => handleSubscribe('yearly')}
                  disabled={!!checkoutLoading}
                  className="group p-6 rounded-[2rem] bg-indigo-600 border-2 border-white/20 hover:scale-105 transition-all text-left relative disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="absolute -top-3 left-6 bg-white text-indigo-600 text-[9px] font-black px-3 py-1 rounded-full uppercase">{t.paywall_yearly_discount}</span>
                  <span className="text-white/70 font-black uppercase tracking-widest text-[10px] block mb-2">Yearly</span>
                  <p className="text-3xl font-black text-white">{t.paywall_yearly_price}</p>
                  <p className="text-white/50 text-xs font-bold mt-1">per year</p>
                  {checkoutLoading === 'yearly' && (
                    <p className="text-white/70 text-xs font-bold mt-3 animate-pulse">Redirecting to checkout…</p>
                  )}
                </button>
              </div>

              {checkoutError && (
                <p className="text-red-400 text-sm font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                  ⚠ {checkoutError}
                </p>
              )}
            </div>
          )}

          {/* Already Plus */}
          {isPlus && (
            <div className="pt-6 border-t border-zinc-800 flex items-center gap-3">
              <span className="text-emerald-400 text-lg">✓</span>
              <p className="text-zinc-400 text-sm font-bold">You're on Storia Plus. Thank you for supporting us!</p>
            </div>
          )}
        </section>

        {/* Disclosures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {disclosureSections.map((section, idx) => (
            <div key={idx} className="p-8 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 group">
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">{section.icon}</div>
              <h3 className="text-xl font-black text-white mb-4 tracking-tight">{section.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed font-medium">{section.desc}</p>
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
