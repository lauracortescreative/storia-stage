
import React, { useState } from 'react';
import { UITranslations } from '../types';
import { ChildProfile } from '../services/api';
import { useToast } from './ToastContext';

const AVATAR_OPTIONS = ['🐻', '🦁', '🐼', '🦊', '🐸', '🦄', '🦋', '🐬', '🦕', '🌟', '🚀', '🧸'];

interface AccountPageProps {
  translations: UITranslations;
  email: string;
  emailVerified: boolean;
  childProfile: ChildProfile;
  plan: 'free' | 'plus';
  monthlyUsed: number;
  monthlyLimit: number;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
  onUpdateEmail: (newEmail: string) => void;
  onSaveProfile: (profile: ChildProfile) => Promise<void>;
  onDeleteAccount: () => void;
  onLogout: () => void;
  onManageBilling: () => Promise<void>;
  onSubscribe: (plan: 'monthly' | 'yearly') => Promise<void>;
  onCancelSubscription: () => Promise<void>;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({
  translations: t,
  email,
  emailVerified,
  childProfile,
  plan,
  monthlyUsed,
  monthlyLimit,
  subscriptionStatus,
  subscriptionEndsAt,
  onUpdateEmail,
  onSaveProfile,
  onDeleteAccount,
  onLogout,
  onManageBilling,
  onSubscribe,
  onCancelSubscription,
  onBack
}) => {
  const [newEmail, setNewEmail] = useState(email);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast } = useToast();
  const [billingLoading, setBillingLoading] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState<null | 'monthly' | 'yearly'>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Child profile state
  const [childName, setChildName] = useState(childProfile.childName || '');
  const [childAge, setChildAge] = useState<number | null>(childProfile.childAge ?? null);
  const [childAvatar, setChildAvatar] = useState(childProfile.childAvatar || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const showSuccess = (msg: string) => showToast(msg, 'success');
  const showError = (msg: string) => showToast(msg, 'error');

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmail(newEmail);
    showSuccess(t.account_updated);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await onSaveProfile({ childName, childAge, childAvatar });
      showSuccess(t.account_child_saved || 'Child profile saved!');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleManageBillingClick = async () => {
    setBillingLoading(true);
    try {
      await onManageBilling();
    } catch (err: any) {
      showError(err.message || 'Could not open billing portal. Please try again.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSubscribeClick = async (p: 'monthly' | 'yearly') => {
    setSubscribeLoading(p);
    try {
      await onSubscribe(p);
    } catch (err: any) {
      showError(err.message || 'Could not start checkout. Please try again.');
    } finally {
      setSubscribeLoading(null);
    }
  };

  const handleCancelClick = async () => {
    setCancelLoading(true);
    try {
      await onCancelSubscription();
      setShowCancelConfirm(false);
      showSuccess(t.account_cancel_success || 'Subscription cancelled. You\'re now on the free plan.');
    } catch (err: any) {
      showError(err.message || 'Could not cancel. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const usagePct = Math.min(100, Math.round((monthlyUsed / (monthlyLimit || 5)) * 100));

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <h2 className="text-4xl font-black text-white tracking-tighter">
            {t.account_title}
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

        {/* Email verification nudge banner */}
        {!emailVerified && (
          <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-950/40 border border-amber-700/40">
            <span className="text-xl">✉️</span>
            <div>
              <p className="text-amber-300 font-black text-sm">Verify your email</p>
              <p className="text-amber-200/60 text-xs mt-0.5">Check your inbox for a verification link we sent when you signed up.</p>
            </div>
          </div>
        )}

        {/* ── YOUR PLAN SECTION ── */}
        <section className="bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{plan === 'plus' ? '💎' : '⭐'}</span>
            <div>
              <h3 className="text-white text-xl font-black tracking-tight">
                {t.account_plan_section || 'Your Plan'}
              </h3>
              <span className={`text-[10px] font-black uppercase tracking-widest ${plan === 'plus' ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {plan === 'plus' ? (t.account_plan_plus || 'Storia Plus') : (t.account_plan_free || 'Basic · Free')}
              </span>
            </div>
            {plan === 'plus' && (
              subscriptionStatus === 'cancelling' && subscriptionEndsAt ? (
                <div className="ml-auto text-right">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest border border-amber-500/30 block">
                    Cancelling
                  </span>
                  <span className="text-zinc-500 text-[10px] font-bold mt-1 block">
                    Ends {new Date(subscriptionEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ) : (
                <span className="ml-auto px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                  Active
                </span>
              )
            )}
          </div>

          {/* Usage bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                {monthlyUsed} / {monthlyLimit} {t.account_plan_used || 'stories this month'}
              </span>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                {monthlyLimit} {t.account_plan_limit || 'monthly limit'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          {/* FREE PLAN — Subscribe CTAs */}
          {plan === 'free' && (
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleSubscribeClick('monthly')}
                disabled={subscribeLoading !== null}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg text-base flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {subscribeLoading === 'monthly' ? (
                  <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Redirecting…</>
                ) : (
                  <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>{t.account_subscribe_cta || 'Subscribe to Plus — £6.99/month'}</>
                )}
              </button>
              <button
                onClick={() => handleSubscribeClick('yearly')}
                disabled={subscribeLoading !== null}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all text-sm border border-zinc-700 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {subscribeLoading === 'yearly' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Redirecting…</>
                ) : (
                  <>{t.account_upgrade_cta || 'Switch to Yearly & Save — £59.99/year'}</>
                )}
              </button>
            </div>
          )}

          {/* PLUS PLAN — Upgrade to yearly + Manage Billing */}
          {plan === 'plus' && (
            <div className="space-y-4">
              {/* Upgrade to yearly */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700">
                <div>
                  <p className="text-white font-black text-sm">Switch to Yearly & Save</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">£59.99/year · best value</p>
                </div>
                <button
                  onClick={() => handleSubscribeClick('yearly')}
                  disabled={subscribeLoading !== null}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all text-xs disabled:opacity-60 flex items-center gap-2"
                >
                  {subscribeLoading === 'yearly' ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                  Upgrade
                </button>
              </div>

              {/* Manage Billing */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700">
                <div>
                  <p className="text-white font-black text-sm">{t.account_billing || 'Manage Billing'}</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{t.account_billing_desc || 'Update payment method'}</p>
                </div>
                <button
                  onClick={handleManageBillingClick}
                  disabled={billingLoading}
                  className="px-6 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white font-black rounded-xl transition-all text-xs disabled:opacity-60 flex items-center gap-2 border border-zinc-600"
                >
                  {billingLoading ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                  {billingLoading ? 'Opening…' : 'Open'}
                </button>
              </div>

              {/* Cancel — inline confirm */}
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full text-center text-zinc-600 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-colors pt-2"
                >
                  {t.account_cancel_cta || 'Cancel Subscription'}
                </button>
              ) : (
                <div className="p-6 rounded-2xl bg-red-950/20 border border-red-900/30 space-y-4 animate-in fade-in duration-200">
                  <p className="text-white font-black text-sm text-center">{t.account_cancel_confirm || 'Are you sure you want to cancel?'}</p>
                  <p className="text-zinc-400 text-xs text-center">{t.account_cancel_desc || "You'll keep Plus access until the end of your billing period."}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelClick}
                      disabled={cancelLoading}
                      className="flex-1 py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 font-black rounded-2xl transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {cancelLoading ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : null}
                      {t.account_cancel_cta || 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all text-xs border border-zinc-700"
                    >
                      {t.account_cancel_keep || 'Keep Storia Plus'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Email Section */}
        <section className="bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
          <form onSubmit={handleUpdateEmail} className="space-y-6">
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">
                {t.label_email}
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>
            <button
              type="submit"
              className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-lg"
            >
              {t.button_save_changes}
            </button>
          </form>
        </section>

        {/* ── Your Child Section ── */}
        <section className="bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧒</span>
              <h3 className="text-white text-xl font-black tracking-tight">
                {t.account_child_section || 'Your Child'}
              </h3>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest ml-9">
              {t.account_child_optional || 'Optional · Prefills your story form'}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-8">
            {/* Child Name */}
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">
                {t.account_child_name || "Child's Name"}
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder={t.placeholder_child_name || 'e.g. Leo'}
                className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-bold"
              />
            </div>

            {/* Child Age */}
            <div className="space-y-2">
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">
                {t.account_child_age || "Child's Age"}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setChildAge(childAge === 2 ? null : 2)}
                  className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${childAge === 2
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    }`}
                >
                  👶 2–3 {t.opt_years || 'Years'}
                </button>
                <button
                  type="button"
                  onClick={() => setChildAge(childAge === 4 ? null : 4)}
                  className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${childAge === 4
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    }`}
                >
                  🧒 4–5 {t.opt_years || 'Years'}
                </button>
              </div>
            </div>

            {/* Avatar Picker */}
            <div className="space-y-3">
              <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">
                {t.account_child_avatar || 'Choose an Avatar'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setChildAvatar(childAvatar === emoji ? '' : emoji)}
                    className={`aspect-square flex items-center justify-center text-2xl rounded-2xl border-2 transition-all ${childAvatar === emoji
                      ? 'border-indigo-500 bg-indigo-600/20 shadow-[0_0_12px_rgba(99,102,241,0.3)] scale-105'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500 hover:scale-105'
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview badge */}
            {(childName || childAge || childAvatar) && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-in fade-in duration-300">
                <span className="text-2xl">{childAvatar || '🧒'}</span>
                <div>
                  <p className="text-white font-bold text-sm">{childName || '—'}</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    {childAge === 2 ? `2–3 ${t.opt_years || 'Years'}` : childAge === 4 ? `4–5 ${t.opt_years || 'Years'}` : ''}
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  ✨ Prefills form
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {profileSaving ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving…
                </>
              ) : (
                t.button_save_changes
              )}
            </button>
          </form>
        </section>

        {/* Contact Support */}
        <section className="p-10 rounded-[3rem] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-black text-lg">{t.account_support || 'Contact Support'}</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">info@storia.land</p>
            </div>
            <a
              href="mailto:info@storia.land"
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all text-sm flex items-center gap-2 border border-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {t.account_support || 'Email Us'}
            </a>
          </div>
        </section>

        {/* Log Out */}
        <section className="p-10 rounded-[3rem] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-black text-lg">{t.account_logout || 'Log Out'}</p>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">{t.account_logout_desc || 'You can log back in any time'}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all text-sm flex items-center gap-2 border border-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {t.account_logout || 'Log Out'}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-950/10 p-10 rounded-[3rem] border border-red-900/20 space-y-6">
          <div className="space-y-2">
            <h3 className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">{t.section_danger_zone}</h3>
            <p className="text-white text-2xl font-black tracking-tighter">{t.delete_account_title}</p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
              {t.delete_account_desc}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-10 py-4 bg-red-600/20 text-red-500 border-2 border-red-600/30 font-black rounded-2xl hover:bg-red-600 hover:text-white transition-all"
          >
            {t.button_delete_confirm}
          </button>
        </section>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl space-y-8 text-center animate-in zoom-in duration-300">
              <div className="text-6xl">⚠️</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">{t.delete_account_title}?</h3>
                <p className="text-zinc-400 text-sm">{t.delete_confirm_prompt}</p>
              </div>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700 text-white focus:border-red-500 focus:outline-none text-center font-black"
              />
              <div className="flex flex-col gap-3">
                <button
                  disabled={deleteConfirm !== 'DELETE'}
                  onClick={onDeleteAccount}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-500 transition-all disabled:opacity-30"
                >
                  {t.button_delete_confirm}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
