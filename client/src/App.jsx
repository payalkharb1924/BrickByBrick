import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DSA from './pages/DSA';
import Jobs from './pages/Jobs';
import Reviews from './pages/Reviews';
import Revisions from './pages/Revisions';
import Mistakes from './pages/Mistakes';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { checkAndNotify } from './utils/notifications';
import useAuthStore from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Check on load (after a short delay to let auth settle)
    const initial = setTimeout(() => checkAndNotify(), 3000);
    // Then check every 30 minutes
    const interval = setInterval(() => checkAndNotify(), 30 * 60 * 1000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [isAuthenticated]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/revisions" element={<Revisions />} />
            <Route path="/mistakes" element={<Mistakes />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
