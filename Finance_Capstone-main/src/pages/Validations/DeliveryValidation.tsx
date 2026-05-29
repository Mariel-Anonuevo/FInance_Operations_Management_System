import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldAlert, CheckCircle, XCircle, Plus, FileText, Calendar, DollarSign, User, ClipboardList, CheckSquare } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency, formatDate } from '../../utils/finance';

export default function DeliveryValidation() {
  const { validations, invoices, submitValidation, verifyValidation } = useData();

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [amountCollected, setAmountCollected] = useState('');
  const [loading, setLoading] = useState(false);

  // Filters & Computations
  const pendingInvoices = useMemo(() => 
    invoices.filter((i) => i.balance > 0 && i.paymentStatus !== 'Paid'),
    [invoices]
  );

  const pendingValidations = useMemo(() => 
    validations.filter((v) => v.status === 'Pending'),
    [validations]
  );

  const processedValidations = useMemo(() => 
    validations.filter((v) => v.status !== 'Pending'),
    [validations]
  );

  const totalPendingAmount = useMemo(() => 
    pendingValidations.reduce((sum, v) => sum + v.amountCollected, 0),
    [pendingValidations]
  );

  const totalReconciledAmount = useMemo(() => 
    processedValidations.filter(v => v.status === 'Approved').reduce((sum, v) => sum + v.amountCollected, 0),
    [processedValidations]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const invoice = invoices.find((i) => i.invoiceNo === invoiceNo);
    if (!invoice) {
      alert("Invalid invoice selection.");
      setLoading(false);
      return;
    }

    await submitValidation({
      invoiceNo,
      clientName: invoice.clientName,
      driverName,
      amountCollected: parseFloat(amountCollected) || 0,
    });

    setInvoiceNo('');
    setDriverName('');
    setAmountCollected('');
    setLoading(false);
    setShowSubmitForm(false);
  };

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    await verifyValidation(id, status);
  };

  return (
    <>
      <Header
        title="Delivery COD Payment Reconciliations"
        subtitle="Billing · FOMS"
        actions={
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="btn btn-primary rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={18} />
            {showSubmitForm ? 'CLOSE VIEW' : 'SUBMIT DRIVER LOG'}
          </button>
        }
      />

      <div className="dashboard-content animate-fade-in">
        {/* Stats Row */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatCard
            icon={<ShieldAlert size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="PENDING RECONCILIATIONS"
            value={formatCurrency(totalPendingAmount)}
            subtitle={`${pendingValidations.length} items awaiting audit`}
            accentColor="#FFB547"
          />
          <StatCard
            icon={<CheckSquare size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="RECONCILED COD"
            value={formatCurrency(totalReconciledAmount)}
            subtitle="Successfully approved & credited"
            accentColor="#01B574"
          />
          <StatCard
            icon={<ClipboardList size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="PROCESSED COUNT"
            value={processedValidations.length}
            subtitle={`${validations.length} total validation claims`}
            accentColor="#4318FF"
          />
        </div>

        {showSubmitForm && (
          <div className="card animate-scale-in" style={{ maxWidth: '800px', border: '1.5px solid var(--primary)' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <DollarSign size={18} color="var(--primary)" />
                Submit Driver Cash-on-Delivery Log
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Select Invoice</label>
                  <select
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">-- Choose Invoice --</option>
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.invoiceNo}>
                        {inv.invoiceNo} - {inv.clientName} (Bal: {formatCurrency(inv.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz, Cardo Dalisay"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total COD Amount Collected (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountCollected}
                    onChange={(e) => setAmountCollected(e.target.value)}
                    placeholder="e.g., 29550.00"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'LOG COLLECTION'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Approvals Queue */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <ShieldAlert size={16} color="var(--status-pending)" />
              Pending Approvals Queue
            </h3>
            <span className="text-muted text-sm font-semibold">{pendingValidations.length} pending audit</span>
          </div>

          {pendingValidations.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No driver collections pending validation.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {pendingValidations.map((val) => (
                <div
                  key={val.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1.5px solid rgba(255, 181, 71, 0.4)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          background: 'var(--status-pending-bg)',
                          color: 'var(--status-pending)',
                          fontWeight: '800',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        PENDING AUDIT
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                        <Calendar size={13} />
                        {formatDate(val.dateSubmitted)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Invoice: {val.invoiceNo}
                      </h4>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>
                        {val.clientName}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        <User size={14} />
                        <span>Driver: <strong style={{ color: 'var(--text-primary)' }}>{val.driverName}</strong></span>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        marginTop: '12px'
                      }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>COLLECTED COD</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00A99D' }}>{formatCurrency(val.amountCollected)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                    <button
                      onClick={() => handleAction(val.id, 'Approved')}
                      className="btn btn-primary"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'var(--status-active)',
                        borderColor: 'var(--status-active)',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle size={14} /> APPROVE & CREDIT
                    </button>
                    <button
                      onClick={() => handleAction(val.id, 'Rejected')}
                      className="btn btn-outline"
                      style={{
                        padding: '10px 16px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: 'var(--status-failed)',
                        borderColor: 'rgba(227, 26, 26, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      <XCircle size={14} /> REJECT CLAIM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed History Log */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <FileText size={16} color="var(--primary)" />
              Reconciliation History Log
            </h3>
            <span className="text-muted text-sm font-semibold">{processedValidations.length} processed entries</span>
          </div>

          {processedValidations.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No validations processed yet.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>INVOICE NO</th>
                  <th>CLIENT NAME</th>
                  <th>DRIVER NAME</th>
                  <th>RECONCILED AMOUNT</th>
                  <th>VERIFICATION STATUS</th>
                  <th>SUBMITTED DATE</th>
                </tr>
              </thead>
              <tbody>
                {processedValidations.map((val) => (
                  <tr key={val.id}>
                    <td>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>{val.invoiceNo}</span>
                    </td>
                    <td>
                      <span className="cell-name">{val.clientName}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <User size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">{val.driverName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-extrabold text-gray-800" style={{ color: '#1B254B' }}>
                        {formatCurrency(val.amountCollected)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="btn btn-sm inline-flex items-center gap-1"
                        style={{
                          background: val.status === 'Approved' ? 'var(--status-active-bg)' : 'var(--status-failed-bg)',
                          color: val.status === 'Approved' ? 'var(--status-active)' : 'var(--status-failed)',
                          fontWeight: '800',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '10px'
                        }}
                      >
                        {val.status === 'Approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {val.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-500">{formatDate(val.dateSubmitted)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
