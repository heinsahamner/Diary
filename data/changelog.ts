
export const CURRENT_VERSION = '2.0.1';

export interface ChangeLogItem {
    type: 'feature' | 'fix' | 'improvement' | 'style';
    title: string;
    description: string;
    contributor?: string; // Community member name
    contributorRole?: string; // e.g. "Tester", "Idea", "Dev"
}

export interface Release {
    version: string;
    date: string;
    items: ChangeLogItem[];
}

export const CHANGELOG: Release[] = [
    {
        version: '2.0.1',
        date: '2026-01-17',
        items: [
            {
                type: 'feature',
                title: 'Links Profundos (Deep Links)',
                description: 'Agora você pode criar atalhos diretos para criar tarefas específicas via URL.',
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
                title: 'Nova Dashboard',
                description: 'Saudação dinâmica baseada no horário e visualização de timeline melhorada.',
                contributor: 'Lucas Willian',
                contributorRole: 'Feedback'
            },
            {
                type: 'improvement',
                title: 'Ajustes UX',
                description: 'Reescrita de textos para linguagem mais natural e nova tela de Configurações.',
            }
        ]
    }
];
