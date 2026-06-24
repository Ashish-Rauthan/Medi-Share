import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Building2, Mail, Phone, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminNGOs() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchPendingNGOs(); }, []);

  const fetchPendingNGOs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/ngos/pending');
      setNgos(res.data.ngos);
    } finally { setLoading(false); }
  };

  const handleAction = async (id, approve) => {
    setProcessing(id);
    try {
      await api.patch(`/admin/ngos/${id}/approve`, { approve });
      toast.success(`NGO ${approve ? 'approved' : 'rejected'} — email sent`);
      setNgos(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setProcessing(null); }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>NGO Approvals</h1>
        <p>{ngos.length} NGO{ngos.length !== 1 ? 's' : ''} pending approval</p>
      </div>

      {ngos.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} />
          <h3>No pending NGOs</h3>
          <p>All NGO registration requests have been reviewed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ngos.map(ngo => (
            <div key={ngo._id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, background: 'var(--purple-100)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={24} style={{ color: 'var(--purple-500)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '.25rem' }}>{ngo.organizationName || ngo.name}</h3>
                    <p style={{ fontSize: '.875rem', color: 'var(--gray-500)', marginBottom: '.75rem' }}>Contact: {ngo.name}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {[
                        { icon: Mail, text: ngo.email },
                        { icon: Phone, text: ngo.phone || 'No phone' },
                        { icon: MapPin, text: ngo.address || 'No address' },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem', color: 'var(--gray-500)' }}>
                          <Icon size={14} /><span>{text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: '.8rem', color: 'var(--gray-400)', marginTop: '.5rem' }}>
                      Registered {formatDate(ngo.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-danger"
                      disabled={processing === ngo._id}
                      onClick={() => handleAction(ngo._id, false)}
                    >
                      {processing === ngo._id ? <div className="spinner" /> : <><XCircle size={16} /> Reject</>}
                    </button>
                    <button
                      className="btn btn-success"
                      disabled={processing === ngo._id}
                      onClick={() => handleAction(ngo._id, true)}
                    >
                      {processing === ngo._id ? <div className="spinner" /> : <><CheckCircle size={16} /> Approve</>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}