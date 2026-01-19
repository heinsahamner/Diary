import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { X, Play, Pause, CheckCircle, RotateCcw, Clock } from 'lucide-react';

interface FocusModeProps {
    task: Task;
    onClose: () => void;
    onUpdateTask: (t: Task) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ task, onClose, onUpdateTask }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionMinutes, setSessionMinutes] = useState(0);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
                if ((25 * 60 - timeLeft) % 60 === 0 && timeLeft !== 25 * 60) {
                    setSessionMinutes(prev => prev + 1);
                }
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);
    
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleComplete = () => {
        onUpdateTask({
            ...task,
            status: TaskStatus.COMPLETED,
            timeSpent: (task.timeSpent || 0) + sessionMinutes
        });
        onClose();
    };

    const handleExit = () => {
        if (sessionMinutes > 0) {
            onUpdateTask({
                ...task,
                timeSpent: (task.timeSpent || 0) + sessionMinutes
            });
        }
        onClose();
    };

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / (25 * 60);
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center text-white animate-fade-in">
            <button onClick={handleExit} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={32} />
            </button>

            <div className="text-center mb-8 px-4">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-4 border border-indigo-500/50">
                    Modo Foco
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2 max-w-2xl">{task.title}</h2>
                <p className="text-gray-400">Tempo dedicado hoje: {sessionMinutes} min</p>
            </div>

            <div className="relative mb-12">
                <svg className="transform -rotate-90 w-72 h-72 md:w-80 md:h-80">
                    <circle
                        cx="50%" cy="50%" r={radius}
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        className="text-gray-800"
                    />
                    <circle
                        cx="50%" cy="50%" r={radius}
                        stroke="currentColor" strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        className="text-indigo-500 transition-all duration-1000 ease-linear"
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-6xl md:text-7xl font-mono font-bold tracking-tighter">
                        {formatTime(timeLeft)}
                    </span>
                    <p className="text-sm text-gray-500 mt-2 font-bold tracking-widest uppercase">
                        {isActive ? 'Focando' : 'Pausado'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    onClick={() => { setIsActive(false); setTimeLeft(25*60); }}
                    className="p-4 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
                >
                    <RotateCcw size={24} />
                </button>
                
                <button 
                    onClick={toggleTimer}
                    className="p-6 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 transform hover:scale-105 transition-all"
                >
                    {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button 
                    onClick={handleComplete}
                    className="p-4 rounded-full bg-green-600/20 hover:bg-green-600 hover:text-white text-green-500 border border-green-600/50 transition-all"
                    title="Concluir Tarefa"
                >
                    <CheckCircle size={24} />
                </button>
            </div>
        </div>
    );
};