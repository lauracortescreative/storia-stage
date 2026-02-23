
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
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Legal</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Privacy Policy</h1>
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
            At <strong className="text-white">Storia</strong>, we build products for families — and we take that responsibility seriously. This policy explains exactly what data we collect, how we use it, and the rights you hold as a user. We keep this language plain on purpose: no legalese, no surprises.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">

          <Section icon="📋" title="What We Collect">
            <p>We collect the minimum necessary to provide the service:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-zinc-200">Account data</strong> — your email address and a hashed password, securely stored via Supabase Auth.</li>
              <li><strong className="text-zinc-200">Story preferences</strong> — keywords, regional settings, language, voice choices, and any child name you enter. These are used only to generate your story.</li>
              <li><strong className="text-zinc-200">Child profile</strong> (optional) — if you save a child's name, age range, and avatar in your account settings, this is stored securely and used only to prefill the story form for your convenience.</li>
              <li><strong className="text-zinc-200">Usage statistics</strong> — how many stories you have generated this month, to enforce plan limits. No story content is shared with third parties for analytics.</li>
              <li><strong className="text-zinc-200">Voice Lab audio</strong> — an 8-second sample you record is sent to our AI model to find a narrator match. It is <em>not</em> stored permanently after the session ends.</li>
            </ul>
          </Section>

          <Section icon="🛠️" title="How We Use Your Data">
            <p>We use your data for one purpose: delivering Storia to you.</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>Generating personalized bedtime stories via the Gemini API (Google).</li>
              <li>Creating and serving AI-generated illustrations for your story scenes.</li>
              <li>Processing Voice Lab audio samples to match a narrator profile.</li>
              <li>Managing your subscription and story generation limits via Stripe.</li>
              <li>Restoring your saved stories and preferences when you log in.</li>
            </ul>
            <p className="mt-2">We do <strong className="text-zinc-200">not</strong> sell your data. We do <strong className="text-zinc-200">not</strong> use your data to train AI models. We do <strong className="text-zinc-200">not</strong> serve ads.</p>
          </Section>

          <Section icon="🤝" title="Third-Party Services">
            <p>Storia uses a small number of trusted third-party providers:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-zinc-200">Supabase</strong> — database and authentication. Data is stored in EU data centres. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Privacy policy →</a></li>
              <li><strong className="text-zinc-200">Google (Gemini API)</strong> — story and image generation. API calls include your story prompt. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Privacy policy →</a></li>
              <li><strong className="text-zinc-200">Stripe</strong> — payment processing. We never see or store your card details. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Privacy policy →</a></li>
              <li><strong className="text-zinc-200">Netlify</strong> — hosting and CDN. Standard access logs may be retained for 30 days. <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Privacy policy →</a></li>
            </ul>
          </Section>

          <Section icon="👶" title="Children's Privacy">
            <p>Storia is a tool for <strong className="text-zinc-200">parents</strong>, not for children to use independently. We do not knowingly collect personal information directly from children under 13.</p>
            <p>Any child name entered into the story form or child profile is:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>Used only to personalize the story narrative.</li>
              <li>Stored under the parent's account, not attributed to the child.</li>
              <li>Deletable at any time from your account settings.</li>
            </ul>
            <p>We comply with COPPA (US) and GDPR-K (EU) principles. If you believe a child has provided us personal data without parental consent, contact us immediately at <span className="text-indigo-400">hello@storia.land</span>.</p>
          </Section>

          <Section icon="🍪" title="Cookies & Local Storage">
            <p>We use <strong className="text-zinc-200">no third-party tracking cookies</strong>. We use browser localStorage for:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>Your JWT authentication token (session management).</li>
              <li>Cached UI translations to avoid re-fetching on every visit.</li>
              <li>Your preferred language and region settings.</li>
              <li>Temporary story data for the current session.</li>
            </ul>
            <p>This data stays on your device. You can clear it at any time in your browser settings.</p>
          </Section>

          <Section icon="🔐" title="Security">
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li>All traffic is encrypted over HTTPS/TLS.</li>
              <li>Passwords are never stored in plaintext — Supabase handles bcrypt hashing.</li>
              <li>Authentication uses short-lived JWTs with server-side verification on every request.</li>
              <li>Our backend uses Supabase's service-role key from a private server — it is never exposed to the client.</li>
            </ul>
            <p>No system is 100% secure. In the event of a breach affecting your data, we will notify you within 72 hours as required by GDPR.</p>
          </Section>

          <Section icon="⚖️" title="Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-1">
              <li><strong className="text-zinc-200">Access</strong> — request a copy of all data we hold about you.</li>
              <li><strong className="text-zinc-200">Correction</strong> — update your email address from your account settings.</li>
              <li><strong className="text-zinc-200">Deletion</strong> — permanently delete your account and all associated data from your account settings. This is immediate and irreversible.</li>
              <li><strong className="text-zinc-200">Portability</strong> — request an export of your saved stories.</li>
              <li><strong className="text-zinc-200">Objection</strong> — object to any processing we perform.</li>
            </ul>
            <p>To exercise any right, email us at <span className="text-indigo-400">hello@storia.land</span>. We respond within 30 days.</p>
          </Section>

          <Section icon="🌍" title="International Transfers">
            <p>Storia is operated from the European Union. If you access the service from outside the EU, your data may be processed in the EU and in the US (Google, Stripe). These transfers are governed by Standard Contractual Clauses and the EU–US Data Privacy Framework.</p>
          </Section>

          <Section icon="📣" title="Changes to This Policy">
            <p>If we make material changes, we will notify you by email or by a prominent notice when you next open the app. The "Last updated" date at the top of this page will always reflect the most recent version. Continuing to use Storia after changes constitutes acceptance of the updated policy.</p>
          </Section>

        </div>

        {/* Contact + Link to Terms */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <div className="flex-1 p-6 bg-indigo-900/10 border border-indigo-500/20 rounded-[2rem] text-center space-y-2">
            <p className="text-white font-black">Questions?</p>
            <p className="text-zinc-400 text-sm">Email us at <strong className="text-indigo-400">hello@storia.land</strong></p>
          </div>
          {onGoToTerms && (
            <button
              onClick={onGoToTerms}
              className="flex-1 p-6 bg-zinc-900/40 border border-zinc-700 hover:border-zinc-500 rounded-[2rem] text-center space-y-2 transition-all group"
            >
              <p className="text-white font-black group-hover:text-indigo-300 transition-colors">Terms & Conditions →</p>
              <p className="text-zinc-500 text-sm">What you agree to when using Storia</p>
            </button>
          )}
        </div>

        <div className="text-center text-zinc-700 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Your Family's Privacy Matters · © 2026 Spoonful Labs, Ltd</p>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
