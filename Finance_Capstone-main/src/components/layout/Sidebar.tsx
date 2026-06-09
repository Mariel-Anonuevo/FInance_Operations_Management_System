import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  Receipt,
  AlertTriangle,
  FileBarChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings2,
  TrendingUp,
  HelpCircle,
  CheckSquare,
  ChevronDown,
  Users,
  FileText,
  Clock,
  BookOpen,
  List,
  ClipboardList,
  Briefcase,
  LayoutDashboard,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Sidebar.css';

import type { UserRole } from '../../types';

interface NavLinkConfig {
  to: string;
  icon: React.ElementType;
  label: string;
  allowedRoles: UserRole[];
}

// ─── Finance Operation Service: All modules with their exact allowed roles ───
const financeOperationLinks: NavLinkConfig[] = [
  // Bookkeeper modules
  { to: '/bookkeeper-dashboard', icon: LayoutDashboard,  label: 'Dashboard',                    allowedRoles: ['Bookkeeper'] },
  { to: '/payments',             icon: CircleDollarSign, label: 'Payment Collection',           allowedRoles: ['Bookkeeper'] },
  { to: '/official-receipts',    icon: Receipt,          label: 'Official Receipts',             allowedRoles: ['Bookkeeper'] },
  { to: '/outstanding-balances', icon: AlertTriangle,    label: 'Outstanding Balances',          allowedRoles: ['Bookkeeper'] },
  { to: '/adjustments',          icon: Settings2,        label: 'Payment Adjustment',            allowedRoles: ['Bookkeeper'] },
  { to: '/validations',          icon: CheckSquare,      label: 'Delivery Payment Validation',   allowedRoles: ['Bookkeeper'] },
  { to: '/support',              icon: HelpCircle,       label: 'Disputes & Tickets',            allowedRoles: ['Bookkeeper'] },

  // Accountant modules
  { to: '/clients',              icon: Users,            label: 'Client Accounts',               allowedRoles: ['Accountant'] },
  { to: '/pricing',              icon: Calculator,       label: 'Shipment Pricing',              allowedRoles: ['Accountant'] },
  { to: '/invoices',             icon: FileText,         label: 'Billing & Invoice',             allowedRoles: ['Accountant'] },
  { to: '/aging',                icon: Clock,            label: 'Receivables Aging',             allowedRoles: ['Accountant'] },
  { to: '/overdue',              icon: AlertTriangle,    label: 'Overdue Accounts',              allowedRoles: ['Accountant'] },
  { to: '/cash-flow',            icon: TrendingUp,       label: 'Cash Flow Monitoring',          allowedRoles: ['Accountant'] },
  { to: '/general-ledger',       icon: BookOpen,         label: 'General Ledger',                allowedRoles: ['Accountant'] },
  { to: '/chart-of-accounts',    icon: List,             label: 'Chart of Accounts',             allowedRoles: ['Accountant'] },
  { to: '/adjustment-logs',      icon: ClipboardList,    label: 'Adjustment Logs',               allowedRoles: ['Accountant'] },
  { to: '/reports',              icon: FileBarChart,     label: 'Financial Reports',             allowedRoles: ['Accountant'] },
  { to: '/dashboard',            icon: LayoutDashboard,  label: 'Dashboard Monitoring',          allowedRoles: ['Accountant'] },

  // Payroll Officer modules
  { to: '/payroll',              icon: Briefcase,        label: 'Payroll Management',            allowedRoles: ['Payroll Officer'] },
];

// Role badge color map
const roleBadgeStyle: Record<UserRole, { bg: string; color: string; dot: string }> = {
  'Bookkeeper':     { bg: 'rgba(0,169,157,0.15)',   color: '#00A99D', dot: '#00A99D' },
  'Accountant':     { bg: 'rgba(99,102,241,0.15)',  color: '#6366F1', dot: '#6366F1' },
  'Payroll Officer':{ bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6', dot: '#8B5CF6' },
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [financeOpen, setFinanceOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  // Filter links by the current user's role
  const visibleLinks = financeOperationLinks.filter(
    (link) => user && link.allowedRoles.includes(user.role)
  );

  const badgeStyle = user ? roleBadgeStyle[user.role] : { bg: 'rgba(128,128,128,0.15)', color: '#888', dot: '#888' };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={onToggle} title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-logo">
        <div className="login-logo" style={{ padding: '0', background: 'transparent' }}>
          <img src={logo} alt="FOMS Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
      </div>

      {/* Role Badge */}
      <div className="sidebar-role-section">
        <div
          className="sidebar-role-badge"
          style={{ background: badgeStyle.bg, border: `1px solid ${badgeStyle.color}30` }}
        >
          <div className="role-dot-inner" style={{ background: badgeStyle.dot }} />
          <span className="role-text" style={{ color: badgeStyle.color }}>
            {user?.role || 'EMPLOYEE'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleLinks.length > 0 && (
          <div className="nav-section">
            {/* Finance Operation Service accordion header */}
            <button
              className={`sidebar-section-header ${financeOpen ? 'active' : ''}`}
              onClick={() => setFinanceOpen((prev) => !prev)}
            >
              <div className="sidebar-section-header-left">
                <CircleDollarSign size={18} />
                <span>Finance Operation Service</span>
              </div>
              <ChevronDown
                size={16}
                className={`chevron ${financeOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div className={`sidebar-submenu-wrapper ${financeOpen ? 'open' : ''}`}>
              <div className="sidebar-submenu-content">
                <div className="sidebar-submenu">
                  {visibleLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? 'nav-item-active' : ''}`
                      }
                    >
                      <link.icon size={16} />
                      <span className="nav-item-label">{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Profile Footer */}
      <div className="sidebar-footer-profile">
        <div className="sidebar-profile-card">
          <div className="profile-avatar">{user ? getInitials(user.name) : '??'}</div>
          <div className="profile-info">
            <span className="profile-name">{user?.name || 'Guest User'}</span>
            <span className="profile-role">{user?.role || 'Staff'}</span>
          </div>
          <button className="profile-logout" title="Logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
