
import React from 'react';
import { UITranslations } from '../types';

interface PrivacyPolicyPageProps {
  translations: UITranslations;
  onBack: () => void;
  onGoToTerms?: () => void;
}

const Section: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="p-8 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 space-y-4">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-white text-lg font-black tracking-tight">{title}</h3>
    </div>
    <div className="text-zinc-400 text-sm leading-relaxed font-medium space-y-3 pl-9">
      {children}
    </div>
  </div>
);

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ translations: t, onBack, onGoToTerms }) => {
  return (
    <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-8 gap-6">
          <div className="space-y-2">
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.privacy_label}</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.privacy_title}</h1>
            <p className="text-zinc-500 text-sm">{t.privacy_last_updated}</p>
          </div>
          <button
            onClick={onBack}
            className="shrink-0 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.terms_back}
          </button>
        </div>

        {/* Intro */}
        <div className="px-2">
          <p className="text-zinc-300 text-base leading-relaxed">
            {t.privacy_intro_full}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">

          <Section icon="📋" title={t.privacy_s_collect_title || ''}>
            <p>{t.privacy_s_collect_intro}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_collect_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>

          <Section icon="🛠️" title={t.privacy_s_use_title || ''}>
            <p>{t.privacy_s_use_intro}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_use_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-2">{t.privacy_s_use_footer}</p>
          </Section>

          <Section icon="🤝" title={t.privacy_s_third_title || ''}>
            <p>{t.privacy_s_third_intro}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-zinc-200">Supabase</strong> — {t.privacy_s_third_supabase} <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">{t.privacy_s_third_policy_link}</a></li>
              <li><strong className="text-zinc-200">Google (Gemini API)</strong> — {t.privacy_s_third_google} <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">{t.privacy_s_third_policy_link}</a></li>
              <li><strong className="text-zinc-200">Stripe</strong> — {t.privacy_s_third_stripe} <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">{t.privacy_s_third_policy_link}</a></li>
              <li><strong className="text-zinc-200">Netlify</strong> — {t.privacy_s_third_netlify} <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">{t.privacy_s_third_policy_link}</a></li>
            </ul>
          </Section>

          <Section icon="👶" title={t.privacy_s_children_title || ''}>
            <p>{t.privacy_s_children_p1}</p>
            <p>{t.privacy_s_children_p2}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_children_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t.privacy_s_children_contact}</p>
          </Section>

          <Section icon="🍪" title={t.privacy_s_cookies_title || ''}>
            <p>{t.privacy_s_cookies_intro}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_cookies_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t.privacy_s_cookies_footer}</p>
          </Section>

          <Section icon="🔐" title={t.privacy_s_security_title_full || ''}>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_security_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t.privacy_s_security_footer}</p>
          </Section>

          <Section icon="⚖️" title={t.privacy_s_rights_title || ''}>
            <p>{t.privacy_s_rights_intro}</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              {(t.privacy_s_rights_list || '').split('\n').map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>{t.privacy_s_rights_footer}</p>
          </Section>

          <Section icon="🌍" title={t.privacy_s_transfers_title || ''}>
            <p>{t.privacy_s_transfers_body}</p>
          </Section>

          <Section icon="📣" title={t.privacy_s_changes_title || ''}>
            <p>{t.privacy_s_changes_body}</p>
          </Section>

        </div>

        {/* Contact + Link to Terms */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <div className="flex-1 p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] text-center space-y-2">
            <p className="text-white font-black">{t.privacy_questions_title}</p>
            <p className="text-zinc-400 text-sm">{t.privacy_questions_email} <strong className="text-indigo-400">info@storia.land</strong></p>
          </div>
          {onGoToTerms && (
            <button
              onClick={onGoToTerms}
              className="flex-1 p-6 bg-zinc-900/40 border border-zinc-700 hover:border-zinc-500 rounded-[2rem] text-center space-y-2 transition-all group"
            >
              <p className="text-white font-black group-hover:text-indigo-300 transition-colors">{t.privacy_terms_cta}</p>
              <p className="text-zinc-500 text-sm">{t.privacy_terms_cta_desc}</p>
            </button>
          )}
        </div>

        <div className="text-center text-zinc-700 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t.privacy_footer_text}</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
