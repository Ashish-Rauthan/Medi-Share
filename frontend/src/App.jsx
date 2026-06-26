import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

import HomePage        from './pages/HomePage';
import AboutPage       from './pages/AboutPage';
import Login           from './pages/Login';
import Register        from './pages/Register';
import VerifyOtp       from './pages/VerifyOtp';

import DonorDashboard  from './pages/donor/DonorDashboard';
import DonateMedicine  from './pages/donor/DonateMedicine';
import MyDonations     from './pages/donor/MyDonations';

import NgoDashboard    from './pages/ngo/NgoDashboard';
import BrowseMedicines from './pages/ngo/BrowseMedicines';
import MyRequests      from './pages/ngo/MyRequests';

import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminMedicines  from './pages/admin/AdminMedicines';
import AdminRequests   from './pages/admin/AdminRequests';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminNGOs       from './pages/admin/AdminNGOs';

// ─── 404 Page ─────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: 'var(--ds-bg, #f8f9ff)', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '6rem', fontWeight: 800,
          color: 'var(--ds-primary, #091426)', lineHeight: 1, marginBottom: '1rem',
        }}>404</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          style={{
            background: '#091426', color: '#fff', padding: '.7rem 1.5rem',
            borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: '.95rem',
          }}
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

// ─── Layout guards ────────────────────────────────────────────────────────────
function ProtectedLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user)   return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={
      user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor'
    } replace />;
  }
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (user)    return <Navigate to={
    user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor'
  } replace />;
  return children;
}

// ─── Scroll restoration ───────────────────────────────────────────────────────
function ScrollToHashElement() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    const el = document.getElementById(hash.replace('#', ''));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, [hash, pathname]);
  return null;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToHashElement />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'var(--font-sans)', fontSize: '.875rem' },
          }}
        />
        <Routes>
          {/* Public landing — always accessible */}
          <Route path="/"      element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Auth — redirect to dashboard if already logged in */}
          <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"   element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Donor */}
          <Route path="/donor"              element={<ProtectedLayout allowedRoles={['donor']}><ErrorBoundary><DonorDashboard /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/donor/donate"       element={<ProtectedLayout allowedRoles={['donor']}><ErrorBoundary><DonateMedicine /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/donor/my-donations" element={<ProtectedLayout allowedRoles={['donor']}><ErrorBoundary><MyDonations /></ErrorBoundary></ProtectedLayout>} />

          {/* NGO */}
          <Route path="/ngo"              element={<ProtectedLayout allowedRoles={['ngo']}><ErrorBoundary><NgoDashboard /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/ngo/browse"       element={<ProtectedLayout allowedRoles={['ngo']}><ErrorBoundary><BrowseMedicines /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/ngo/my-requests"  element={<ProtectedLayout allowedRoles={['ngo']}><ErrorBoundary><MyRequests /></ErrorBoundary></ProtectedLayout>} />

          {/* Admin */}
          <Route path="/admin"              element={<ProtectedLayout allowedRoles={['admin']}><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/admin/medicines"    element={<ProtectedLayout allowedRoles={['admin']}><ErrorBoundary><AdminMedicines /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/admin/requests"     element={<ProtectedLayout allowedRoles={['admin']}><ErrorBoundary><AdminRequests /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/admin/users"        element={<ProtectedLayout allowedRoles={['admin']}><ErrorBoundary><AdminUsers /></ErrorBoundary></ProtectedLayout>} />
          <Route path="/admin/ngos"         element={<ProtectedLayout allowedRoles={['admin']}><ErrorBoundary><AdminNGOs /></ErrorBoundary></ProtectedLayout>} />

          {/* 404 — show a proper not-found page instead of silent redirect */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
