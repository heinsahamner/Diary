import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center w-full max-w-xs p-4 rounded-xl shadow-xl border transition-all animate-slide-in ${
              toast.type === 'success' ? 'bg-white dark:bg-gray-800 border-green-500/50 text-green-700 dark:text-green-400' :
              toast.type === 'error' ? 'bg-white dark:bg-gray-800 border-red-500/50 text-red-700 dark:text-red-400' :
              'bg-white dark:bg-gray-800 border-indigo-500/50 text-indigo-700 dark:text-indigo-400'
            }`}
          >
             <div className={`mr-3 p-1.5 rounded-full flex-shrink-0 ${
                 toast.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 
                 toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 
                 'bg-indigo-100 dark:bg-indigo-900/30'
             }`}>
                 {toast.type === 'success' && <CheckCircle size={16} />}
                 {toast.type === 'error' && <AlertCircle size={16} />}
                 {toast.type === 'info' && <Info size={16} />}
             </div>
             <p className="text-sm font-medium flex-1 dark:text-gray-100 leading-tight">{toast.message}</p>
             <button onClick={() => removeToast(toast.id)} className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                 <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};