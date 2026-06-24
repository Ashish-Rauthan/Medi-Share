import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import {
  LayoutDashboard, Pill, ClipboardList, Users, PlusCircle,
  Search, LogOut, ShieldCheck, HeartHandshake, Building2
} from 'lucide-react';

const donorLinks = [
  { to: '/donor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/donor/donate', label: 'Donate Medicine', icon: PlusCircle },
  { to: '/donor/my-donations', label: 'My Donations', icon: Pill },
];
const ngoLinks = [
  { to: '/ngo', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ngo/browse', label: 'Browse Medicines', icon: Search },
  { to: '/ngo/my-requests', label: 'My Requests', icon: ClipboardList },
];
const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/medicines', label: 'Verify Medicines', icon: ShieldCheck },
  { to: '/admin/requests', label: 'Manage Requests', icon: ClipboardList },
  { to: '/admin/ngos', label: 'NGO Approvals', icon: Building2 },
  { to: '/admin/users', label: 'All Users', icon: Users },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'ngo' ? ngoLinks
    : donorLinks;

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><HeartHandshake size={20} color="#fff" /></div>
        <div>
          <div className="sidebar-logo-text">MediShare</div>
          <div className="sidebar-logo-sub">Medicine Donation</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section">Menu</div>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">{getInitials(user?.name)}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role?.toUpperCase()}</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm btn-full"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ color: '#94a3b8', justifyContent: 'flex-start' }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </nav>
  );
}