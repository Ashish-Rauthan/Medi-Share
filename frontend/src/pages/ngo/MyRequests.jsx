import { useState, useEffect } from 'react';
import api from '../../utils/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { ClipboardList, Calendar, Package, CheckCircle, Clock, XCircle, Truck, Star } from 'lucide-react';

const statusIcons = { submitted: Clock, under_review: Clock, approved: CheckCircle, rejected: XCircle, allocated: Truck, completed: Star };
const statusOrder = ['submitted', 'under_review', 'approved', 'allocated', 'completed'];

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/requests').then(r => setRequests(r.data.requests)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>My Requests</h1>
        <p>{requests.length} request{requests.length !== 1 ? 's' : ''} submitted</p>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', 'All'], ['submitted', 'Submitted'], ['under_review', 'Under Review'], ['approved', 'Approved'], ['allocated', 'Allocated'], ['completed', 'Completed'], ['rejected', 'Rejected']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={48} />
          <h3>No requests found</h3>
          <p>Browse available medicines to submit a request.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(r => {
            const Icon = statusIcons[r.status] || Clock;
            const currentStep = statusOrder.indexOf(r.status);
            return (
              <div key={r._id} className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                        <div>
                          <h3 style={{ marginBottom: '.25rem' }}>{r.medicine?.name}</h3>
                          <StatusBadge status={r.status} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem', color: 'var(--gray-600)' }}>
                          <Package size={14} /><span>{r.quantityRequested} {r.medicine?.unit} requested</span>
                        </div>
                        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem', color: 'var(--gray-600)' }}>
                          <Calendar size={14} /><span>Submitted {formatDate(r.createdAt)}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '.85rem', color: 'var(--gray-500)' }}><strong>Purpose:</strong> {r.purpose}</p>
                      {r.adminNote && (
                        <div className="alert alert-info" style={{ marginTop: '.75rem', marginBottom: 0 }}>
                          <strong>Admin note:</strong> {r.adminNote}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: '0 1 240px' }}>
                      <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Progress</p>
                      <div className="timeline">
                        {statusOrder.filter(s => s !== 'rejected').map((s, i) => {
                          const done = r.status !== 'rejected' && (currentStep > i || r.status === s);
                          const active = r.status === s;
                          return (
                            <div key={s} className="timeline-item">
                              <div className={`timeline-dot${done ? ' done' : active ? ' active' : ''}`}>
                                {done ? <CheckCircle size={14} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gray-300)', display: 'block' }} />}
                              </div>
                              <div className="timeline-content">
                                <div className="timeline-label" style={{ color: active ? 'var(--brand-600)' : done ? 'var(--green-600)' : 'var(--gray-400)' }}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                              </div>
                            </div>
                          );
                        })}
                        {r.status === 'rejected' && (
                          <div className="timeline-item">
                            <div className="timeline-dot" style={{ borderColor: 'var(--red-500)', background: 'var(--red-500)', color: '#fff' }}><XCircle size={14} /></div>
                            <div className="timeline-content"><div className="timeline-label" style={{ color: 'var(--red-500)' }}>Rejected</div></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
