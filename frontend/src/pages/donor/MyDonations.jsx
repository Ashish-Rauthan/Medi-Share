import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MedicineCard from '../../components/common/MedicineCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusCircle, Trash2, Pill, AlertTriangle, X } from 'lucide-react';

// ── Inline delete confirmation — replaces window.confirm ──────────────────────
function DeleteConfirm({ onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', backdropFilter: 'blur(2px)',
      animation: 'fadeIn .15s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, boxShadow: '0 20px 40px -4px rgba(30,41,59,.15)',
        padding: '2rem', width: '100%', maxWidth: 380, textAlign: 'center',
      }}>
        <div style={{ width: 52, height: 52, background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <AlertTriangle size={24} style={{ color: '#ef4444' }} />
        </div>
        <h3 style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '.5rem' }}>
          Delete this listing?
        </h3>
        <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This will permanently remove your donation listing. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '.75rem' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={loading}
          >
            <X size={15} /> Cancel
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <><Trash2 size={15} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyDonations() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [confirmId, setConfirmId] = useState(null); // id of medicine pending delete confirmation
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    api.get('/medicines')
      .then(r => setMedicines(r.data.medicines))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? medicines : medicines.filter(m => m.status === filter);

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/medicines/${confirmId}`);
      setMedicines(p => p.filter(m => m._id !== confirmId));
      toast.success('Listing deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
      setConfirmId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      {confirmId && (
        <DeleteConfirm
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Donations</h1>
          <p>{medicines.length} total listing{medicines.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/donor/donate" className="btn btn-primary">
          <PlusCircle size={16} /> Donate Medicine
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all','All'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} />
          <h3>{filter === 'all' ? 'No donations yet' : `No ${filter} donations`}</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            {filter === 'all' ? 'Start donating unused medicines from your home.' : ''}
          </p>
          {filter === 'all' && (
            <Link to="/donor/donate" className="btn btn-primary">
              <PlusCircle size={16} /> Donate your first medicine
            </Link>
          )}
        </div>
      ) : (
        <div className="medicine-grid">
          {filtered.map(m => (
            <MedicineCard
              key={m._id}
              medicine={m}
              actions={
                m.status === 'pending' ? (
                  <button
                    className="btn btn-danger btn-sm btn-full"
                    onClick={() => setConfirmId(m._id)}
                  >
                    <Trash2 size={14} /> Delete listing
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
