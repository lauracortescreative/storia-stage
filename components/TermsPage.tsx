
import React, { useState } from 'react';
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
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-zinc-800 pb-8 gap-6">
                    <div className="space-y-2">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Legal</p>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Terms &amp; Conditions</h1>
                        <p className="text-zinc-500 text-sm">Last updated: February 2026 · Spoonful Labs, Ltd</p>
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
                        Welcome to <strong className="text-white">Storia</strong>, an AI-powered audiobook and bedtime storytelling app developed by <strong className="text-white">Spoonful Labs, Ltd</strong>. By creating an account or using the app, you agree to the following terms. We've written them plainly — please read them.
                    </p>
                </div>

                <div className="space-y-6">

                    <Section icon="✅" title="Acceptance of Terms">
                        <p>By accessing or using Storia, you confirm that you are at least 18 years old (or the legal age of majority in your jurisdiction) and that you accept these Terms in full. If you are using Storia on behalf of a child, you accept these Terms on their behalf and take responsibility for their use of the service.</p>
                        <p>If you do not agree with any part of these Terms, do not use Storia.</p>
                    </Section>

                    <Section icon="🪄" title="What Storia Does">
                        <p>Storia uses Google's Gemini API and AI image generation to create personalized bedtime stories and accompanying illustrations in real time. Each story is unique to your session and generated based on the inputs you provide — keywords, region, character names, language, and settings.</p>
                        <p>Because content is AI-generated, you may occasionally encounter variations in quality, tone, or style. We apply content moderation filters, but no automated system is perfect. Please report any inappropriate content to <span className="text-indigo-400">hello@storia.land</span>.</p>
                    </Section>

                    <Section icon="👤" title="Your Account">
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            <li>You must provide a valid email address to register.</li>
                            <li>You are responsible for keeping your account credentials secure.</li>
                            <li>One account per person. You may not share, sell, or transfer your account.</li>
                            <li>You may delete your account at any time from your account settings. All associated data is permanently removed immediately.</li>
                            <li>We reserve the right to suspend or terminate accounts that violate these Terms, with or without notice.</li>
                        </ul>
                    </Section>

                    <Section icon="🎟️" title="Plans, Payments & Billing">
                        <p><strong className="text-zinc-200">Free plan:</strong> new accounts receive 5 free story generations per month during our early access period. This limit is subject to change and will be communicated before any reduction takes effect.</p>
                        <p><strong className="text-zinc-200">Storia Plus:</strong> a paid subscription providing 20 story generations per month, unlocked via Stripe. Subscriptions auto-renew monthly or yearly depending on your choice.</p>
                        <p><strong className="text-zinc-200">Story bundles:</strong> one-time purchases of additional story credits. These never expire and are non-refundable once used.</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1 mt-2">
                            <li>All prices are shown in USD unless your local currency is detected.</li>
                            <li>Payments are processed by Stripe. We do not store payment card details.</li>
                            <li>Subscriptions can be cancelled at any time; access continues until the end of the billing period.</li>
                            <li>We offer refunds on a case-by-case basis. Contact <span className="text-indigo-400">hello@storia.land</span> within 7 days of a charge you believe is erroneous.</li>
                        </ul>
                    </Section>

                    <Section icon="🎨" title="AI-Generated Content & Ownership">
                        <p>All stories, narrations, and illustrations produced by Storia are generated in real time by AI models. Each piece of content is:</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            <li><strong className="text-zinc-200">Unique to your session</strong> — the same inputs won't produce the exact same output twice.</li>
                            <li><strong className="text-zinc-200">Licensed to you personally</strong> — you may use generated content for private, non-commercial, family use only.</li>
                            <li><strong className="text-zinc-200">Not for redistribution</strong> — you may not sell, sublicense, or publicly distribute generated stories or images without our prior written consent.</li>
                            <li><strong className="text-zinc-200">Not for AI training</strong> — you may not use generated content to train, fine-tune, or benchmark AI models.</li>
                        </ul>
                        <p>The underlying app code, design, branding, and platform remain the intellectual property of Spoonful Labs, Ltd. All rights reserved.</p>
                    </Section>

                    <Section icon="🛡️" title="Safety & Content Moderation">
                        <p>Storia is designed for young children and their families. We apply the following content controls:</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            <li>Real-time keyword filtering on all story inputs.</li>
                            <li>Gemini API safety settings configured to block harmful, violent, sexual, or inappropriate content.</li>
                            <li>Image generation prompts are constrained to child-safe themes.</li>
                        </ul>
                        <p>You agree not to attempt to circumvent these filters through jailbreaking, prompt injection, or any other technique. Attempts to do so will result in immediate account termination.</p>
                        <p>If any generated content concerns you, please report it to <span className="text-indigo-400">hello@storia.land</span> and we will investigate within 48 hours.</p>
                    </Section>

                    <Section icon="🚫" title="Prohibited Uses">
                        <p>You may not use Storia to:</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            <li>Generate content that is illegal, hateful, abusive, or harmful to children.</li>
                            <li>Impersonate any person or entity.</li>
                            <li>Attempt to reverse-engineer, scrape, or extract the AI models or underlying systems.</li>
                            <li>Use automated scripts or bots to access the service.</li>
                            <li>Resell or commercialize your access to the platform.</li>
                            <li>Interfere with or disrupt the integrity or performance of the service.</li>
                        </ul>
                    </Section>

                    <Section icon="⚠️" title="Disclaimers & Limitation of Liability">
                        <p>Storia is provided <strong className="text-zinc-200">"as is"</strong> without warranties of any kind — express or implied. We do not guarantee:</p>
                        <ul className="list-disc list-inside space-y-1.5 ml-1">
                            <li>Uninterrupted or error-free access to the service.</li>
                            <li>That AI-generated stories will always meet your expectations in quality or tone.</li>
                            <li>That third-party services (Gemini API, Stripe, Supabase) will be continuously available.</li>
                        </ul>
                        <p>To the maximum extent permitted by law, Spoonful Labs, Ltd shall not be liable for any indirect, incidental, or consequential damages arising from your use of Storia. Our total liability in any matter is limited to the amount you paid us in the 3 months preceding the claim.</p>
                    </Section>

                    <Section icon="🌍" title="Governing Law">
                        <p>These Terms are governed by the laws of the <strong className="text-zinc-200">European Union</strong> and, where applicable, the laws of the country in which Spoonful Labs, Ltd is incorporated. Any disputes will be resolved through binding arbitration, or in the courts of our jurisdiction, at our election.</p>
                        <p>If you are a consumer in the EU, you retain all rights granted by mandatory local consumer protection laws, which these Terms do not override.</p>
                    </Section>

                    <Section icon="📝" title="Changes to These Terms">
                        <p>We may update these Terms as the service evolves. If we make material changes, we will notify you by email or via an in-app notice at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.</p>
                        <p>The most current version will always be available at <span className="text-indigo-400">storia.land/terms</span>.</p>
                    </Section>

                    <Section icon="📬" title="Contact Us">
                        <p>If you have any questions about these Terms, please reach out:</p>
                        <ul className="list-none space-y-1 ml-1">
                            <li>📧 <strong className="text-zinc-200">Email:</strong> <span className="text-indigo-400">hello@storia.land</span></li>
                            <li>🌐 <strong className="text-zinc-200">Website:</strong> <span className="text-indigo-400">storia.land</span></li>
                            <li>📸 <strong className="text-zinc-200">Instagram:</strong> <span className="text-indigo-400">@storia.land</span></li>
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
                            <p className="text-white font-black group-hover:text-indigo-300 transition-colors">Privacy Policy →</p>
                            <p className="text-zinc-500 text-sm">How we handle your family's data</p>
                        </button>
                    )}
                    <div className="flex-1 p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] text-center space-y-2">
                        <p className="text-white font-black">Questions?</p>
                        <p className="text-zinc-400 text-sm">Email us at <strong className="text-indigo-400">hello@storia.land</strong></p>
                    </div>
                </div>

                <div className="text-center text-zinc-700 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">© 2026 Spoonful Labs, Ltd · All Rights Reserved</p>
                </div>

            </div>
        </div>
    );
};

export default TermsPage;
