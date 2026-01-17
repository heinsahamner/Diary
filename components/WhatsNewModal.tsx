
import React from 'react';
import { Release } from '../data/changelog';
import { X, Sparkles, Bug, Paintbrush, Zap, ArrowRight, User } from 'lucide-react';

interface WhatsNewModalProps {
    isOpen: boolean;
    onClose: () => void;
    release: Release;
}

export function WhatsNewModal({ isOpen, onClose, release }: WhatsNewModalProps) {
    if (!isOpen) return null;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'feature': return <Sparkles size={18} className="text-indigo-500" />;
            case 'fix': return <Bug size={18} className="text-red-500" />;
            case 'style': return <Paintbrush size={18} className="text-pink-500" />;
            default: return <Zap size={18} className="text-yellow-500" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-in border border-white/20 dark:border-gray-700">
                
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/10">
                            <Sparkles size={12} />
                            <span>Nova Atualização</span>
                        </div>
                        <h2 className="text-3xl font-bold">Versão {release.version}</h2>
                        <p className="text-indigo-100 text-sm mt-1 opacity-90">Confira o que a comunidade ajudou a construir!</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {release.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl h-fit border border-gray-100 dark:border-gray-700">
                                    {getTypeIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 dark:text-white text-base leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                        {item.description}
                                    </p>
                                    
                                    {item.contributor && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                                            <div className="bg-indigo-200 dark:bg-indigo-800 rounded-full p-0.5">
                                                <User size={10} className="text-indigo-700 dark:text-indigo-300" />
                                            </div>
                                            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                                {item.contributorRole ? `${item.contributorRole} por ` : 'Sugerido por '}
                                                <span className="underline decoration-indigo-300 dark:decoration-indigo-700">{item.contributor}</span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 shrink-0">
                    <button 
                        onClick={onClose}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Explorar Novidades</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
