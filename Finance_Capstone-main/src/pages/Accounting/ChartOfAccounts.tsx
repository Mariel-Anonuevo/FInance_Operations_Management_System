import { List } from 'lucide-react';

export default function ChartOfAccounts() {
  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <List size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Chart of Accounts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Finance Operation Service &rsaquo; Chart of Accounts</p>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}>
          <List size={36} color="#fff" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Chart of Accounts
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          This module is reserved for the Chart of Accounts. Features for managing account codes, types, and classifications are currently under development and will be available in a future release.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '8px',
          color: '#10B981',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Pending Implementation
        </div>
      </div>
    </div>
  );
}
