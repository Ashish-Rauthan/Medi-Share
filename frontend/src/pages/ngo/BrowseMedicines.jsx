import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MedicineCard from '../../components/common/MedicineCard';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, daysUntilExpiry } from '../../utils/helpers';
import { Search, Pill, Calendar, Package, User, Phone, MapPin } from 'lucide-react';

export default function BrowseMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [requestForm, setRequestForm] = useState({ quantity: '', purpose: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/medicines', { params: q ? { search: q } : {} });
      setMedicines(res.data.medicines);
    } finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(search);
  };

  const openRequest = async (medicine) => {
    try {
      const res = await api.get(`/medicines/${medicine._id}`);
      setSelected(res.data.medicine);
      setRequestForm({ quantity: '', purpose: '' });
      setShowModal(true);
    } catch { toast.error('Could not load medicine details'); }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.quantity || !requestForm.purpose) { toast.error('Fill in all fields'); return; }
    setSubmitting(true);
    try {
      await api.post('/requests', { medicineId: selected._id, quantityRequested: requestForm.quantity, purpose: requestForm.purpose });
      toast.success('Request submitted successfully!');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Available Medicines</h1>
        <p>Browse and request medicines for your organization's beneficiaries.</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.75rem', marginBottom: '2rem', maxWidth: 500 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input className="form-input" type="text" placeholder="Search by medicine name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {search && <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); fetchMedicines(); }}>Clear</button>}
      </form>

      {loading ? <LoadingSpinner fullPage /> : medicines.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} /><h3>No medicines found</h3>
          <p>{search ? `No results for "${search}"` : 'No medicines available right now. Check back later.'}</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '1rem', fontSize: '.875rem', color: 'var(--gray-500)' }}>{medicines.length} medicine{medicines.length !== 1 ? 's' : ''} available</p>
          <div className="medicine-grid">
            {medicines.map(m => (
              <MedicineCard
                key={m._id}
                medicine={m}
                onClick={() => openRequest(m)}
                actions={
                  <button className="btn btn-primary btn-sm btn-full" onClick={(e) => { e.stopPropagation(); openRequest(m); }}>
                    Request this medicine
                  </button>
                }
              />
            ))}
          </div>
        </>
      )}

      {showModal && selected && (
        <Modal title="Request Medicine" onClose={() => setShowModal(false)}>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '.75rem' }}>{selected.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
              {[
                { icon: Package, text: `${selected.quantity} ${selected.unit} available` },
                { icon: Calendar, text: `Expires ${formatDate(selected.expiryDate)}` },
                { icon: User, text: selected.donor?.name || 'Unknown donor' },
                { icon: Phone, text: selected.donor?.phone || 'No phone' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.8rem', color: 'var(--gray-600)' }}>
                  <Icon size={13} /><span>{text}</span>
                </div>
              ))}
            </div>
            {selected.description && <p style={{ fontSize: '.85rem', marginTop: '.75rem', color: 'var(--gray-600)' }}>{selected.description}</p>}
          </div>

          <form onSubmit={submitRequest}>
            <div className="form-group">
              <label className="form-label">Quantity Requested <span>*</span></label>
              <input className="form-input" type="number" min="1" max={selected.quantity} placeholder={`Max: ${selected.quantity} ${selected.unit}`}
                value={requestForm.quantity} onChange={e => setRequestForm(p => ({ ...p, quantity: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Purpose / Reason <span>*</span></label>
              <textarea className="form-textarea" placeholder="Describe how these medicines will be used by your organization..."
                value={requestForm.purpose} onChange={e => setRequestForm(p => ({ ...p, purpose: e.target.value }))} required style={{ minHeight: 100 }} />
            </div>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <div className="spinner" /> : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
