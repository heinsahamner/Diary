
export const CURRENT_VERSION = '2.3.0';

export interface ChangeLogItem {
    type: 'feature' | 'fix' | 'improvement' | 'style';
    title: string;
    description: string;
    contributor?: string; 
    contributorRole?: string;
}

export interface Release {
    version: string;
    date: string;
    items: ChangeLogItem[];
}

export const CHANGELOG: Release[] = [
    {
        version: '2.3.0',
        date: '2026-01-25',
        items: [
            {
                type: 'feature',
                title: 'Aba anotações',
                description: 'Agora você pode criar e gerenciar notas.',
                contributor: 'Lucas Willian',
                contributorRole: 'Implementação'
            },
            {
                type: 'feature',
                title: 'Abas novas na seção "Notas',
                description: 'Adicionar matérias via aba "Notas" e uma nova aba de cards das notas.',
                contributor: 'Lucas Willian & Helena',
                contributorRole: 'Implementação & Sugestão'
            },
            {
                type: 'improvement',
                title: 'Tutorial',
                description: 'Na aba ínicio, agora um pequeno tutorial uso.',
                contributor: 'Lucas Willian & Helena',
                contributorRole: 'Implementação & Sugestão'
            },
            {
                type: 'improvement',
                title: 'Aba "Beats"',
                description: 'Como já é tradição, deve sempre haver um player de música.',
                contributor: 'Lucas Willian',
                contributorRole: 'Implementação'
            },
            {
                type: 'improvement',
                title: 'Backup"',
                description: 'Suporte a sincronização com a nuvem e login com Google.',
                contributor: 'Lucas Willian',
                contributorRole: 'Implementação'
            }
        ]
    }
];
