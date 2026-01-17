
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    icon?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    icon = 'share'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-[340px] rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-black/5">
                <div className="p-8 text-center italic">
                    <div className="size-20 bg-brand rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20">
                        <span className="material-symbols-outlined text-black text-4xl font-light">{icon}</span>
                    </div>

                    <h3 className="text-2xl font-black text-black mb-3 leading-tight">{title}</h3>
                    <p className="text-black/50 text-sm font-bold mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onConfirm}
                            className="w-full h-14 bg-black text-brand rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            {confirmLabel}
                        </button>
                        <button
                            onClick={onCancel}
                            className="w-full h-14 bg-black/5 text-black/40 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                        >
                            {cancelLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
