
import React, { useEffect, useState } from 'react';

interface VerifyEmailPageProps {
    token: string;
    onContinue: () => void;
}

const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ token, onContinue }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';
                const res = await fetch(`${BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Verification failed');
                setStatus('success');
            } catch (err: any) {
                setErrorMsg(err.message || 'Invalid or expired link');
                setStatus('error');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
                {status === 'loading' && (
                    <>
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto" />
                        <p className="text-zinc-400 font-bold">Verifying your email…</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-7xl">✅</div>
                        <h1 className="text-3xl font-black text-white">Email verified!</h1>
                        <p className="text-zinc-400">Your Storia account is now fully verified. Time to create some magic.</p>
                        <button
                            onClick={onContinue}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl text-base"
                        >
                            Start Creating Stories ✨
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="text-7xl">❌</div>
                        <h1 className="text-3xl font-black text-white">Link expired</h1>
                        <p className="text-zinc-400">{errorMsg}</p>
                        <p className="text-zinc-600 text-sm">Verification links expire after 24 hours. Log in and request a new one from your Account page.</p>
                        <button
                            onClick={onContinue}
                            className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl transition-all"
                        >
                            Go to Account
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
