import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, ImageIcon } from 'lucide-react';

const CATEGORIES = ['General', 'Antibiotics', 'Painkillers', 'Vitamins & Supplements', 'Antidiabetic', 'Cardiovascular', 'Respiratory', 'Gastrointestinal', 'Dermatology', 'Other'];
const UNITS = ['tablets', 'capsules', 'ml', 'mg', 'strips', 'bottles', 'vials', 'sachets', 'units'];

export default function DonateMedicine() {
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'tablets', expiryDate: '', description: '', category: 'General' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append('image', image);
    setLoading(true);
    try {
      await api.post('/medicines', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Medicine submitted for review!');
      navigate('/donor/my-donations');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  // Min expiry date = 30 days from today
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 30);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Donate a Medicine</h1>
        <p>Fill in the details below. Your listing will be reviewed by an admin before becoming visible to NGOs.</p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Medicine Name <span>*</span></label>
                <input className="form-input" type="text" placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity <span>*</span></label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 30" value={form.quantity} onChange={e => set('quantity', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit <span>*</span></label>
                  <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Expiry Date <span>*</span></label>
                  <input className="form-input" type="date" min={minDateStr} value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} required />
                  <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', marginTop: '.2rem' }}>Must expire at least 30 days from today</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Any additional information about this medicine..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Medicine Photo</label>
                <div
                  className={`image-upload-area${preview ? ' has-image' : ''}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {preview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={preview} alt="preview" className="image-preview" />
                      <button type="button"
                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                        onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                      ><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon size={32} style={{ color: 'var(--gray-300)', marginBottom: '.5rem' }} />
                      <p style={{ fontSize: '.875rem', color: 'var(--gray-500)', margin: 0 }}>Click to upload a photo <span style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>(optional, max 5MB)</span></p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImage} />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner" /> Submitting...</> : <><Upload size={16} /> Submit Donation</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
