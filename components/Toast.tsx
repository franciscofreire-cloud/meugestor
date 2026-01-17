
import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info'
    };

    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[400px] animate-in slide-in-from-top-4 duration-500">
            <div className={`${colors[type]} p-1 rounded-[24px] shadow-2xl shadow-black/20 backdrop-blur-xl`}>
                <div className="bg-white/10 backdrop-blur-md rounded-[22px] p-4 flex items-center gap-4 border border-white/20">
                    <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white font-black">{icons[type]}</span>
                    </div>
                    <p className="flex-1 text-sm font-black text-white leading-tight">
                        {message}
                    </p>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full bg-black/10 flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <span className="material-symbols-outlined text-white text-lg">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toast;
