import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MedicineCard from '../../components/common/MedicineCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { PlusCircle, Trash2, Pill } from 'lucide-react';

export default function MyDonations() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/medicines').then(r => setMedicines(r.data.medicines)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? medicines : medicines.filter(m => m.status === filter);

  const handleDelete = async (id) => {
    if (!confirm('Delete this donation listing?')) return;
    setDeleting(id);
    try {
      await api.delete(`/medicines/${id}`);
      setMedicines(p => p.filter(m => m._id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Donations</h1>
          <p>{medicines.length} total listing{medicines.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/donor/donate" className="btn btn-primary"><PlusCircle size={16} /> Donate Medicine</Link>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} />
          <h3>{filter === 'all' ? 'No donations yet' : `No ${filter} donations`}</h3>
          <p style={{ marginBottom: '1.5rem' }}>{filter === 'all' ? 'Start donating unused medicines from your home.' : ''}</p>
          {filter === 'all' && <Link to="/donor/donate" className="btn btn-primary"><PlusCircle size={16} /> Donate your first medicine</Link>}
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
                    onClick={() => handleDelete(m._id)}
                    disabled={deleting === m._id}
                  >
                    {deleting === m._id ? <div className="spinner" /> : <><Trash2 size={14} /> Delete listing</>}
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
