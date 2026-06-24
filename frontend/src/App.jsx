import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';

import DonorDashboard from './pages/donor/DonorDashboard';
import DonateMedicine from './pages/donor/DonateMedicine';
import MyDonations from './pages/donor/MyDonations';

import NgoDashboard from './pages/ngo/NgoDashboard';
import BrowseMedicines from './pages/ngo/BrowseMedicines';
import MyRequests from './pages/ngo/MyRequests';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMedicines from './pages/admin/AdminMedicines';
import AdminRequests from './pages/admin/AdminRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNGOs from './pages/admin/AdminNGOs';

function ProtectedLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor'} replace />;
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
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'var(--font-sans)', fontSize: '.875rem' } }} />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          <Route path="/donor" element={<ProtectedLayout allowedRoles={['donor']}><DonorDashboard /></ProtectedLayout>} />
          <Route path="/donor/donate" element={<ProtectedLayout allowedRoles={['donor']}><DonateMedicine /></ProtectedLayout>} />
          <Route path="/donor/my-donations" element={<ProtectedLayout allowedRoles={['donor']}><MyDonations /></ProtectedLayout>} />

          <Route path="/ngo" element={<ProtectedLayout allowedRoles={['ngo']}><NgoDashboard /></ProtectedLayout>} />
          <Route path="/ngo/browse" element={<ProtectedLayout allowedRoles={['ngo']}><BrowseMedicines /></ProtectedLayout>} />
          <Route path="/ngo/my-requests" element={<ProtectedLayout allowedRoles={['ngo']}><MyRequests /></ProtectedLayout>} />

          <Route path="/admin" element={<ProtectedLayout allowedRoles={['admin']}><AdminDashboard /></ProtectedLayout>} />
          <Route path="/admin/medicines" element={<ProtectedLayout allowedRoles={['admin']}><AdminMedicines /></ProtectedLayout>} />
          <Route path="/admin/requests" element={<ProtectedLayout allowedRoles={['admin']}><AdminRequests /></ProtectedLayout>} />
          <Route path="/admin/users" element={<ProtectedLayout allowedRoles={['admin']}><AdminUsers /></ProtectedLayout>} />
          <Route path="/admin/ngos" element={<ProtectedLayout allowedRoles={['admin']}><AdminNGOs /></ProtectedLayout>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}