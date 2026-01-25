
import React, { useState, useEffect } from 'react';
// @ts-ignore - Fix named export error in certain environments
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, GraduationCap, CheckSquare, BarChart2, Settings, MoreHorizontal, X, Music, StickyNote } from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex flex-col md:flex-row items-center md:space-x-3 p-2 md:p-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-indigo-50 dark:bg-gray-800 text-indigo-600 dark:text-purple-400 font-bold shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <span className={`text-2xl md:text-xl transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>{icon}</span>
      <span className="text-[10px] md:text-sm mt-1 md:mt-0 font-medium">{label}</span>
    </Link>
  );
};

const MobileMenuItem: React.FC<{ to: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ to, icon, label, onClick }) => {
   const location = useLocation();
   const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
   
   return (
     <Link to={to} onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 dark:bg-purple-900/20 text-indigo-600 dark:text-purple-400 font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
        {icon}
        <span className="text-sm">{label}</span>
     </Link>
   )
}

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'create' && location.pathname === '/') {
          navigate({ pathname: '/tasks', search: searchParams.toString() }, { replace: true });
      }
  }, [searchParams, location, navigate]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f8fafc] dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-200">
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full p-5 shadow-sm z-10 print:hidden">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Diary</h1>
        </div>
        <nav className="space-y-1.5 flex-1 overflow-y-auto no-scrollbar">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Início" />
          <NavItem to="/diary" icon={<BookOpen size={20} />} label="Diário" />
          <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendário" />
          <NavItem to="/grades" icon={<GraduationCap size={20} />} label="Notas" />
          <NavItem to="/tasks" icon={<CheckSquare size={20} />} label="Tarefas" />
          <NavItem to="/notes" icon={<StickyNote size={20} />} label="Anotações" />
          <NavItem to="/beats" icon={<Music size={20} />} label="Beats" />
          <NavItem to="/stats" icon={<BarChart2 size={20} />} label="Análise" />
          <NavItem to="/settings" icon={<Settings size={20} />} label="Ajustes" />
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 text-xs text-center text-gray-400">
            v2.3.0 • Diary
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative bg-[#f8fafc] dark:bg-gray-900 scroll-smooth">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {children}
        </div>
      </main>

      {isMoreMenuOpen && (
        <>
            <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-fade-in" onClick={() => setIsMoreMenuOpen(false)} />
            <div className="md:hidden fixed bottom-[85px] right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[180px] z-40 origin-bottom-right animate-scale-in">
                <div className="flex flex-col space-y-1">
                    <MobileMenuItem to="/notes" icon={<StickyNote size={18}/>} label="Anotações" onClick={() => setIsMoreMenuOpen(false)} />
                    <MobileMenuItem to="/calendar" icon={<Calendar size={18}/>} label="Calendário" onClick={() => setIsMoreMenuOpen(false)} />
                    <MobileMenuItem to="/beats" icon={<Music size={18}/>} label="Beats" onClick={() => setIsMoreMenuOpen(false)} />
                    <MobileMenuItem to="/stats" icon={<BarChart2 size={18}/>} label="Análise" onClick={() => setIsMoreMenuOpen(false)} />
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                    <MobileMenuItem to="/settings" icon={<Settings size={18}/>} label="Ajustes" onClick={() => setIsMoreMenuOpen(false)} />
                </div>
            </div>
        </>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-40 print:hidden safe-area-bottom">
        <NavItem to="/" icon={<LayoutDashboard size={24} />} label="Início" />
        <NavItem to="/diary" icon={<BookOpen size={24} />} label="Diário" />
        <NavItem to="/tasks" icon={<CheckSquare size={24} />} label="Tarefas" />
        <NavItem to="/grades" icon={<GraduationCap size={24} />} label="Notas" />
        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${isMoreMenuOpen ? 'text-indigo-600 dark:text-purple-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-400 dark:text-gray-500'}`}>
           {isMoreMenuOpen ? <X size={24} /> : <MoreHorizontal size={24} />}
           <span className="text-[10px] mt-1 font-medium">Mais</span>
        </button>
      </nav>
    </div>
  );
};
