import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldAlert, CheckCircle, XCircle, Plus, FileText } from 'lucide-react';

export default function DeliveryValidation() {
  const { validations, invoices, submitValidation, verifyValidation } = useData();

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [amountCollected, setAmountCollected] = useState('');
  const [loading, setLoading] = useState(false);

  // Filters
  const pendingInvoices = invoices.filter((i) => i.balance > 0 && i.paymentStatus !== 'Paid');
  const pendingValidations = validations.filter((v) => v.status === 'Pending');
  const processedValidations = validations.filter((v) => v.status !== 'Pending');

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
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Delivery COD Payment Reconciliations
          </h1>
          <p className="text-gray-500 mt-1">
            Validate Cash-on-Delivery (COD) collections submitted by delivery drivers against open invoices.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="btn btn-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          {showSubmitForm ? 'CLOSE VIEW' : 'SUBMIT DRIVER LOG'}
        </button>
      </div>

      {showSubmitForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl animate-scaleUp space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            Log Driver Collection Validation
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Select Invoice</label>
                <select
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="">-- Choose Invoice --</option>
                  {pendingInvoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} - {inv.clientName} (Bal: PHP {inv.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Driver Name</label>
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz, Cardo Dalisay"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-gray-600">Total COD Amount Collected (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(e.target.value)}
                  placeholder="e.g., 29550.00"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Submitting...' : 'LOG COLLECTION'}
            </button>
          </form>
        </div>
      )}

      {/* Pending Validation Queue */}
      <div className="bg-white rounded-2xl border border-[#00A99D]/20 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
          <ShieldAlert className="text-[#00A99D] w-5 h-5" />
          Pending Approvals Queue
        </h2>

        {pendingValidations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No driver collections pending validation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingValidations.map((val) => (
              <div key={val.id} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs font-extrabold rounded-md uppercase border border-yellow-100">
                      Pending Reconciliation
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{val.dateSubmitted}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#1B254B]">Invoice: {val.invoiceNo}</h4>
                    <p className="text-sm text-gray-600 font-semibold">{val.clientName}</p>
                    <p className="text-xs text-gray-500">Collected By: <span className="font-bold">{val.driverName}</span></p>
                    <p className="text-lg font-black text-[#00A99D] pt-1">
                      PHP {val.amountCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleAction(val.id, 'Approved')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle size={14} /> APPROVE & CREDIT
                  </button>
                  <button
                    onClick={() => handleAction(val.id, 'Rejected')}
                    className="py-2.5 bg-rose-50 hover:bg-rose-100 text-[#E31A1A] font-bold rounded-lg text-xs flex items-center justify-center gap-1 border border-rose-100 transition-all cursor-pointer"
                  >
                    <XCircle size={14} /> REJECT CLAIM
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History log list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
          <FileText className="text-[#00A99D] w-5 h-5" />
          Processed reconciliations
        </h2>

        {processedValidations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No validations processed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Reconciled Amount</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {processedValidations.map((val) => (
                  <tr key={val.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-800">{val.invoiceNo}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{val.clientName}</td>
                    <td className="py-3 px-4 text-gray-600 font-semibold">{val.driverName}</td>
                    <td className="py-3 px-4 font-extrabold text-gray-900">
                      PHP {val.amountCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          val.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-[#E31A1A]'
                        }`}
                      >
                        {val.status === 'Approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {val.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-medium">{val.dateSubmitted}</td>
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
