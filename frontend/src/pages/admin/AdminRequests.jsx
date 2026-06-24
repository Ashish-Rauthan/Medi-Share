import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, Eye, ClipboardList, Package, Building2, Calendar, Truck, Star } from 'lucide-react';

const NEXT_STATUSES = {
  submitted: ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['allocated', 'rejected'],
  allocated: ['completed'],
};

const STATUS_LABELS = { under_review: 'Mark Under Review', approved: 'Approve', rejected: 'Reject', allocated: 'Mark Allocated', completed: 'Mark Completed' };
const STATUS_CLASSES = { approved: 'btn-success', rejected: 'btn-danger', under_review: 'btn-secondary', allocated: 'btn-primary', completed: 'btn-success' };

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests);
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleAction = async (id, status) => {
    setProcessing(id + status);
    try {
      const res = await api.patch(`/requests/${id}/status`, { status, adminNote });
      setRequests(prev => prev.map(r => r._id === id ? res.data.request : r));
      toast.success(`Request updated to "${status.replace('_', ' ')}"`);
      setSelected(null);
      setAdminNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setProcessing(null); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Manage Requests</h1>
        <p>Review and process NGO medicine requests.</p>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all','All'],['submitted','Submitted'],['under_review','Under Review'],['approved','Approved'],['allocated','Allocated'],['completed','Completed'],['rejected','Rejected']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner fullPage /> : filtered.length === 0 ? (
        <div className="empty-state"><ClipboardList size={48} /><h3>No requests found</h3><p>No requests match the selected filter.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Medicine</th><th>NGO</th><th>Qty</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.medicine?.name}</strong></td>
                    <td>
                      <div style={{ fontSize: '.875rem' }}>{r.ngo?.organizationName || r.ngo?.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{r.ngo?.email}</div>
                    </td>
                    <td>{r.quantityRequested} {r.medicine?.unit}</td>
                    <td style={{ fontSize: '.85rem' }}>{formatDate(r.createdAt)}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setAdminNote(r.adminNote || ''); }}>
                          <Eye size={15} />
                        </button>
                        {NEXT_STATUSES[r.status]?.map(ns => (
                          <button key={ns} className={`btn btn-sm ${STATUS_CLASSES[ns]}`}
                            disabled={!!processing}
                            onClick={() => handleAction(r._id, ns)}
                            title={STATUS_LABELS[ns]}
                          >
                            {processing === r._id + ns ? <div className="spinner" /> :
                              ns === 'approved' ? <CheckCircle size={14} /> :
                              ns === 'rejected' ? <XCircle size={14} /> :
                              ns === 'completed' ? <Star size={14} /> :
                              ns === 'allocated' ? <Truck size={14} /> :
                              <Eye size={14} />}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal title="Request Details" onClose={() => { setSelected(null); setAdminNote(''); }} size="lg"
          footer={
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => { setSelected(null); setAdminNote(''); }}>Close</button>
              {NEXT_STATUSES[selected.status]?.map(ns => (
                <button key={ns} className={`btn ${STATUS_CLASSES[ns]}`} disabled={!!processing}
                  onClick={() => handleAction(selected._id, ns)}>
                  {processing === selected._id + ns ? <div className="spinner" /> : STATUS_LABELS[ns]}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1.25rem' }}>
            {[
              { icon: Package, label: 'Medicine', value: selected.medicine?.name },
              { icon: Building2, label: 'NGO', value: selected.ngo?.organizationName || selected.ngo?.name },
              { icon: Package, label: 'Qty Requested', value: `${selected.quantityRequested} ${selected.medicine?.unit}` },
              { icon: Calendar, label: 'Date', value: formatDate(selected.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', fontWeight: 600, marginBottom: '.2rem', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                  <Icon size={14} style={{ color: 'var(--brand-500)' }} />{value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', marginBottom: '1rem' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', marginBottom: '.4rem' }}>Purpose</div>
            <p style={{ margin: 0, fontSize: '.9rem' }}>{selected.purpose}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <StatusBadge status={selected.status} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Note</label>
            <textarea className="form-textarea" placeholder="Add a note for the NGO..." value={adminNote} onChange={e => setAdminNote(e.target.value)} style={{ minHeight: 70 }} />
          </div>
        </Modal>
      )}
    </div>
  );
}
