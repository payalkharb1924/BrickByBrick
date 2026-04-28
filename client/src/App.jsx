import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DSA from './pages/DSA';
import Jobs from './pages/Jobs';
import Reviews from './pages/Reviews';
import Mistakes from './pages/Mistakes';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes wrapped in AuthGuard + Layout */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dsa" element={<DSA />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/mistakes" element={<Mistakes />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
