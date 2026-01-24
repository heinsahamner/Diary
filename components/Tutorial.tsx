
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, XCircle, Slash, ArrowRightLeft, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface TutorialProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(0);
    
    const [demoStatus, setDemoStatus] = useState<'present' | 'absent' | 'canceled'>('present');
    const [demoSubject, setDemoSubject] = useState('Matemática');

    if (!isOpen) return null;

    const handleDemoToggle = () => {
        if (demoStatus === 'present') setDemoStatus('absent');
        else if (demoStatus === 'absent') setDemoStatus('canceled');
        else setDemoStatus('present');
    };

    const handleDemoSwap = () => {
        setDemoSubject(prev => prev === 'Matemática' ? 'História (Subst.)' : 'Matemática');
    };

    const tutorialSteps = [
        {
            title: "Bem-vindo ao Diary!",
            content: (
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                        <BookOpen size={40} />
                    </div>
                    <p>
                        Vamos fazer um rápido tour para que você possa dominar todas as funções, 
                        especialmente como gerenciar seu <strong>Diário</strong>.
                    </p>
                </div>
            )
        },
        {
            title: "O Ciclo de Presença",
            content: (
                <div className="space-y-4">
                    <p className="text-sm">
                        No <strong>Diário</strong>, cada aula tem um botão de status. Ele funciona em um ciclo de 3 estados. 
                        <strong>Tente clicar no ícone abaixo:</strong>
                    </p>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm max-w-xs mx-auto">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white">Física</p>
                            <p className="text-xs text-gray-500">07:30 - 08:20</p>
                        </div>
                        <button 
                            onClick={handleDemoToggle}
                            className="transform active:scale-90 transition-transform"
                        >
                            {demoStatus === 'present' && <CheckCircle size={28} className="text-green-500 bg-green-50 dark:bg-green-900/20 rounded-full" />}
                            {demoStatus === 'absent' && <XCircle size={28} className="text-red-500 bg-red-50 dark:bg-red-900/20 rounded-full" />}
                            {demoStatus === 'canceled' && <Slash size={28} className="text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                        <div className={`p-2 rounded ${demoStatus === 'present' ? 'bg-green-100 dark:bg-green-900/30 font-bold' : 'opacity-50'}`}>
                            1. Presente
                        </div>
                        <div className={`p-2 rounded ${demoStatus === 'absent' ? 'bg-red-100 dark:bg-red-900/30 font-bold' : 'opacity-50'}`}>
                            2. Falta
                        </div>
                        <div className={`p-2 rounded ${demoStatus === 'canceled' ? 'bg-gray-100 dark:bg-gray-700 font-bold' : 'opacity-50'}`}>
                            3. Cancelada
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center italic">
                        Nota: Aulas canceladas ("Não dada") não contam para o cálculo de frequência.
                    </p>
                </div>
            )
        },
        {
            title: "Substituição de Aula",
            content: (
                <div className="space-y-4">
                    <p className="text-sm">
                        O professor faltou e houve uma troca? Use o botão de <strong>Substituição</strong>.
                        Isso ajusta a contagem de aulas corretamente.
                    </p>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm max-w-xs mx-auto relative overflow-hidden">
                        <div>
                            <p className="font-bold text-gray-800 dark:text-white transition-all key={demoSubject} animate-fade-in">
                                {demoSubject}
                            </p>
                            <p className="text-xs text-gray-500">08:20 - 09:10</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleDemoSwap}
                                className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 animate-pulse"
                            >
                                <ArrowRightLeft size={18} />
                            </button>
                            <CheckCircle size={28} className="text-gray-300" />
                        </div>
                    </div>
                    <p className="text-xs text-center text-indigo-600 dark:text-indigo-400 font-bold">
                        Clique nas setas acima para testar!
                    </p>
                </div>
            )
        },
        {
            title: "Iniciando o Dia",
            content: (
                <div className="space-y-4 text-center">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 inline-block mb-2">
                        <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 justify-center">
                            <RefreshCw size={16} /> Iniciar Dia
                        </p>
                    </div>
                    <p className="text-sm">
                        Ao abrir o Diário, os dias aparecem como "Não Iniciados". Você deve clicar no botão 
                        <strong> Iniciar Dia</strong> para confirmar que houve aula.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-left flex gap-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={18} />
                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            Se você iniciou sem querer, use o botão de <strong className="text-red-500">Reiniciar</strong> no topo do Diário para apagar os registros daquele dia.
                        </p>
                    </div>
                </div>
            )
        }
    ];

    const isLastStep = step === tutorialSteps.length - 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-6 pb-0 flex justify-between items-center">
                    <div className="flex gap-1">
                        {tutorialSteps.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} 
                            />
                        ))}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-center min-h-[300px]">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                        {tutorialSteps[step].title}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {tutorialSteps[step].content}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <button 
                        onClick={() => setStep(prev => Math.max(0, prev - 1))}
                        disabled={step === 0}
                        className={`p-3 rounded-full transition-colors ${step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button 
                        onClick={() => {
                            if (isLastStep) onClose();
                            else setStep(prev => prev + 1);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                    >
                        {isLastStep ? 'Entendi!' : 'Próximo'}
                        {!isLastStep && <ChevronRight size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};