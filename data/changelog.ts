
export const CURRENT_VERSION = '2.0.2';

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
        version: '2.0.3',
        date: '2026-01-24',
        items: [
            {
                type: 'feature',
                title: 'Sábados Letivos',
                description: 'Agora você pode criar e gerenciar sábados letivos.',
                contributor: 'Lucas Willian',
                contributorRole: 'Sugestão'
            },
            {
                type: 'style',
                title: 'Abas novas na seção "Notas',
                description: 'Adicionar matérias via aba "Notas" e uma nova aba de cards das notas.',
                contributor: 'Lucas Willian, Helena',
                contributorRole: 'Design'
            },
            {
                type: 'improvement',
                title: 'Nova aba início',
                description: 'Saudação dinâmica baseada no horário e visualização de timeline melhorada.',
                contributor: 'Lucas Willian',
                contributorRole: 'Feedback'
            },
            {
                type: 'improvement',
                title: 'Ajustes de UX',
                description: 'Reescrita de textos para linguagem mais natural e nova tela de Configurações.',
            }
        ]
    }
];
