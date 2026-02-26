
import React, { useState } from 'react';
import { UITranslations } from '../types';
import { useToast } from './ToastContext';

interface HelpPageProps {
    translations: UITranslations;
    userEmail?: string;
    onBack: () => void;
}

const SUBJECTS = [
    'I have a question about my subscription',
    'I found a bug',
    'I need help with a story',
    'Feature request',
    'Something else',
];

const HelpPage: React.FC<HelpPageProps> = ({ translations: t, userEmail = '', onBack }) => {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState(userEmail);
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !message.trim()) {
            showToast('Please fill in all fields.', 'error');
            return;
        }
        setSending(true);
        try {
            const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
            const res = await fetch(`${BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to send message');
            }
            setSent(true);
            showToast('Message sent! We\'ll get back to you soon.', 'success');
        } catch (err: any) {
            showToast(err.message || 'Could not send message. Please try again.', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black py-12 px-4 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter">Help & Support</h2>
                        <p className="text-zinc-500 text-sm mt-1">We usually reply within a few hours.</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center gap-2 text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>

                {sent ? (
                    /* Success state */
                    <div className="text-center py-20 space-y-6 animate-in zoom-in duration-300">
                        <div className="text-7xl">💌</div>
                        <h3 className="text-3xl font-black text-white">Message sent!</h3>
                        <p className="text-zinc-400 max-w-sm mx-auto">
                            Thanks for reaching out. We'll reply to <strong className="text-white">{email}</strong> as soon as we can.
                        </p>
                        <button
                            onClick={onBack}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg"
                        >
                            Back to Storia
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name + Email row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Laura"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">Your Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-medium transition-colors"
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">Subject</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSubject(s)}
                                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${subject === s
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block">Message</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Tell us what's on your mind…"
                                required
                                rows={6}
                                className="w-full px-5 py-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none font-medium resize-none transition-colors"
                            />
                            <p className="text-zinc-600 text-xs text-right">{message.length} / 2000</p>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg text-base flex items-center justify-center gap-3 disabled:opacity-60"
                        >
                            {sending ? (
                                <><span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Sending…</>
                            ) : (
                                <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Message</>
                            )}
                        </button>

                        {/* Alt contact */}
                        <p className="text-center text-zinc-600 text-xs">
                            Or email us directly at{' '}
                            <a href="mailto:info@storia.land" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                info@storia.land
                            </a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default HelpPage;
