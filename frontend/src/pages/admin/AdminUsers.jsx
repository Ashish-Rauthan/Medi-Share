import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Users, Mail, Phone, MapPin, Building2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Users</h1>
        <p>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {[['all','All'],['donor','Donors'],['ngo','NGOs']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><Users size={48} /><h3>No users found</h3></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Address</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      {u.organizationName && <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', display: 'flex', gap: '.3rem', alignItems: 'center' }}><Building2 size={11} />{u.organizationName}</div>}
                    </td>
                    <td><div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.875rem' }}><Mail size={13} style={{ color: 'var(--gray-400)' }} />{u.email}</div></td>
                    <td><span className={`badge badge-${u.role}`}>{u.role.toUpperCase()}</span></td>
                    <td style={{ fontSize: '.875rem', color: 'var(--gray-500)' }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: '.875rem', color: 'var(--gray-500)' }}>{u.address || '—'}</td>
                    <td style={{ fontSize: '.85rem', color: 'var(--gray-500)' }}>{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
