import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export default function App() {
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
