import { Pill, Calendar, Package, User } from 'lucide-react';
import { formatDate, daysUntilExpiry } from '../../utils/helpers';
import StatusBadge from './StatusBadge';

export default function MedicineCard({ medicine, onClick, actions }) {
  const days = daysUntilExpiry(medicine.expiryDate);
  const expirySoon = days <= 60 && days > 0;

  return (
    <div className="card medicine-card" onClick={onClick}>
      {medicine.imageUrl ? (
        <img src={medicine.imageUrl} alt={medicine.name} />
      ) : (
        <div className="medicine-card-img-placeholder">
          <Pill size={48} />
        </div>
      )}
      <div className="medicine-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.5rem' }}>
          <h3>{medicine.name}</h3>
          <StatusBadge status={medicine.status} />
        </div>
        {medicine.description && (
          <p style={{ fontSize: '.8rem', marginBottom: '.5rem', color: 'var(--gray-500)', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {medicine.description}
          </p>
        )}
        <div className="medicine-meta">
          <div className="medicine-meta-item">
            <Package size={13} />
            <span>{medicine.quantity} {medicine.unit}</span>
          </div>
          <div className="medicine-meta-item" style={{ color: expirySoon ? 'var(--amber-500)' : undefined }}>
            <Calendar size={13} />
            <span>Expires {formatDate(medicine.expiryDate)}{expirySoon ? ` (${days}d)` : ''}</span>
          </div>
          {medicine.donor?.name && (
            <div className="medicine-meta-item">
              <User size={13} />
              <span>By {medicine.donor.name}</span>
            </div>
          )}
        </div>
        {actions && <div style={{ marginTop: '1rem' }} onClick={e => e.stopPropagation()}>{actions}</div>}
      </div>
    </div>
  );
}
