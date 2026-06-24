import { getStatusLabel } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{getStatusLabel(status)}</span>;
}
