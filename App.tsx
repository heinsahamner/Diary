import React, { useState, useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './services/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Diary } from './pages/Diary';
import { Grades } from './pages/Grades';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Tasks } from './pages/Tasks';
import { CalendarView } from './pages/Calendar';
import { Login } from './components/Login';

function App() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('diary_active_user'));

  const handleLogin = (username: string) => {
      localStorage.setItem('diary_active_user', username);
      setUser(username);
  };

  const handleLogout = () => {
      localStorage.removeItem('diary_active_user');
      setUser(null);
  };

  if (!user) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    <StoreProvider user={user} onLogout={handleLogout}>
      <MemoryRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </MemoryRouter>
    </StoreProvider>
  );
}

export default App;