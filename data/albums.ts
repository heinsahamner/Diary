import coverFrom from '/src/assets/OST/Covers/From.jpeg';
import songForget from '/src/assets/OST/Songs/forget-about-it.mp3';
import songTrouble from '/src/assets/OST/Songs/two-in-trouble.mp3';

export interface Track {
    id: string;
    title: string;
    artist: string;
    duration: string;
    file: string;
}

export interface Album {
    id: string;
    title: string;
    artist: string;
    cover: string; 
    tracks: Track[];
    accentColor: string; 
}

export const ALBUMS: Album[] = [
    {
        id: 'indie-1',
        title: 'From',
        artist: 'Lu',
        cover: coverFrom,
        accentColor: '#6366f1',
        tracks: [
            { id: 't1', title: 'forget about it', artist: 'Lu', duration: '02:22', file: songForget },
            { id: 't2', title: 'two in trouble', artist: 'Lu', duration: '02:42', file: songTrouble }
        ]
    }
];