
import React, { useState, useRef, useEffect } from 'react';
import { 
    Play, Pause, SkipBack, SkipForward, Repeat1, 
    Shuffle, Music, LayoutGrid, Volume2, VolumeX, AlertCircle, 
    Loader2, Music2, PlayCircle, Disc, RefreshCw, Layers, 
    Maximize2, ListMusic, Heart
} from 'lucide-react';
import { ALBUMS, Album, Track } from '../data/albums';

type LoopMode = 'none' | 'album' | 'track';

const AudioVisualizer: React.FC<{ isPlaying: boolean; color: string }> = ({ isPlaying, color }) => (
    <div className="flex items-end gap-[3px] h-8 w-10">
        {[1, 2, 3, 4, 5].map((i) => (
            <div 
                key={i}
                className={`w-1.5 rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce' : 'h-1.5 opacity-30'}`}
                style={{ 
                    backgroundColor: color,
                    height: isPlaying ? `${Math.floor(Math.random() * 80) + 20}%` : '6px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s'
                }}
            />
        ))}
    </div>
);

export const Beats: React.FC = () => {
    const [currentAlbum, setCurrentAlbum] = useState<Album>(ALBUMS[0]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [loopMode, setLoopMode] = useState<LoopMode>('none');
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState<string | null>(null);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrack = currentAlbum.tracks[currentTrackIndex];

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        const audio = audioRef.current;

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };

        const onLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsLoading(false);
            setHasError(null);
            if (isPlaying) audio.play().catch(() => setIsPlaying(false));
        };

        const onLoadStart = () => setIsLoading(true);
        const onError = () => {
            setHasError(`Erro ao carregar mídia.`);
            setIsLoading(false);
            setIsPlaying(false);
        };
        const onEnded = () => {
            if (loopMode === 'track') {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleNext();
            }
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('loadstart', onLoadStart);
        audio.addEventListener('error', onError);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('loadstart', onLoadStart);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('ended', onEnded);
        };
    }, [loopMode, currentTrackIndex, currentAlbum]);

    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;
            audio.pause();
            audio.src = currentTrack.file;
            audio.load();
        }
    }, [currentTrack]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play().catch(() => setHasError("Interação necessária"));
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        const nextIndex = (currentTrackIndex + 1) % currentAlbum.tracks.length;
        setCurrentTrackIndex(nextIndex);
    };

    const handlePrev = () => {
        if (currentTime > 3) {
            if (audioRef.current) audioRef.current.currentTime = 0;
        } else {
            const prevIndex = (currentTrackIndex - 1 + currentAlbum.tracks.length) % currentAlbum.tracks.length;
            setCurrentTrackIndex(prevIndex);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative min-h-[85vh] flex flex-col lg:flex-row gap-8 animate-fade-in pb-20 p-2 md:p-6">
            
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div 
                    className="absolute inset-0 opacity-10 dark:opacity-20 blur-[120px] transition-all duration-1000 scale-125"
                    style={{ background: `radial-gradient(circle at 70% 30%, ${currentAlbum.accentColor}, transparent 60%), radial-gradient(circle at 30% 70%, #4f46e5, transparent 60%)` }}
                />
            </div>

            <aside className="hidden lg:flex flex-col w-72 shrink-0 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <ListMusic size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Na Fila</h3>
                </div>
                
                <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-[32px] border border-white/40 dark:border-gray-700/50 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{currentAlbum.title}</h4>
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">{currentAlbum.artist}</p>
                    </div>
                    
                    <div className="overflow-y-auto no-scrollbar flex-1 p-3 space-y-1">
                        {currentAlbum.tracks.map((track, idx) => {
                            const isActive = currentTrackIndex === idx;
                            return (
                                <button 
                                    key={track.id}
                                    onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-indigo-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        {isActive && isPlaying ? <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-white animate-pulse"></div><div className="w-0.5 h-3 bg-white animate-pulse" style={{animationDelay: '0.2s'}}></div></div> : <Play size={10} fill={isActive ? "currentColor" : "none"} />}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>{track.title}</p>
                                        <p className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-gray-400'}`}>{track.duration}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
                <div className="w-full bg-white/40 dark:bg-gray-900/60 backdrop-blur-3xl rounded-[48px] p-6 md:p-10 border border-white/60 dark:border-gray-800 shadow-2xl shadow-indigo-500/5">
                    
                    <div className="relative mb-10 group">
                        <div className="relative aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]">
                            <img 
                                src={currentAlbum.cover} 
                                className="w-full h-full object-cover" 
                                alt={currentAlbum.title} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                            
                            <div className="absolute bottom-6 left-6 flex items-end gap-3">
                                <AudioVisualizer isPlaying={isPlaying} color="white" />
                                <div className="text-white text-[10px] font-black tracking-widest uppercase mb-1 drop-shadow-md">
                                    {isPlaying ? 'Tocando' : 'Pausada'}
                                </div>
                            </div>

                            {hasError && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                                    <AlertCircle size={48} className="text-red-500 mb-4" />
                                    <h4 className="text-white font-bold mb-2">Erro de Reprodução</h4>
                                    <p className="text-gray-400 text-xs mb-6">Não conseguimos carregar o áudio. Verifique sua conexão ou os arquivos em src/assets/.</p>
                                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 flex items-center gap-2">
                                        <RefreshCw size={14} /> Tentar Novamente
                                    </button>
                                </div>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={40} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{currentTrack.title}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-px bg-indigo-500"></span>
                            <p className="text-indigo-600 dark:text-indigo-400 font-black text-xs tracking-[0.2em]">{currentTrack.artist}</p>
                            <span className="w-4 h-px bg-indigo-500"></span>
                        </div>
                    </div>

                    <div className="w-full mb-10 group/slider">
                        <div className="relative w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mb-3 cursor-pointer overflow-hidden">
                            <div 
                                className="absolute h-full bg-indigo-600 transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                            <input 
                                type="range" min="0" max="100" step="0.1" value={progress}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (audioRef.current) audioRef.current.currentTime = (val / 100) * duration;
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-gray-400 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-center justify-center gap-8 md:gap-12">
                            <button 
                                onClick={() => setIsShuffle(!isShuffle)}
                                className={`transition-colors ${isShuffle ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Shuffle size={20} />
                            </button>
                            
                            <div className="flex items-center gap-6">
                                <button onClick={handlePrev} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all transform active:scale-90">
                                    <SkipBack size={32} fill="currentColor" />
                                </button>
                                
                                <button 
                                    onClick={togglePlay} 
                                    className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
                                >
                                    {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                                </button>
                                
                                <button onClick={handleNext} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all transform active:scale-90">
                                    <SkipForward size={32} fill="currentColor" />
                                </button>
                            </div>

                            <button 
                                onClick={() => setLoopMode(loopMode === 'none' ? 'track' : 'none')}
                                className={`transition-colors ${loopMode === 'track' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Repeat1 size={20} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-100/50 dark:bg-black/20 px-6 py-3 rounded-2xl w-full max-w-xs">
                            <button onClick={() => setIsMuted(!isMuted)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input 
                                type="range" min="0" max="1" step="0.01" value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none accent-indigo-600 cursor-pointer" 
                            />
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-full lg:w-80 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Layers size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Coleção</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar max-h-[600px] pb-20">
                    {ALBUMS.map(album => {
                        const isActive = currentAlbum.id === album.id;
                        return (
                            <button 
                                key={album.id}
                                onClick={() => { setCurrentAlbum(album); setCurrentTrackIndex(0); setIsPlaying(true); }}
                                className={`flex items-center gap-4 p-4 rounded-[32px] border transition-all group ${isActive ? 'bg-indigo-600 border-indigo-600 shadow-xl' : 'bg-white/60 dark:bg-gray-800/40 border-white/40 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'}`}
                            >
                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                    <img src={album.cover} className="w-full h-full object-cover" alt={album.title} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <h4 className={`text-sm font-black truncate ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{album.title}</h4>
                                    <p className={`text-[10px] font-bold ${isActive ? 'text-indigo-200' : 'text-gray-500'}`}>{album.artist}</p>
                                </div>
                                {isActive && <PlayCircle size={20} className="text-white animate-pulse shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </aside>
        </div>
    );
};
