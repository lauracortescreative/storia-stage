
import React, { useState } from 'react';
import { UITranslations } from '../types';

interface AccountPageProps {
  translations: UITranslations;
  email: string;
  onUpdateEmail: (newEmail: string) => void;
  onDeleteAccount: () => void;
  onBack: () => void;
}

const AccountPage: React.FC<AccountPageProps> = ({ translations: t, email, onUpdateEmail, onDeleteAccount, onBack }) => {
  const [newEmail, setNewEmail] = useState(email);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEmail(newEmail);
    setMessage(t.account_updated);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto space-y-12">
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

        {message && (
          <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-2xl text-center font-bold animate-in zoom-in duration-300">
            {message}
          </div>
        )}

        <section className="bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-800 space-y-8">
          <form onSubmit={handleUpdate} className="space-y-6">
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
