import React, { useState } from 'react';
import { BookOpen, Lock, User, ArrowRight, AlertTriangle, RefreshCw, Eye, EyeOff, Sparkles, CheckSquare } from 'lucide-react';
import { AuthService } from '../services/auth';
import { useToast } from './Toast';
import { DBService } from '../services/db';

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] dark:bg-gray-900 font-sans overflow-hidden relative">
            
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{animationDelay: '2s'}} />

            <div className="w-full max-w-5xl h-auto md:h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 m-4 border border-white/20 dark:border-gray-700">
                
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
                            <div className="p-2 bg-purple-500 rounded-lg"><Lock size={18} /></div>
                            <div>
                                <p className="font-bold text-sm">Funciona offline.</p>
                                <p className="text-xs text-indigo-100">Mas atenção, seus dados ficam salvos apenas neste dispositivo.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:w-1/2 p-8 md:p-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl flex flex-col justify-center">
                    
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
                        <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {mode === 'login' ? 'Bem-vindo(a)' : 'Criar Conta'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    {mode === 'login' ? 'Insira seus dados para acessar.' : 'Preencha os dados para começar.'}
                                </p>
                            </div>

                            <div className="space-y-4">
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
                            </div>

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
                        </form>
                    )}
                </div>
            </div>
            
            <div className="absolute bottom-4 text-xs text-gray-400 dark:text-gray-600">
                v2.0.3 • Diary, from Microspace.
            </div>
        </div>
    );
};