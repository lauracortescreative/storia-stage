
import React, { useState, useEffect } from 'react';

interface Fact { emoji: string; fact: string; }
interface Props {
    facts: Fact[];
    loadingStatus: string;
    onCancel: () => void;
    cancelLabel?: string;
}

const StoryLoaderOverlay: React.FC<Props> = ({ facts, loadingStatus, onCancel, cancelLabel = 'Cancel' }) => {
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(true);
    const [dots, setDots] = useState('');

    // Cycle facts every 6s with a fade transition
    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIndex(i => (i + 1) % facts.length);
                setVisible(true);
            }, 400);
        }, 6000);
        return () => clearInterval(interval);
    }, [facts.length]);

    // Animated ellipsis
    useEffect(() => {
        const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
        return () => clearInterval(t);
    }, []);

    const current = facts[index];

    // Floating stars positions (stable)
    const stars = [
        { top: '10%', left: '8%', size: 6, delay: '0s', dur: '3.2s' },
        { top: '20%', left: '88%', size: 4, delay: '0.5s', dur: '2.8s' },
        { top: '70%', left: '6%', size: 5, delay: '1s', dur: '3.5s' },
        { top: '80%', left: '90%', size: 7, delay: '0.2s', dur: '4s' },
        { top: '45%', left: '92%', size: 3, delay: '1.5s', dur: '2.5s' },
        { top: '60%', left: '3%', size: 4, delay: '0.8s', dur: '3.8s' },
        { top: '30%', left: '50%', size: 3, delay: '2s', dur: '3s' },
        { top: '90%', left: '40%', size: 5, delay: '0.3s', dur: '4.2s' },
    ];

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-black">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-purple-950" />

            {/* Floating stars */}
            {stars.map((s, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-white/30"
                    style={{
                        top: s.top, left: s.left,
                        width: s.size, height: s.size,
                        animation: `pulse ${s.dur} ${s.delay} infinite ease-in-out`,
                    }}
                />
            ))}

            {/* Content */}
            <div className="relative z-10 text-white text-center flex flex-col items-center px-8 max-w-lg w-full">

                {/* Spinning moon icon */}
                <div className="text-6xl mb-6" style={{ animation: 'spin 8s linear infinite' }}>🌙</div>

                {/* Loading status */}
                <p className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                    {loadingStatus}{dots}
                </p>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-10 opacity-70">
                    Your story is being crafted
                </p>

                {/* Progress shimmer bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-10">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-full"
                        style={{ width: '60%', animation: 'shimmer 2s ease-in-out infinite' }}
                    />
                </div>

                {/* Rotating fact card */}
                <div
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-sm transition-all duration-400"
                    style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}
                >
                    <div className="text-3xl mb-3">{current.emoji}</div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-indigo-300 mb-2">Did you know?</p>
                    <p className="text-white/80 text-sm leading-relaxed font-medium">{current.fact}</p>
                </div>

                {/* Fact progress dots */}
                <div className="flex gap-1.5 mb-8">
                    {facts.map((_, i) => (
                        <div
                            key={i}
                            className="rounded-full transition-all duration-300"
                            style={{
                                width: i === index ? 20 : 6,
                                height: 6,
                                background: i === index ? '#818cf8' : 'rgba(255,255,255,0.15)',
                            }}
                        />
                    ))}
                </div>

                {/* Cancel button */}
                <button
                    onClick={onCancel}
                    className="px-8 py-3 bg-white/5 rounded-full text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                >
                    {cancelLabel}
                </button>
            </div>

            <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(80%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default StoryLoaderOverlay;
