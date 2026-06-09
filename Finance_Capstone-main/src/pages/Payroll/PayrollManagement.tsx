import { Briefcase } from 'lucide-react';

export default function PayrollManagement() {
  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '32px' }}>
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Briefcase size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Payroll Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>Finance Operation Service &rsaquo; Payroll Management</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(109,40,217,0.04))',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: '16px',
        padding: '60px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(139,92,246,0.3)',
        }}>
          <Briefcase size={36} color="#fff" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Payroll Management
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
          This module is reserved for Payroll Management operations. Features including salary computation, deductions, payslips, reports, and bank advice files are currently under development and will be available in a future release.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          background: 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '8px',
          color: '#8B5CF6',
          fontWeight: '600',
          fontSize: '13px',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
