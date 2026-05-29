import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  CircleDollarSign,
  AlertTriangle,
  Clock,
  BarChart3,
  FileBarChart,
  Settings,
  Activity,
  Archive,
  Bell,
  Search,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Settings2,
  TrendingUp,
  Truck,
  HelpCircle,
  CheckSquare,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Sidebar.css';

import type { UserRole } from '../../types';

interface NavLinkConfig {
  to: string;
  icon: React.ElementType;
  label: string;
  allowedRoles?: UserRole[];
}

const identityLinks: NavLinkConfig[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/activity-logs', icon: Activity, label: 'Activity Logs' },
  { to: '/archive', icon: Archive, label: 'Archive' },
  { to: '/settings', icon: Settings, label: 'Settings', allowedRoles: ['ADMIN'] },
];

const billingLinks: NavLinkConfig[] = [
  { to: '/invoices', icon: FileText, label: 'Billing & Invoices' },
  { to: '/payments', icon: Receipt, label: 'Payments' },
  { to: '/pricing', icon: Calculator, label: 'Shipment Calculator' },
  { to: '/adjustments', icon: Settings2, label: 'Billing Adjustments' },
  { to: '/validations', icon: CheckSquare, label: 'COD Validations' },
];

const operationsLinks: NavLinkConfig[] = [
  { to: '/aging', icon: Clock, label: 'Receivables Aging' },
  { to: '/overdue', icon: AlertTriangle, label: 'Overdue Accounts' },
  { to: '/cash-flow', icon: TrendingUp, label: 'Cash Flow' },
  { to: '/expenses', icon: Truck, label: 'Fleet Expenses' },
  { to: '/support', icon: HelpCircle, label: 'Disputes & Tickets' },
];

const reportingLinks: NavLinkConfig[] = [
  { to: '/reports', icon: FileBarChart, label: 'Reports', allowedRoles: ['ADMIN'] },
  { to: '/collection-summary', icon: CircleDollarSign, label: 'Collection Summary', allowedRoles: ['ADMIN'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', allowedRoles: ['ADMIN'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [openSection, setOpenSection] = useState<'identity' | 'billing' | 'operations' | 'reporting' | null>('identity');

  const toggleSection = (section: 'identity' | 'billing' | 'operations' | 'reporting') => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

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

  const hasAccess = (link: NavLinkConfig) => {
    if (!link.allowedRoles) return true;
    if (!user) return false;
    return link.allowedRoles.includes(user.role);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={onToggle} title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-logo">
        <div className="login-logo" style={{ padding: '0', background: 'transparent' }}>
          <img src={logo} alt="FOMS Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
      </div>

      <div className="sidebar-role-section">
        <div
          className={`sidebar-role-badge ${
            user?.role ? user.role.toLowerCase().replaceAll('.', '').replaceAll(' ', '-') : 'employee'
          }`}
        >
          <div className="role-dot-inner" />
          <span className="role-text">{user?.role || 'EMPLOYEE'}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Collapsible accordion sections */}
        <>
          {/* Section 1: Identity & Account Service */}
          {identityLinks.filter(hasAccess).length > 0 && (
            <div className="nav-section">
              <button 
                className={`sidebar-section-header ${openSection === 'identity' ? 'active' : ''}`} 
                onClick={() => toggleSection('identity')}
              >
                <div className="sidebar-section-header-left">
                  <Users size={18} />
                  <span>Identity & Account Service</span>
                </div>
                <ChevronDown size={16} className={`chevron ${openSection === 'identity' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`sidebar-submenu-wrapper ${openSection === 'identity' ? 'open' : ''}`}>
                <div className="sidebar-submenu-content">
                  <div className="sidebar-submenu">
                    {identityLinks.filter(hasAccess).map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `nav-item ${
                            isActive || (link.to === '/dashboard' && location.pathname === '/') ? 'nav-item-active' : ''
                          }`
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

          {/* Section 2: Billing & Payment Service */}
          {billingLinks.filter(hasAccess).length > 0 && (
            <div className="nav-section">
              <button 
                className={`sidebar-section-header ${openSection === 'billing' ? 'active' : ''}`} 
                onClick={() => toggleSection('billing')}
              >
                <div className="sidebar-section-header-left">
                  <Receipt size={18} />
                  <span>Billing & Payment Service</span>
                </div>
                <ChevronDown size={16} className={`chevron ${openSection === 'billing' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`sidebar-submenu-wrapper ${openSection === 'billing' ? 'open' : ''}`}>
                <div className="sidebar-submenu-content">
                  <div className="sidebar-submenu">
                    {billingLinks.filter(hasAccess).map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
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

          {/* Section 3: Finance Operation Service */}
          {operationsLinks.filter(hasAccess).length > 0 && (
            <div className="nav-section">
              <button 
                className={`sidebar-section-header ${openSection === 'operations' ? 'active' : ''}`} 
                onClick={() => toggleSection('operations')}
              >
                <div className="sidebar-section-header-left">
                  <CircleDollarSign size={18} />
                  <span>Finance Operation Service</span>
                </div>
                <ChevronDown size={16} className={`chevron ${openSection === 'operations' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`sidebar-submenu-wrapper ${openSection === 'operations' ? 'open' : ''}`}>
                <div className="sidebar-submenu-content">
                  <div className="sidebar-submenu">
                    {operationsLinks.filter(hasAccess).map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
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

          {/* Section 4: Reporting & Analytics Service */}
          {reportingLinks.filter(hasAccess).length > 0 && (
            <div className="nav-section">
              <button 
                className={`sidebar-section-header ${openSection === 'reporting' ? 'active' : ''}`} 
                onClick={() => toggleSection('reporting')}
              >
                <div className="sidebar-section-header-left">
                  <FileBarChart size={18} />
                  <span>Reporting & Analytics Service</span>
                </div>
                <ChevronDown size={16} className={`chevron ${openSection === 'reporting' ? 'rotate-180' : ''}`} />
              </button>
              <div className={`sidebar-submenu-wrapper ${openSection === 'reporting' ? 'open' : ''}`}>
                <div className="sidebar-submenu-content">
                  <div className="sidebar-submenu">
                    {reportingLinks.filter(hasAccess).map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
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
        </>
      </nav>

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
