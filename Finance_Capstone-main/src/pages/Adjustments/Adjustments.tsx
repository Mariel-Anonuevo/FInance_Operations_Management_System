import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus } from 'lucide-react';

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

  const activeInvoices = invoices.filter((i) => i.balance > 0 && !i.archived);

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
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Billing Adjustments & Credit Memos
          </h1>
          <p className="text-gray-500 mt-1">
            Apply write-offs, credit adjustments, and debit memo increases to client account balances.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          {showForm ? 'CLOSE VIEW' : 'NEW ADJUSTMENT'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl animate-scaleUp space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            Log New Adjustments
          </h2>

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Select Invoice (Balance &gt; 0)</label>
                <select
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="">-- Choose Invoice --</option>
                  {activeInvoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} - {inv.clientName} (Bal: PHP {inv.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as 'Credit' | 'Debit' | 'Write-Off')}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="Credit">Credit (Reduces Balance)</option>
                  <option value="Debit">Debit (Increases Balance)</option>
                  <option value="Write-Off">Write-Off (Bad Debt settlement)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Adjustment Amount (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500.00"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Approved By (Authorizer)</label>
                <select
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Adjustment Reason</label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Write description/memo details for audit reference..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Processing...' : 'APPLY ADJUSTMENT'}
            </button>
          </form>
        </div>
      )}

      {/* Adjustments History list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
          Adjustments Log history
        </h2>

        {adjustments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
            <p>No billing adjustments recorded.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                  <th className="py-3 px-4">Adjustment ID</th>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Adjustment Type</th>
                  <th className="py-3 px-4">Amount (PHP)</th>
                  <th className="py-3 px-4">Authorized By</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-gray-500">{adj.id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {adj.invoiceNo}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          adj.adjustmentType === 'Credit'
                            ? 'bg-blue-50 text-blue-600'
                            : adj.adjustmentType === 'Debit'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gray-900">
                      PHP {adj.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{adj.approvedBy}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-gray-500" title={adj.reason}>
                      {adj.reason}
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-semibold">{adj.dateApproved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
