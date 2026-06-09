import { ClipboardList } from 'lucide-react';

export default function AdjustmentLogs() {
  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Adjustment Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Finance Operation Service &rsaquo; Adjustment Logs</p>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.04))',
        border: '1px solid rgba(245,158,11,0.25)',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
        }}>
          <ClipboardList size={36} color="#fff" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Adjustment Logs
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          This module is reserved for Adjustment Logs. Features for viewing and auditing billing adjustments, credits, debits, and write-offs are currently under development and will be available in a future release.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '8px',
          color: '#F59E0B',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
          Pending Implementation
        </div>
      </div>
    </div>
  );
}
