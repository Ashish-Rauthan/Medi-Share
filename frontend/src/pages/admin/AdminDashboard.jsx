import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Pill, ClipboardList, CheckCircle, Clock, TrendingUp, ShieldCheck, Building2 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Platform overview and activity summary.</p>
      </div>

      {stats.users.pendingNGOs > 0 && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ <strong>{stats.users.pendingNGOs} NGO{stats.users.pendingNGOs > 1 ? 's' : ''}</strong> waiting for approval</span>
          <Link to="/admin/ngos" className="btn btn-sm btn-secondary">Review now</Link>
        </div>
      )}

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: stats.users.total, icon: Users, color: 'blue' },
          { label: 'Donors', value: stats.users.donors, icon: TrendingUp, color: 'green' },
          { label: 'Active NGOs', value: stats.users.ngos, icon: Users, color: 'purple' },
          { label: 'Pending NGOs', value: stats.users.pendingNGOs, icon: Clock, color: 'amber' },
          { label: 'Total Medicines', value: stats.medicines.total, icon: Pill, color: 'blue' },
          { label: 'Pending Medicines', value: stats.medicines.pending, icon: Clock, color: 'amber' },
          { label: 'Total Requests', value: stats.requests.total, icon: ClipboardList, color: 'purple' },
          { label: 'Pending Requests', value: stats.requests.pending, icon: Clock, color: 'amber' },
          { label: 'Completed', value: stats.requests.completed, icon: CheckCircle, color: 'green' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '1rem', maxWidth: 800 }}>
        {[
          { to: '/admin/medicines', label: 'Verify Medicines', desc: `${stats.medicines.pending} pending`, icon: ShieldCheck, color: 'var(--amber-500)' },
          { to: '/admin/requests', label: 'Manage Requests', desc: `${stats.requests.pending} pending`, icon: ClipboardList, color: 'var(--brand-500)' },
          { to: '/admin/ngos', label: 'NGO Approvals', desc: `${stats.users.pendingNGOs} pending`, icon: Building2, color: 'var(--purple-500)' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card" style={{ textDecoration: 'none', transition: 'box-shadow .2s,transform .2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}>
            <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius)', background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={20} style={{ color: a.color }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{a.label}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{a.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}