import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, DollarSign, Calendar, User, FileText, CheckCircle2, ShieldCheck, ClipboardList, HelpCircle, FilePlus2 } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency, formatDate } from '../../utils/finance';

export default function Adjustments() {
  const { adjustments, invoices, addAdjustment, employees } = useData();

  const [showForm, setShowForm] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'Credit' | 'Debit' | 'Write-Off'>('Credit');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [approvedBy, setApprovedBy] = useState('Crystalyn Joyce C. Fajardo');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const activeInvoices = useMemo(() => 
    invoices.filter((i) => i.balance > 0 && !i.archived),
    [invoices]
  );

  // Compute stats
  const totalCreditsApplied = useMemo(() => 
    adjustments.filter(a => a.adjustmentType === 'Credit').reduce((sum, a) => sum + a.amount, 0),
    [adjustments]
  );

  const totalWriteOffs = useMemo(() => 
    adjustments.filter(a => a.adjustmentType === 'Write-Off').reduce((sum, a) => sum + a.amount, 0),
    [adjustments]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const targetInvoice = invoices.find((i) => i.invoiceNo === invoiceNo);
    const amt = parseFloat(amount) || 0;

    if (!targetInvoice) {
      alert("Please select a valid invoice.");
      setLoading(false);
      return;
    }

    if ((adjustmentType === 'Credit' || adjustmentType === 'Write-Off') && amt > targetInvoice.balance) {
      alert(`Adjustment amount cannot exceed the current outstanding invoice balance of PHP ${targetInvoice.balance.toLocaleString()}`);
      setLoading(false);
      return;
    }

    await addAdjustment({
      invoiceNo,
      adjustmentType,
      amount: amt,
      reason,
      approvedBy,
    });

    setSuccessMsg(`Successfully logged a ${adjustmentType} adjustment for invoice ${invoiceNo}.`);
    setInvoiceNo('');
    setAmount('');
    setReason('');
    setLoading(false);
    setTimeout(() => {
      setShowForm(false);
      setSuccessMsg('');
    }, 2500);
  };

  return (
    <>
      <Header
        title="Billing Adjustments & Credit Memos"
        subtitle="Billing · FOMS"
        actions={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={18} />
            {showForm ? 'CLOSE VIEW' : 'NEW ADJUSTMENT'}
          </button>
        }
      />

      <div className="dashboard-content animate-fade-in">
        {/* Stats Row */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatCard
            icon={<ShieldCheck size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="CREDITS APPLIED"
            value={formatCurrency(totalCreditsApplied)}
            subtitle="Reduces open client liabilities"
            accentColor="#01B574"
          />
          <StatCard
            icon={<DollarSign size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="WRITE-OFFS SETTLED"
            value={formatCurrency(totalWriteOffs)}
            subtitle="Bad debt balance adjustments"
            accentColor="#E31A1A"
          />
          <StatCard
            icon={<ClipboardList size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="LOGGED ADJUSTMENTS"
            value={adjustments.length}
            subtitle="Total credit/debit adjustments"
            accentColor="#00A99D"
          />
        </div>

        {showForm && (
          <div className="card animate-scale-in" style={{ maxWidth: '800px', border: '1.5px solid var(--primary)' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <FilePlus2 size={18} color="var(--primary)" />
                Log New Billing Adjustment
              </h3>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2 mb-4">
                <CheckCircle2 size={16} />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Select Invoice (Outstanding Balance &gt; 0)</label>
                  <select
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">-- Choose Invoice --</option>
                    {activeInvoices.map((inv) => (
                      <option key={inv.id} value={inv.invoiceNo}>
                        {inv.invoiceNo} - {inv.clientName} (Bal: {formatCurrency(inv.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'Credit' | 'Debit' | 'Write-Off')}
                    className="form-input"
                  >
                    <option value="Credit">Credit (Reduces Balance)</option>
                    <option value="Debit">Debit (Increases Balance)</option>
                    <option value="Write-Off">Write-Off (Bad Debt settlement)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Adjustment Amount (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 1500.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Approved By (Authorizing Officer)</label>
                  <select
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="form-input"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adjustment Reason</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Write detailed audit justification for this account balance memo..."
                  className="form-input"
                />
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Processing...' : 'APPLY ADJUSTMENT'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Adjustments History list */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <FileText size={16} color="var(--primary)" />
              Adjustments Audit Log History
            </h3>
            <span className="text-muted text-sm font-semibold">{adjustments.length} total logs</span>
          </div>

          {adjustments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
              <HelpCircle size={40} className="text-gray-300" />
              <p>No billing adjustments recorded.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ADJUSTMENT ID</th>
                  <th>INVOICE NO</th>
                  <th>ADJUSTMENT TYPE</th>
                  <th>AMOUNT (PHP)</th>
                  <th>AUTHORIZED BY</th>
                  <th>DATE APPROVED</th>
                </tr>
              </thead>
              <tbody>
                {adjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td>
                      <span className="font-mono text-xs font-bold text-gray-500" style={{ background: '#F4F7FE', padding: '3px 8px', borderRadius: '4px' }}>
                        {adj.id.substring(0, 8).toUpperCase()}...
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-gray-800" style={{ color: 'var(--primary)' }}>
                        {adj.invoiceNo}
                      </span>
                    </td>
                    <td>
                      <span
                        className="btn btn-sm"
                        style={{
                          background: adj.adjustmentType === 'Credit' ? 'rgba(67, 24, 255, 0.1)'
                                    : adj.adjustmentType === 'Debit' ? 'rgba(255, 181, 71, 0.1)'
                                    : 'rgba(227, 26, 26, 0.1)',
                          color: adj.adjustmentType === 'Credit' ? 'var(--status-new)'
                               : adj.adjustmentType === 'Debit' ? 'var(--status-pending)'
                               : 'var(--status-failed)',
                          fontWeight: '800',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '10px'
                        }}
                      >
                        {adj.adjustmentType.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: '800', color: '#1B254B' }}>
                      {formatCurrency(adj.amount)}
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <User size={14} className="text-gray-400" />
                        <div>
                          <span className="cell-name">{adj.approvedBy}</span>
                          <div className="cell-sub text-xs text-gray-400 max-w-xs truncate" title={adj.reason}>{adj.reason}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-500">{formatDate(adj.dateApproved)}</span>
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
