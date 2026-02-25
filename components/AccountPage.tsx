
import React, { useState } from 'react';
import { UITranslations } from '../types';
import { ChildProfile } from '../services/api';

const AVATAR_OPTIONS = ['🐻', '🦁', '🐼', '🦊', '🐸', '🦄', '🦋', '🐬', '🦕', '🌟', '🚀', '🧸'];

interface AccountPageProps {
  translations: UITranslations;
  email: string;
  childProfile: ChildProfile;
  onUpdateEmail: (newEmail: string) => void;
  onSaveProfile: (profile: ChildProfile) => Promise<void>;
  onDeleteAccount: () => void;
  onLogout: () => void;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({
  translations: t,
  email,
  childProfile,
  onUpdateEmail,
  onSaveProfile,
  onDeleteAccount,
  onLogout,
  onBack
}) => {
  const [newEmail, setNewEmail] = useState(email);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Child profile state
  const [childName, setChildName] = useState(childProfile.childName || '');
  const [childAge, setChildAge] = useState<number | null>(childProfile.childAge ?? null);
  const [childAvatar, setChildAvatar] = useState(childProfile.childAvatar || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

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

        {/* Success Toast */}
        {message && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-2xl text-center font-bold animate-in zoom-in duration-300">
            {message}
          </div>
        )}

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

        {/* ── Your Child Section ─────────────────────────────────────────────── */}
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
                  <p className="text-white font-bold text-sm">
                    {childName || '—'}
                  </p>
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
