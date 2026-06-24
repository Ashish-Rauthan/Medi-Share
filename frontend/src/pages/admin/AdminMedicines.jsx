import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { CheckCircle, XCircle, Eye, Pill, Calendar, Package, User } from 'lucide-react';

export default function AdminMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchMedicines(); }, [filter]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get('/medicines', { params });
      setMedicines(res.data.medicines);
    } finally { setLoading(false); }
  };

  const handleAction = async (id, status) => {
    setProcessing(id + status);
    try {
      const res = await api.patch(`/medicines/${id}/status`, { status, adminNote: actionNote });
      setMedicines(prev => prev.map(m => m._id === id ? res.data.medicine : m));
      toast.success(`Medicine ${status}`);
      setSelected(null);
      setActionNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setProcessing(null); }
  };

  const filters = [['pending','Pending'],['approved','Approved'],['rejected','Rejected'],['all','All']];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Verify Medicines</h1>
        <p>Review and approve or reject medicine donation listings.</p>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {filters.map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {loading ? <LoadingSpinner fullPage /> : medicines.length === 0 ? (
        <div className="empty-state"><Pill size={48} /><h3>No medicines found</h3><p>No listings match the selected filter.</p></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th><th>Category</th><th>Qty</th><th>Expiry</th><th>Donor</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        {m.imageUrl
                          ? <img src={m.imageUrl} alt={m.name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 40, height: 40, background: 'var(--brand-50)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Pill size={18} style={{ color: 'var(--brand-300)' }} /></div>
                        }
                        <div>
                          <div style={{ fontWeight: 600 }}>{m.name}</div>
                          {m.description && <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '.8rem', color: 'var(--gray-500)' }}>{m.category}</span></td>
                    <td>{m.quantity} {m.unit}</td>
                    <td style={{ fontSize: '.85rem' }}>{formatDate(m.expiryDate)}</td>
                    <td>
                      <div style={{ fontSize: '.875rem' }}>{m.donor?.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>{m.donor?.email}</div>
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem' }}>
                        <button className="btn btn-ghost btn-sm" title="View details" onClick={() => { setSelected(m); setActionNote(m.adminNote || ''); }}>
                          <Eye size={15} />
                        </button>
                        {m.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" disabled={!!processing} onClick={() => handleAction(m._id, 'approved')}>
                              {processing === m._id + 'approved' ? <div className="spinner" /> : <CheckCircle size={15} />}
                            </button>
                            <button className="btn btn-danger btn-sm" disabled={!!processing} onClick={() => { setSelected(m); setActionNote(''); }}>
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
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
        <Modal title="Medicine Details" onClose={() => { setSelected(null); setActionNote(''); }}
          footer={
            selected.status === 'pending' ? (
              <div style={{ display: 'flex', gap: '.75rem', width: '100%' }}>
                <button className="btn btn-danger" style={{ flex: 1 }} disabled={!!processing}
                  onClick={() => handleAction(selected._id, 'rejected')}>
                  {processing === selected._id + 'rejected' ? <div className="spinner" /> : <><XCircle size={15} /> Reject</>}
                </button>
                <button className="btn btn-success" style={{ flex: 1 }} disabled={!!processing}
                  onClick={() => handleAction(selected._id, 'approved')}>
                  {processing === selected._id + 'approved' ? <div className="spinner" /> : <><CheckCircle size={15} /> Approve</>}
                </button>
              </div>
            ) : null
          }
        >
          {selected.imageUrl && <img src={selected.imageUrl} alt={selected.name} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius)', marginBottom: '1rem' }} />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', marginBottom: '1rem' }}>
            {[
              { icon: Pill, label: 'Medicine', value: selected.name },
              { icon: Package, label: 'Quantity', value: `${selected.quantity} ${selected.unit}` },
              { icon: Calendar, label: 'Expiry', value: formatDate(selected.expiryDate) },
              { icon: User, label: 'Donor', value: selected.donor?.name },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', fontWeight: 600, marginBottom: '.2rem', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '.9rem', fontWeight: 600, display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                  <Icon size={14} style={{ color: 'var(--brand-500)' }} />{value}
                </div>
              </div>
            ))}
          </div>
          {selected.description && <p style={{ fontSize: '.875rem', marginBottom: '1rem' }}>{selected.description}</p>}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Admin Note (optional)</label>
            <textarea className="form-textarea" placeholder="Add a note for the donor..." value={actionNote} onChange={e => setActionNote(e.target.value)} style={{ minHeight: 70 }} />
          </div>
        </Modal>
      )}
    </div>
  );
}
