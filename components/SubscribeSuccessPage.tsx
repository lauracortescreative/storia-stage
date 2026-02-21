
import React, { useEffect } from 'react';
import { UITranslations, UserStats } from '../types';

interface SubscribeSuccessPageProps {
    translations: UITranslations;
    onContinue: () => void;
    onRefreshStats: () => void;
}

const SubscribeSuccessPage: React.FC<SubscribeSuccessPageProps> = ({ translations: t, onContinue, onRefreshStats }) => {
    useEffect(() => {
        // Re-fetch user stats so the UI reflects the new Plus plan immediately
        onRefreshStats();
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-lg w-full bg-zinc-900 border border-white/10 rounded-[3rem] p-12 text-center space-y-10 shadow-2xl relative overflow-hidden">
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                <div className="space-y-6">
                    <div className="text-7xl animate-bounce">🎉</div>
                    <div className="space-y-3">
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Welcome to</p>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Storia Plus</h1>
                        <p className="text-zinc-400 text-lg font-medium leading-relaxed">
                            You now have access to 20 stories per month, all regions, all voices, and everything magical.
                        </p>
                    </div>
                </div>

                {/* Feature recap */}
                <div className="grid grid-cols-1 gap-3 text-left">
                    {[
                        '✦ 20 stories every month',
                        '✦ All cultural regions unlocked',
                        '✦ Every voice & soundscape',
                        '✦ Coloring book downloads',
                        '✦ Saves & favourites',
                    ].map((feat, i) => (
                        <p key={i} className="text-zinc-300 text-sm font-bold">{feat}</p>
                    ))}
                </div>

                <button
                    onClick={onContinue}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-[2.5rem] transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                    Start Creating ✨
                </button>

                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    Magic Responsibly © 2026 Storia Labs
                </p>
            </div>
        </div>
    );
};

export default SubscribeSuccessPage;
