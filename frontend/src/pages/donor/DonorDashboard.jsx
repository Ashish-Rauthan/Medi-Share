import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Pill, Clock, CheckCircle, XCircle, PlusCircle, TrendingUp } from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medicines').then(r => setMedicines(r.data.medicines)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: medicines.length,
    pending: medicines.filter(m => m.status === 'pending').length,
    approved: medicines.filter(m => m.status === 'approved').length,
    rejected: medicines.filter(m => m.status === 'rejected').length,
  };
  const recent = medicines.slice(0, 5);
  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Good to see you, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Track your donations and help medicines reach those in need.</p>
      </div>
      <div className="stats-grid">
        {[
          { label: 'Total Donated', value: stats.total, icon: Pill, color: 'blue' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
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
            <h3 style={{ margin: 0 }}>Recent Donations</h3>
            <Link to="/donor/my-donations" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Pill size={36} /><h3>No donations yet</h3><p>Start by listing a medicine you'd like to donate.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Medicine</th><th>Qty</th><th>Expiry</th><th>Status</th></tr></thead>
                  <tbody>
                    {recent.map(m => (
                      <tr key={m._id}>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.quantity} {m.unit}</td>
                        <td style={{ fontSize: '.8rem' }}>{formatDate(m.expiryDate)}</td>
                        <td><StatusBadge status={m.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: '0 1 280px' }}>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-body" style={{ textAlign: 'center' }}>
              <TrendingUp size={32} style={{ color: 'var(--brand-500)', marginBottom: '.5rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>Ready to donate?</h3>
              <p style={{ fontSize: '.85rem', marginBottom: '1rem' }}>List your unused medicines and help underprivileged communities.</p>
              <Link to="/donor/donate" className="btn btn-primary btn-full"><PlusCircle size={16} /> Donate Medicine</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
