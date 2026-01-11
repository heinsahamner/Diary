import React, { useState } from 'react';
import { BookOpen, Lock, User } from 'lucide-react';
import { AuthService } from '../services/auth';

interface LoginProps {
    onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegistering) {
                const result = await AuthService.register(name.trim(), password);
                if (result.success) {
                    onLogin(name.trim());
                } else {
                    setError(result.message || 'Erro ao registrar.');
                }
            } else {
                const result = await AuthService.login(name.trim(), password);
                if (result.success) {
                    onLogin(name.trim());
                } else {
                    setError(result.message || 'Erro ao entrar.');
                }
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 dark:bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-200 dark:shadow-purple-900/50">
                        <BookOpen className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Diary</h1>
                    <p className="text-gray-500 dark:text-gray-400">Student Planner</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Usuário
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all"
                                placeholder="Nome de usuário"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            Senha
                        </label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                className="w-full pl-10 p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-all"
                                placeholder="Sua senha secreta"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 dark:bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 dark:hover:bg-purple-700 transition-transform active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-purple-900/30 disabled:opacity-50"
                    >
                        {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                        className="text-sm text-indigo-600 dark:text-purple-400 hover:underline"
                    >
                        {isRegistering ? 'Já tem uma conta? Entrar' : 'Novo por aqui? Criar conta'}
                    </button>
                </div>
            </div>
        </div>
    );
};
