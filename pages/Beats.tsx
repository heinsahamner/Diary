
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, 
    Shuffle, ListMusic, Music, LayoutGrid, Clock, PlayCircle,
    SortAsc, History
} from 'lucide-react';
import { ALBUMS, Album, Track } from '../data/albums';

type LoopMode = 'none' | 'album' | 'track';

export const Beats: React.FC = () => {
    const [currentAlbum, setCurrentAlbum] = useState<Album>(ALBUMS[0]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [loopMode, setLoopMode] = useState<LoopMode>('none');
    const [isShuffle, setIsShuffle] = useState(false);
    const [albumSort, setAlbumSort] = useState<'alpha' | 'recent'>('alpha');
    const [recentIds, setRecentIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('beats_recent_albums');
        return saved ? JSON.parse(saved) : [];
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const currentTrack = currentAlbum.tracks[currentTrackIndex];


    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            setProgress((audio.currentTime / audio.duration) * 100 || 0);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTrackEnded = () => {
            if (loopMode === 'track') {
                audio.currentTime = 0;
                audio.play();
            } else {
                handleNext();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleTrackEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleTrackEnded);
        };
    }, [loopMode]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = currentTrack.file;
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            }
        }
    }, [currentTrack]);

    useEffect(() => {
        const newRecents = [currentAlbum.id, ...recentIds.filter(id => id !== currentAlbum.id)].slice(0, 10);
        setRecentIds(newRecents);
        localStorage.setItem('beats_recent_albums', JSON.stringify(newRecents));
    }, [currentAlbum.id]);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current?.pause();
        } else {
            audioRef.current?.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (isShuffle) {
            const nextIndex = Math.floor(Math.random() * currentAlbum.tracks.length);
            setCurrentTrackIndex(nextIndex);
        } else {
            const nextIndex = (currentTrackIndex + 1) % currentAlbum.tracks.length;
            if (nextIndex === 0 && loopMode === 'none') {
                setIsPlaying(false);
                audioRef.current?.pause();
            } else {
                setCurrentTrackIndex(nextIndex);
            }
        }
    };

    const handlePrev = () => {
        const prevIndex = (currentTrackIndex - 1 + currentAlbum.tracks.length) % currentAlbum.tracks.length;
        setCurrentTrackIndex(prevIndex);
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
        setProgress(parseFloat(e.target.value));
    };

    const toggleLoop = () => {
        if (loopMode === 'none') setLoopMode('album');
        else if (loopMode === 'album') setLoopMode('track');
        else setLoopMode('none');
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sortedAlbums = useMemo(() => {
        const list = [...ALBUMS];
        if (albumSort === 'alpha') {
            return list.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            return list.sort((a, b) => {
                const indexA = recentIds.indexOf(a.id);
                const indexB = recentIds.indexOf(b.id);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }
    }, [albumSort, recentIds]);

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in pb-20">
            
            <div className="w-full lg:w-1/4 space-y-4 order-2 lg:order-1">
                <div className="flex items-center gap-2 mb-4">
                    <ListMusic className="text-indigo-600 dark:text-purple-400" size={20} />
                    <h3 className="font-bold text-gray-800 dark:text-white uppercase text-xs tracking-widest">Faixas do Álbum</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {currentAlbum.tracks.map((track, idx) => {
                        const isThisTrack = currentTrackIndex === idx;
                        return (
                            <div 
                                key={track.id}
                                className={`flex items-center gap-3 p-3 transition-colors group cursor-pointer ${isThisTrack ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                onClick={() => {
                                    setCurrentTrackIndex(idx);
                                    setIsPlaying(true);
                                }}
                            >
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                                    <img src={currentAlbum.cover} alt="Cover" className="w-full h-full object-cover" />
                                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isThisTrack && isPlaying ? <Pause size={16} className="text-white fill-white" /> : <Play size={16} className="text-white fill-white" />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-bold truncate ${isThisTrack ? 'text-indigo-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-200'}`}>{track.title}</p>
                                    <p className="text-[10px] text-gray-400 truncate">{track.artist}</p>
                                </div>
                                <span className="text-[10px] font-mono text-gray-400">{track.duration}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full lg:w-2/4 flex flex-col items-center justify-center order-1 lg:order-2">
                <div className="w-full max-w-sm">
                    <div className="aspect-square w-full rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none mb-8 group relative">
                        <img 
                            src={currentAlbum.cover} 
                            alt="Album Cover" 
                            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="w-full mb-6">
                        <input 
                            type="range" 
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            min="0" max="100" step="0.1"
                            value={progress}
                            onChange={handleProgressChange}
                        />
                        <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 tracking-tight">{currentTrack.title}</h2>
                        <p className="text-indigo-600 dark:text-purple-400 font-medium">{currentTrack.artist}</p>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-8">
                            <button 
                                onClick={handlePrev}
                                className="p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <SkipBack size={28} fill="currentColor" />
                            </button>
                            <button 
                                onClick={togglePlay}
                                className="w-20 h-20 bg-indigo-600 dark:bg-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-purple-900/30 transform transition-transform active:scale-95 hover:scale-105"
                            >
                                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                            </button>
                            <button 
                                onClick={handleNext}
                                className="p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-purple-400 transition-colors"
                            >
                                <SkipForward size={28} fill="currentColor" />
                            </button>
                        </div>

                        <div className="flex items-center gap-10">
                            <button 
                                onClick={toggleLoop}
                                className={`p-2 transition-all relative ${loopMode !== 'none' ? 'text-indigo-600 dark:text-purple-400' : 'text-gray-400'}`}
                                title="Repetir"
                            >
                                {loopMode === 'track' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                                {loopMode !== 'none' && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />}
                            </button>
                            <button 
                                onClick={() => setIsShuffle(!isShuffle)}
                                className={`p-2 transition-all relative ${isShuffle ? 'text-indigo-600 dark:text-purple-400' : 'text-gray-400'}`}
                                title="Aleatório"
                            >
                                <Shuffle size={20} />
                                {isShuffle && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-1/4 space-y-4 order-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="text-indigo-600 dark:text-purple-400" size={20} />
                        <h3 className="font-bold text-gray-800 dark:text-white uppercase text-xs tracking-widest">Biblioteca</h3>
                    </div>
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <button 
                            onClick={() => setAlbumSort('alpha')}
                            className={`p-1.5 rounded-md transition-colors ${albumSort === 'alpha' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-400'}`}
                            title="A-Z"
                        >
                            <SortAsc size={14} />
                        </button>
                        <button 
                            onClick={() => setAlbumSort('recent')}
                            className={`p-1.5 rounded-md transition-colors ${albumSort === 'recent' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-400'}`}
                            title="Recentes"
                        >
                            <History size={14} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    {sortedAlbums.map(album => (
                        <div 
                            key={album.id}
                            onClick={() => {
                                setCurrentAlbum(album);
                                setCurrentTrackIndex(0);
                            }}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer group ${currentAlbum.id === album.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-md' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-lg'}`}
                        >
                            <div className="flex lg:flex-row flex-col gap-3">
                                <div className="lg:w-16 lg:h-16 w-full aspect-square rounded-xl overflow-hidden shadow-sm">
                                    <img src={album.cover} alt={album.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white truncate">{album.title}</h4>
                                    <p className="text-xs text-gray-400 truncate">{album.artist}</p>
                                    <p className="text-[10px] text-indigo-500 dark:text-purple-400 mt-1 font-bold">{album.tracks.length} faixas</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
