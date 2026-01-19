
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
        version: '2.0.2',
        date: '2026-01-19',
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
                title: 'Modo Compacto',
                description: 'Nova opção nos ajustes para reduzir o tamanho dos itens nas listas.',
                contributor: 'Lucas Willian',
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
