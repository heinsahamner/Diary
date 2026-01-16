
export interface DeepLinkIntent<T = any> {
    action: string;
    data: T;
}

export const DeepLinkService = {

    parseIntent: <T = any>(searchParams: URLSearchParams): DeepLinkIntent<T> | null => {
        const action = searchParams.get('action');
        if (!action) return null;

        let data: any = {};

        const payload = searchParams.get('payload');
        if (payload) {
            try {
                const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                const json = atob(base64);
                data = JSON.parse(json);
            } catch (e) {
                console.error('DeepLink: Failed to parse payload', e);
            }
        }

        searchParams.forEach((value, key) => {
            if (key !== 'action' && key !== 'payload') {
                data[key] = value;
            }
        });

        return { action, data: data as T };
    },

 /*
* Gera uma string de URL de link direto.
* @param path O caminho da rota (ex.: '/tasks')
* @param action O verbo da ação (ex.: 'create')
* @param params Pares simples de chave-valor para parâmetros de URL legíveis
* @param payload Objeto complexo opcional a ser codificado em base64
*/
    generateLink: (path: string, action: string, params: Record<string, string> = {}, payload?: object) => {
        const urlParams = new URLSearchParams();
        urlParams.set('action', action);

        Object.entries(params).forEach(([key, value]) => {
            if (value) urlParams.set(key, value);
        });

        if (payload) {
            try {
                const json = JSON.stringify(payload);
                const base64 = btoa(json);
                urlParams.set('payload', base64);
            } catch (e) {
                console.error('DeepLink: Failed to encode payload', e);
            }
        }

        return `${path}?${urlParams.toString()}`;
    }
};
