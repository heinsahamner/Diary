
import React, { useState, useEffect } from 'react';
import { BookOpen, Lock, User, ArrowRight, AlertTriangle, RefreshCw, Eye, EyeOff, Sparkles, CheckSquare, Cloud, Loader2 } from 'lucide-react';
import { AuthService } from '../services/auth';
import { useToast } from './Toast';
import { DBService } from '../services/db';
import { SupabaseService } from '../services/supabase';

interface LoginProps {
    onLogin: (username: string, remember: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const { addToast } = useToast();
    const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [resetConfirm, setResetConfirm] = useState('');
    const [isCloudChecking, setIsCloudChecking] = useState(true);

    // --- CLOUD AUTH CHECK (On Mount) ---
    useEffect(() => {
        const checkSession = async () => {
            if (SupabaseService.isConfigured()) {
                const user = await SupabaseService.getUser();
                if (user) {
                    await handleCloudLoginSuccess(user);
                    return;
                }
            }
            setIsCloudChecking(false);
        };
        checkSession();
    }, []);

    const handleCloudLoginSuccess = async (user: any) => {
        setLoading(true);
        const username = user.email?.split('@')[0] || 'Student';
        addToast(`Conectado via Google como ${username}`, 'success');

        // Auto-restore logic
        try {
            const backup = await SupabaseService.downloadBackup();
            if (backup) {
                const localData = await DBService.loadState(username, new Date().getFullYear());
                const localTime = localData?.settings?.lastModified ? new Date(localData.settings.lastModified).getTime() : 0;
                const cloudTime = new Date(backup.updated_at).getTime();

                if (!localData || cloudTime > localTime) {
                    await DBService.saveState(username, new Date().getFullYear(), backup.data);
                    addToast('Backup restaurado da nuvem.', 'info');
                }
            }
        } catch (e) {
            console.error("Auto-restore failed (silent)", e);
        }

        onLogin(username, true);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await SupabaseService.signInWithGoogle();
            // Redirect happens automatically
        } catch (error: any) {
            addToast('Erro ao conectar com Google', 'error');
            setLoading(false);
        }
    };

    // --- LOCAL AUTH HANDLER ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(r => setTimeout(r, 800));

            if (mode === 'register') {
                const result = await AuthService.register(name.trim(), password);
                if (result.success) {
                    addToast('Conta criada com sucesso! Entre agora.', 'success');
                    setMode('login');
                } else {
                    addToast(result.message || 'Erro ao registrar.', 'error');
                }
            } else {
                const result = await AuthService.login(name.trim(), password);
                if (result.success) {
                    addToast(`Bem-vindo(a) de volta, ${name}!`, 'success');
                    onLogin(name.trim(), rememberMe);
                } else {
                    addToast(result.message || 'Dados inválidos.', 'error');
                }
            }
        } catch (err) {
            addToast('Ocorreu um erro inesperado.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleHardReset = async () => {
        if (resetConfirm !== 'DELETAR') {
            addToast('Digite "DELETAR" para confirmar.', 'error');
            return;
        }
        
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => { if(db.name) window.indexedDB.deleteDatabase(db.name) });
        localStorage.clear();
        sessionStorage.clear();
        addToast('Banco de dados limpo. Recarregando...', 'success');
        setTimeout(() => window.location.reload(), 1500);
    };

    if (isCloudChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-gray-900">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-gray-900 font-sans overflow-hidden relative">
            
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDelay: '2s'}} />

            <div className="w-full max-w-5xl h-auto md:h-[650px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 m-4 border border-white/20 dark:border-gray-700">
                
                <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold mb-2">Diary.</h1>
                        <p className="text-indigo-100 text-lg">um app Microsapce.</p>
                    </div>

                    <div className="relative z-10 space-y-4 hidden md:block">
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="p-2 bg-indigo-500 rounded-lg"><Sparkles size={18} /></div>
                            <div>
                                <p className="font-bold text-sm">Gerencie seus dados escolares.</p>
                                <p className="text-xs text-indigo-100">Tarefas, notas, frequência e mais.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="p-2 bg-purple-500 rounded-lg"><Cloud size={18} /></div>
                            <div>
                                <p className="font-bold text-sm">Sincronização na Nuvem.</p>
                                <p className="text-xs text-indigo-100">Use sua conta Google para salvar dados.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-1/2 p-8 md:p-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl flex flex-col justify-center overflow-y-auto">
                    
                    {mode === 'reset' ? (
                        <div className="animate-fade-in space-y-6">
                            <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
                                <AlertTriangle />
                                <h2>Resetar Dados</h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Esqueceu sua senha? Como o Diary é um app offline, não é possível recuperar sua senha. 
                                Você deve limpar o banco de dados local para criar uma nova conta, caso não se lembre.
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900">
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold mb-2 uppercase">Ação Irreversível!</p>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">Isso apagará todas as notas, faltas e tarefas deste dispositivo.</p>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Digite "DELETAR" abaixo:</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-red-300 dark:border-red-800 rounded bg-white dark:bg-gray-800 text-red-600 font-bold outline-none"
                                    value={resetConfirm}
                                    onChange={e => setResetConfirm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setMode('login')} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button onClick={handleHardReset} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors">Resetar Tudo</button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {mode === 'login' ? 'Bem-vindo(a)' : 'Criar Conta'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    Escolha como deseja acessar.
                                </p>
                            </div>

                            {/* GOOGLE AUTH BUTTON */}
                            {mode === 'login' && (
                                <>
                                    <button 
                                        onClick={handleGoogleLogin}
                                        disabled={loading || !SupabaseService.isConfigured()}
                                        className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm group"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                                <span>Entrar com Google</span>
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                        <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase">Ou localmente</span>
                                        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                    </div>
                                </>
                            )}

                            {/* LOCAL FORM */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1">Usuário.</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="Ex: Ana Mitiko"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1 ml-1">
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">Senha.</label>
                                        {mode === 'login' && (
                                            <button type="button" onClick={() => setMode('reset')} className="text-xs text-indigo-600 dark:text-purple-400 hover:underline">
                                                Esqueceu?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            className="w-full pl-10 pr-10 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                
                                {mode === 'login' && (
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer w-fit" 
                                        onClick={() => setRememberMe(!rememberMe)}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {rememberMe && <CheckSquare size={14} className="text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-300 select-none">Manter conectado</span>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 dark:bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-purple-900/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="text-center pt-2">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setMode(mode === 'login' ? 'register' : 'login');
                                        setName('');
                                        setPassword('');
                                    }}
                                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors"
                                >
                                    {mode === 'login' 
                                        ? "Não tem uma conta? Cadastre-se" 
                                        : "Já possui conta? Fazer Login"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="absolute bottom-4 text-xs text-gray-400 dark:text-gray-600">
                v2.3.0 • Diary, from Microspace.
            </div>
        </div>
    );
};