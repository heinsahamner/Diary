import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, GraduationCap, CheckSquare, BarChart2, Settings, MoreHorizontal, X } from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:p-3 rounded-xl transition-all ${
        isActive
          ? 'text-indigo-600 dark:text-purple-400 bg-indigo-50 dark:bg-gray-800 font-medium'
          : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <span className="text-2xl md:text-xl">{icon}</span>
      <span className="text-[10px] md:text-base mt-1 md:mt-0">{label}</span>
    </Link>
  );
};

const MobileMenuItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
   const location = useLocation();
   const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
   
   return (
     <Link to={to} onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 dark:bg-purple-900/20 text-indigo-600 dark:text-purple-400 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
        {icon}
        <span className="text-sm">{label}</span>
     </Link>
   )
}

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">
      {/* Barra Lateral (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full p-4 shadow-sm z-10 print:hidden">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-600 dark:bg-purple-600 rounded-lg flex items-center justify-center transition-colors">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Diary</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Início" />
          <NavItem to="/diary" icon={<BookOpen size={20} />} label="Diário" />
          <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendário" />
          <NavItem to="/grades" icon={<GraduationCap size={20} />} label="Notas" />
          <NavItem to="/tasks" icon={<CheckSquare size={20} />} label="Tarefas" />
          <NavItem to="/stats" icon={<BarChart2 size={20} />} label="Análise" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Ajustes" />
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            {children}
        </div>
      </main>

      {/* Menu Mobile */}
      {isMoreMenuOpen && (
        <>
            <div 
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30" 
              onClick={() => setIsMoreMenuOpen(false)}
            />
            <div className="md:hidden fixed bottom-[85px] right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[180px] z-40 origin-bottom-right">
                <div className="flex flex-col space-y-1">
                    <MobileMenuItem to="/calendar" icon={<Calendar size={18}/>} label="Calendário" onClick={() => setIsMoreMenuOpen(false)} />
                    <MobileMenuItem to="/stats" icon={<BarChart2 size={18}/>} label="Análise" onClick={() => setIsMoreMenuOpen(false)} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                    <MobileMenuItem to="/settings" icon={<Settings size={18}/>} label="Ajustes" onClick={() => setIsMoreMenuOpen(false)} />
                </div>
            </div>
        </>
      )}

      {/* Nav Inferior (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 print:hidden safe-area-bottom">
        <NavItem to="/" icon={<LayoutDashboard size={22} />} label="Início" />
        <NavItem to="/diary" icon={<BookOpen size={22} />} label="Diário" />
        <NavItem to="/tasks" icon={<CheckSquare size={22} />} label="Tarefas" />
        <NavItem to="/grades" icon={<GraduationCap size={22} />} label="Notas" />
        
        <button 
          onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          className={`flex flex-col items-center p-2 rounded-xl transition-all ${isMoreMenuOpen ? 'text-indigo-600 dark:text-purple-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400'}`}
        >
           {isMoreMenuOpen ? <X size={22} /> : <MoreHorizontal size={22} />}
           <span className="text-[10px] mt-1">Mais</span>
        </button>
      </nav>
    </div>
  );
};