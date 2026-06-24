import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Search, ClipboardList, CheckCircle, Clock } from 'lucide-react';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [available, setAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/requests'),
      api.get('/medicines')
    ]).then(([rRes, mRes]) => {
      setRequests(rRes.data.requests);
      setAvailable(mRes.data.medicines.length);
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: requests.length,
    active: requests.filter(r => ['submitted', 'under_review', 'approved', 'allocated'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Welcome, {user?.organizationName || user?.name?.split(' ')[0]} 👋</h1>
        <p>Browse available medicines and manage your requests.</p>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Available Medicines', value: available, icon: Search, color: 'blue' },
          { label: 'Total Requests', value: stats.total, icon: ClipboardList, color: 'purple' },
          { label: 'Active Requests', value: stats.active, icon: Clock, color: 'amber' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'green' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}><s.icon size={22} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '1 1 400px' }}>
          <div className="card-header">
            <h3 style={{ margin: 0 }}>Recent Requests</h3>
            <Link to="/ngo/my-requests" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {requests.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <ClipboardList size={36} />
                <h3>No requests yet</h3>
                <p>Browse available medicines and submit your first request.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Medicine</th><th>Qty</th><th>Requested</th><th>Status</th></tr></thead>
                  <tbody>
                    {requests.slice(0, 5).map(r => (
                      <tr key={r._id}>
                        <td><strong>{r.medicine?.name}</strong></td>
                        <td>{r.quantityRequested}</td>
                        <td style={{ fontSize: '.8rem' }}>{formatDate(r.createdAt)}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: '0 1 280px' }}>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center' }}>
              <Search size={32} style={{ color: 'var(--brand-500)', marginBottom: '.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>Find medicines</h3>
              <p style={{ fontSize: '.85rem', marginBottom: '1rem' }}>{available} medicines currently available for request.</p>
              <Link to="/ngo/browse" className="btn btn-primary btn-full"><Search size={16} /> Browse Medicines</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
