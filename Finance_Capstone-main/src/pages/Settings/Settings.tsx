import { useState } from 'react';
import { Save, User as UserIcon, SlidersHorizontal } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import '../Invoices/Invoices.css';

type Tab = 'profile' | 'preferences';

export default function Settings() {
  const { addActivityLog } = useData();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [preferences, setPreferences] = useState({ theme: 'light', emailNotifs: true, smsNotifs: false, timezone: 'Asia/Manila' });

  const handleSave = () => {
    setIsSaved(true);
    addActivityLog({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      userName: user?.name || 'System',
      userRole: user?.role || 'ADMIN',
      userInitials: (user?.name || 'SY').split(' ').map((n) => n[0]).join('').substring(0, 2),
      userColor: '#FFB547',
      action: 'Update Client',
      description: `Updated system settings (${tab})`,
    });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <>
      <Header
        title="Settings"
        subtitle="System Configuration"
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <Save size={14} /> {isSaved ? 'Saved!' : 'Save Changes'}
          </button>
        }
      />
      <div className="page-content">
        <div className="orders-filter-bar" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
          <button className={`btn btn-sm ${tab === 'profile' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('profile')}>
            <UserIcon size={14} /> Profile
          </button>
          <button className={`btn btn-sm ${tab === 'preferences' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('preferences')}>
            <SlidersHorizontal size={14} /> Preferences
          </button>
        </div>

        {tab === 'profile' && (
          <div className="card">
            <h4>Profile Information</h4>
            <div className="form-row two-col" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">FULL NAME</label>
                <input className="form-input" defaultValue={user?.name} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">EMPLOYEE ID</label>
                <input className="form-input" defaultValue={user?.id} readOnly />
              </div>
            </div>
            <div className="form-row two-col">
              <div className="form-group">
                <label className="form-label">ROLE</label>
                <input className="form-input" defaultValue={user?.role} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">SYSTEM ACCESS</label>
                <input className="form-input" defaultValue={user?.systemAccess} readOnly />
              </div>
            </div>
          </div>
        )}

        {tab === 'preferences' && (
          <div className="edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap)' }}>
            <div className="card">
              <h4>Appearance</h4>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">THEME</label>
                <select className="form-input" value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">TIMEZONE</label>
                <select className="form-input" value={preferences.timezone} onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}>
                  <option value="Asia/Manila">Asia/Manila (PHT)</option>
                  <option value="UTC">UTC (Universal)</option>
                </select>
              </div>
            </div>
            <div className="card">
              <h4>Notifications</h4>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="check-option" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifs}
                    onChange={(e) => setPreferences({ ...preferences, emailNotifs: e.target.checked })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Enable Email Alerts
                </label>
                <p className="text-muted text-sm" style={{ paddingLeft: '24px', marginTop: '4px' }}>
                  Receive daily summaries and urgent overdue alerts.
                </p>
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="check-option" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifs}
                    onChange={(e) => setPreferences({ ...preferences, smsNotifs: e.target.checked })}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  Enable SMS Push
                </label>
                <p className="text-muted text-sm" style={{ paddingLeft: '24px', marginTop: '4px' }}>
                  Receive push notifications for critical events.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
