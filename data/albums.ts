
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
}

export const ALBUMS: Album[] = [
    {
        id: '1',
        title: 'From',
        artist: 'Lu',
        cover: 'OST/From.jpeg',
        tracks: [
            { id: '1-1', title: 'forget about it', artist: 'Lu', duration: '02:22', file: 'OST/Songs/forget about it.mp3' },
            { id: '1-2', title: 'two in trouble', artist: 'Lu', duration: '02:42', file: 'OST/Songs/two in trouble.mp3' }
        ]
    }
];
