import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState } from '../types';

// Load credentials from Environment Variables (Vite standard)
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
        console.error("Supabase initialization failed:", error);
    }
}

export const SupabaseService = {
    isConfigured: () => !!supabase,

    getClient: () => supabase,

    async signInWithGoogle() {
        if (!supabase) throw new Error("Serviço de nuvem indisponível");
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },

    async logout() {
        if (!supabase) return;
        await supabase.auth.signOut();
    },

    async getUser() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getUser();
        return data.user;
    },

    async getSession() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    async uploadBackup(appData: AppState) {
        if (!supabase) throw new Error("Offline");
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado na nuvem");

        const payload = {
            user_id: user.id,
            data: appData,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('backups')
            .upsert(payload, { onConflict: 'user_id' });

        if (error) throw error;
        return true;
    },

    async downloadBackup(): Promise<{ data: AppState, updated_at: string } | null> {
        if (!supabase) throw new Error("Offline");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não logado na nuvem");

        const { data, error } = await supabase
            .from('backups')
            .select('data, updated_at')
            .eq('user_id', user.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // No rows found
            throw error;
        }

        return data;
    }
};