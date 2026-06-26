import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'General', 'Antibiotics', 'Painkillers', 'Vitamins & Supplements',
  'Antidiabetic', 'Cardiovascular', 'Respiratory', 'Gastrointestinal',
  'Dermatology', 'Other',
];
const UNITS = ['tablets', 'capsules', 'ml', 'mg', 'strips', 'bottles', 'vials', 'sachets', 'units'];

// Min expiry: 30 days from today
function getMinDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

export default function DonateMedicine() {
  const [form, setForm] = useState({
    name: '', quantity: '', unit: 'tablets',
    expiryDate: '', description: '', category: 'General',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const fileRef = useRef();
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    // Clear field-level error on change
    if (fieldErrors[k]) setFieldErrors(p => ({ ...p, [k]: '' }));
    setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed.');
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Medicine name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    const qty = Number(form.quantity);
    if (!form.quantity) errs.quantity = 'Quantity is required.';
    else if (!Number.isInteger(qty) || qty < 1) errs.quantity = 'Quantity must be a positive whole number.';
    else if (qty > 100000) errs.quantity = 'Quantity seems too large. Please double-check.';

    if (!form.expiryDate) {
      errs.expiryDate = 'Expiry date is required.';
    } else {
      const expiry = new Date(form.expiryDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 30);
      if (expiry < minDate) errs.expiryDate = 'Medicine must expire at least 30 days from today.';
    }

    if (form.description && form.description.length > 500) {
      errs.description = 'Description must be under 500 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please fix the highlighted fields before submitting.');
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);

    setLoading(true);
    try {
      await api.post('/medicines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Medicine submitted for review!');
      navigate('/donor/my-donations');
    } catch (err) {
      const message = err.response?.data?.message || 'Submission failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const minDateStr = getMinDateStr();

  const fieldStyle = (key) => ({
    width: '100%', padding: '.65rem 1rem',
    border: `1.5px solid ${fieldErrors[key] ? 'var(--red-500)' : 'var(--gray-200)'}`,
    borderRadius: 'var(--radius)', fontSize: '.9rem', fontFamily: 'var(--font-sans)',
    color: 'var(--gray-800)', background: '#fff',
    transition: 'border-color .15s', outline: 'none',
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Donate a Medicine</h1>
        <p>Fill in the details below. Your listing will be reviewed by an admin before becoming visible to NGOs.</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="card">
          <div className="card-body">
            {error && (
              <div className="alert alert-error" style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Medicine Name */}
              <div className="form-group">
                <label className="form-label">
                  Medicine Name <span>*</span>
                </label>
                <input
                  className="form-input"
                  style={{ borderColor: fieldErrors.name ? 'var(--red-500)' : undefined }}
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  maxLength={100}
                />
                {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
              </div>

              {/* Quantity + Unit */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity <span>*</span></label>
                  <input
                    className="form-input"
                    style={{ borderColor: fieldErrors.quantity ? 'var(--red-500)' : undefined }}
                    type="number" min="1" max="100000" step="1"
                    placeholder="e.g. 30"
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                  />
                  {fieldErrors.quantity && <div className="form-error">{fieldErrors.quantity}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Unit <span>*</span></label>
                  <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Expiry + Category */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date <span>*</span></label>
                  <input
                    className="form-input"
                    style={{ borderColor: fieldErrors.expiryDate ? 'var(--red-500)' : undefined }}
                    type="date"
                    min={minDateStr}
                    value={form.expiryDate}
                    onChange={e => set('expiryDate', e.target.value)}
                  />
                  {fieldErrors.expiryDate
                    ? <div className="form-error">{fieldErrors.expiryDate}</div>
                    : <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', marginTop: '.2rem' }}>Must expire at least 30 days from today</div>
                  }
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  Description
                  <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: '.4rem' }}>
                    ({form.description.length}/500)
                  </span>
                </label>
                <textarea
                  className="form-textarea"
                  style={{ borderColor: fieldErrors.description ? 'var(--red-500)' : undefined }}
                  placeholder="Any additional information about this medicine…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  maxLength={500}
                />
                {fieldErrors.description && <div className="form-error">{fieldErrors.description}</div>}
              </div>

              {/* Image upload */}
              <div className="form-group">
                <label className="form-label">Medicine Photo</label>
                <div
                  className={`image-upload-area${preview ? ' has-image' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                  aria-label="Upload medicine photo"
                >
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="preview" className="image-preview" />
                      <button
                        type="button"
                        aria-label="Remove image"
                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); fileRef.current.value = ''; }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={32} style={{ color: 'var(--gray-300)', marginBottom: '.5rem' }} />
                      <p style={{ fontSize: '.875rem', color: 'var(--gray-500)', margin: 0 }}>
                        Click to upload a photo{' '}
                        <span style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>(optional · JPEG/PNG/WebP · max 5 MB)</span>
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImage}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading
                    ? <><div className="spinner" /> Submitting…</>
                    : <><Upload size={16} /> Submit Donation</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
