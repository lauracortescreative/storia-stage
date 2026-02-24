
import React from 'react';
import { UITranslations } from '../types';

interface TermsPageProps {
    translations: UITranslations;
    onBack: () => void;
    onGoToPrivacy?: () => void;
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

const TermsPage: React.FC<TermsPageProps> = ({ translations: t, onBack, onGoToPrivacy }) => {
    return (
        <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-8 gap-6">
                    <div className="space-y-2">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.terms_label}</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">{t.terms_title}</h1>
                        <p className="text-zinc-500 text-sm">{t.terms_last_updated}</p>
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
                        {t.terms_intro_text}
                    </p>
                </div>

                <div className="space-y-6">

                    <Section icon="✅" title={t.terms_s_accept_title || ''}>
                        <p>{t.terms_s_accept_p1}</p>
                        <p>{t.terms_s_accept_p2}</p>
                    </Section>

                    <Section icon="🪄" title={t.terms_s_what_title || ''}>
                        <p>{t.terms_s_what_p1}</p>
                        <p>{t.terms_s_what_p2}</p>
                    </Section>

                    <Section icon="👤" title={t.terms_s_account_title || ''}>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            {(t.terms_s_account_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon="🎟️" title={t.terms_s_bill_title || ''}>
                        <p><strong className="text-zinc-200">{t.terms_s_bill_free}</strong></p>
                        <p><strong className="text-zinc-200">{t.terms_s_bill_plus}</strong></p>
                        <p><strong className="text-zinc-200">{t.terms_s_bill_bundles}</strong></p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1 mt-2">
                            {(t.terms_s_bill_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon="🎨" title={t.terms_s_content_title || ''}>
                        <p>{t.terms_s_content_intro}</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            {(t.terms_s_content_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                        <p>{t.terms_s_content_footer}</p>
                    </Section>

                    <Section icon="🛡️" title={t.terms_s_safety_title || ''}>
                        <p>{t.terms_s_safety_intro}</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            {(t.terms_s_safety_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                        <p>{t.terms_s_safety_p1}</p>
                        <p>{t.terms_s_safety_p2}</p>
                    </Section>

                    <Section icon="🚫" title={t.terms_s_prohibited_title || ''}>
                        <p>{t.terms_s_prohibited_intro}</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            {(t.terms_s_prohibited_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </Section>

                    <Section icon="⚠️" title={t.terms_s_disclaimer_title || ''}>
                        <p>{t.terms_s_disclaimer_intro}</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            {(t.terms_s_disclaimer_list || '').split('\n').map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                        <p>{t.terms_s_disclaimer_footer}</p>
                    </Section>

                    <Section icon="🌍" title={t.terms_s_law_title || ''}>
                        <p>{t.terms_s_law_p1}</p>
                        <p>{t.terms_s_law_p2}</p>
                    </Section>

                    <Section icon="📝" title={t.terms_s_changes_title || ''}>
                        <p>{t.terms_s_changes_p1}</p>
                        <p>{t.terms_s_changes_p2}</p>
                    </Section>

                    <Section icon="📬" title={t.terms_s_contact_title || ''}>
                        <p>{t.terms_s_contact_intro}</p>
                        <ul className="list-none space-y-1 ml-1">
                            <li>📧 <strong className="text-zinc-200">{t.terms_s_contact_email_label}</strong> <span className="text-indigo-400">info@storia.land</span></li>
                            <li>🌐 <strong className="text-zinc-200">{t.terms_s_contact_website_label}</strong> <span className="text-indigo-400">storia.land</span></li>
                            <li>📸 <strong className="text-zinc-200">{t.terms_s_contact_instagram_label}</strong> <span className="text-indigo-400">@storia.land</span></li>
                        </ul>
                    </Section>

                </div>

                {/* Link to Privacy Policy */}
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    {onGoToPrivacy && (
                        <button
                            onClick={onGoToPrivacy}
                            className="flex-1 p-6 bg-zinc-900/40 border border-zinc-700 hover:border-zinc-500 rounded-[2rem] text-center space-y-2 transition-all group"
                        >
                            <p className="text-white font-black group-hover:text-indigo-300 transition-colors">{t.terms_privacy_cta}</p>
                            <p className="text-zinc-500 text-sm">{t.terms_privacy_cta_desc}</p>
                        </button>
                    )}
                    <div className="flex-1 p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] text-center space-y-2">
                        <p className="text-white font-black">{t.terms_questions_title}</p>
                        <p className="text-zinc-400 text-sm">{t.terms_questions_email} <strong className="text-indigo-400">info@storia.land</strong></p>
                    </div>
                </div>

                <div className="text-center text-zinc-700 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t.terms_footer_text}</p>
                </div>

            </div>
        </div>
    );
};

export default TermsPage;
