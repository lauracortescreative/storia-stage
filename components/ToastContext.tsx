import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } });

export function useToast() {
    return useContext(ToastContext);
}

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), type === 'error' ? 5000 : 4000);
    }, []);

    const icon = (type: ToastType) =>
        type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✅';

    const bg = (type: ToastType) =>
        type === 'error'
            ? 'bg-red-950 border-red-700/60 text-red-200'
            : type === 'info'
                ? 'bg-zinc-900 border-zinc-600/60 text-zinc-200'
                : 'bg-zinc-900 border-green-600/40 text-green-300';

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Bottom-right toast stack */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`max-w-sm w-full px-5 py-4 rounded-2xl font-bold shadow-2xl border
              animate-in slide-in-from-bottom-3 duration-300
              flex items-start gap-3 pointer-events-auto
              ${bg(toast.type)}`}
                    >
                        <span className="text-lg mt-0.5 shrink-0">{icon(toast.type)}</span>
                        <span className="text-sm leading-snug">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
