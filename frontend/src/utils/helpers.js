export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
export const daysUntilExpiry = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected',
    submitted: 'Submitted', under_review: 'Under Review',
    allocated: 'Allocated', completed: 'Completed',
  };
  return labels[status] || status;
};
export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
