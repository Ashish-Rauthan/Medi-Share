import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import MedicineCard from '../../components/common/MedicineCard';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Search, Pill, Calendar, Package, User, Phone, AlertCircle } from 'lucide-react';

export default function BrowseMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [requestForm, setRequestForm] = useState({ quantity: '', purpose: '' });
  const [requestErrors, setRequestErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchMedicines = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/medicines', { params: q ? { search: q } : {} });
      setMedicines(res.data.medicines);
    } catch {
      // api.js interceptor already handles server errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(search.trim());
  };

  const handleClear = () => {
    setSearch('');
    fetchMedicines();
  };

  const openRequest = async (medicine) => {
    try {
      const res = await api.get(`/medicines/${medicine._id}`);
      setSelected(res.data.medicine);
      setRequestForm({ quantity: '', purpose: '' });
      setRequestErrors({});
      setShowModal(true);
    } catch {
      toast.error('Could not load medicine details. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setRequestErrors({});
  };

  const validateRequest = () => {
    const errs = {};
    const qty = Number(requestForm.quantity);

    if (!requestForm.quantity) {
      errs.quantity = 'Please enter a quantity.';
    } else if (!Number.isInteger(qty) || qty < 1) {
      errs.quantity = 'Quantity must be a positive whole number.';
    } else if (qty > selected.quantity) {
      errs.quantity = `Only ${selected.quantity} ${selected.unit} available.`;
    }

    if (!requestForm.purpose.trim()) {
      errs.purpose = 'Please describe the purpose of this request.';
    } else if (requestForm.purpose.trim().length < 20) {
      errs.purpose = 'Please provide a more detailed purpose (at least 20 characters).';
    }

    return errs;
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    const errs = validateRequest();
    if (Object.keys(errs).length > 0) {
      setRequestErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        medicineId: selected._id,
        quantityRequested: Number(requestForm.quantity),
        purpose: requestForm.purpose.trim(),
      });
      toast.success('Request submitted successfully!');
      closeModal();
    } catch (err) {
      const message = err.response?.data?.message;
      // 409 = already has active request for this medicine
      if (err.response?.status === 409) {
        setRequestErrors({ submit: message || 'You already have an active request for this medicine.' });
      } else {
        setRequestErrors({ submit: message || 'Request failed. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (k, v) => {
    setRequestForm(p => ({ ...p, [k]: v }));
    if (requestErrors[k]) setRequestErrors(p => ({ ...p, [k]: '' }));
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Available Medicines</h1>
        <p>Browse and request medicines for your organization's beneficiaries.</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.75rem', marginBottom: '2rem', maxWidth: 500 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} className="search-icon" />
          <input
            className="form-input"
            type="text"
            placeholder="Search by medicine name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
        )}
      </form>

      {loading ? (
        <LoadingSpinner fullPage />
      ) : medicines.length === 0 ? (
        <div className="empty-state">
          <Pill size={48} />
          <h3>No medicines found</h3>
          <p>{search ? `No results for "${search}"` : 'No medicines available right now. Check back later.'}</p>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '1rem', fontSize: '.875rem', color: 'var(--gray-500)' }}>
            {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} available
          </p>
          <div className="medicine-grid">
            {medicines.map(m => (
              <MedicineCard
                key={m._id}
                medicine={m}
                onClick={() => openRequest(m)}
                actions={
                  <button
                    className="btn btn-primary btn-sm btn-full"
                    onClick={(e) => { e.stopPropagation(); openRequest(m); }}
                  >
                    Request this medicine
                  </button>
                }
              />
            ))}
          </div>
        </>
      )}

      {/* Request modal */}
      {showModal && selected && (
        <Modal title="Request Medicine" onClose={closeModal}>
          {/* Medicine summary */}
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
            <h3 style={{ marginBottom: '.75rem' }}>{selected.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
              {[
                { icon: Package, text: `${selected.quantity} ${selected.unit} available` },
                { icon: Calendar, text: `Expires ${formatDate(selected.expiryDate)}` },
                { icon: User, text: selected.donor?.name || 'Unknown donor' },
                { icon: Phone, text: selected.donor?.phone || 'No phone listed' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.8rem', color: 'var(--gray-600)' }}>
                  <Icon size={13} /><span>{text}</span>
                </div>
              ))}
            </div>
            {selected.description && (
              <p style={{ fontSize: '.85rem', marginTop: '.75rem', color: 'var(--gray-600)' }}>
                {selected.description}
              </p>
            )}
          </div>

          {/* Submit-level error (e.g. duplicate request) */}
          {requestErrors.submit && (
            <div className="alert alert-error" style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {requestErrors.submit}
            </div>
          )}

          <form onSubmit={submitRequest} noValidate>
            <div className="form-group">
              <label className="form-label">
                Quantity Requested <span>*</span>
              </label>
              <input
                className="form-input"
                style={{ borderColor: requestErrors.quantity ? 'var(--red-500)' : undefined }}
                type="number"
                min="1"
                max={selected.quantity}
                step="1"
                placeholder={`Max: ${selected.quantity} ${selected.unit}`}
                value={requestForm.quantity}
                onChange={e => setField('quantity', e.target.value)}
              />
              {requestErrors.quantity && <div className="form-error">{requestErrors.quantity}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Purpose / Reason <span>*</span>
                <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '.4rem' }}>
                  ({requestForm.purpose.length}/500)
                </span>
              </label>
              <textarea
                className="form-textarea"
                style={{ borderColor: requestErrors.purpose ? 'var(--red-500)' : undefined, minHeight: 100 }}
                placeholder="Describe how these medicines will be used by your organization…"
                value={requestForm.purpose}
                onChange={e => setField('purpose', e.target.value)}
                maxLength={500}
              />
              {requestErrors.purpose && <div className="form-error">{requestErrors.purpose}</div>}
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
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
