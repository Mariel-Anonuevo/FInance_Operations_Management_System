import Header from '../../components/layout/Header';
import { AlertTriangle } from 'lucide-react';

export default function CashFlow() {
  return (
    <>
      <Header
        title="Cash Flow & Bank Reconciliations"
        subtitle="Operations · FOMS"
      />

      <div className="dashboard-content animate-fade-in">
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <AlertTriangle size={42} color="var(--status-pending)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Cash Flow Monitoring is under development
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: '560px', margin: '0 auto' }}>
            This module is still being built. The current cash flow visualization, ledger, and bank reconciliation features will be available soon.
          </p>
        </div>
      </div>
    </>
  );
}
