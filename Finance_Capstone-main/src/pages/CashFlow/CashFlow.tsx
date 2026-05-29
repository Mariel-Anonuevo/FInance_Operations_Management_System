import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TrendingUp, ArrowDownRight, ArrowUpRight, Building2, Landmark, Plus, HelpCircle, FileText } from 'lucide-react';

export default function CashFlow() {
  const { cashFlowEntries, bankBalances, addCashFlowEntry } = useData();

  const [showLogForm, setShowLogForm] = useState(false);
  const [type, setType] = useState('Inflow');
  const [category, setCategory] = useState('Collection');
  const [amount, setAmount] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute totals
  const totalInflow = cashFlowEntries
    .filter((e) => e.type === 'Inflow')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOutflow = cashFlowEntries
    .filter((e) => e.type === 'Outflow')
    .reduce((sum, e) => sum + e.amount, 0);

  const netCashFlow = totalInflow - totalOutflow;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addCashFlowEntry({
      type: type as 'Inflow' | 'Outflow',
      category,
      amount: parseFloat(amount) || 0,
      referenceNo,
      description,
    });

    setAmount('');
    setReferenceNo('');
    setDescription('');
    setLoading(false);
    setShowLogForm(false);
  };

  return (
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Cash Flow & Bank Reconciliations
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor real-time cash inflows, outflows, net positions, and integrated bank account balances.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="btn btn-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          {showLogForm ? 'CLOSE FORM' : 'LOG TRANSACTION'}
        </button>
      </div>

      {/* Totals cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Cash Inflow</span>
            <h3 className="text-2xl font-extrabold text-emerald-600">
              PHP {totalInflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <ArrowUpRight size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Cash Outflow</span>
            <h3 className="text-2xl font-extrabold text-[#E31A1A]">
              PHP {totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-[#E31A1A]">
            <ArrowDownRight size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Net Cash Position</span>
            <h3 className={`text-2xl font-extrabold ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-[#E31A1A]'}`}>
              PHP {netCashFlow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-[#E31A1A]'}`}>
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {showLogForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl animate-scaleUp space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            Log Cash Transaction
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Transaction Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="Inflow">Inflow (Cash coming in)</option>
                  <option value="Outflow">Outflow (Cash spent)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Collection, Fuel, Maintenance, Payroll"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Amount (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 5000.00"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Reference No</label>
                <input
                  type="text"
                  required
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. OR-88120, EXP-3021"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write transaction detail memo..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Submitting...' : 'SAVE TRANSACTION'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Ledger */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
            <FileText className="text-[#00A99D] w-5 h-5" />
            Cash Flow Ledger
          </h2>

          {cashFlowEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
              <HelpCircle size={40} className="text-gray-300" />
              <p>No cash flow logs found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Type</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Reference</th>
                    <th className="py-3 px-2 text-right">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {cashFlowEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 text-gray-500 font-semibold">{entry.date}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-bold ${
                            entry.type === 'Inflow'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-[#E31A1A]'
                          }`}
                        >
                          {entry.type === 'Inflow' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {entry.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-gray-800">{entry.category}</td>
                      <td className="py-3 px-2 text-gray-500 font-mono text-xs">{entry.referenceNo}</td>
                      <td className={`py-3 px-2 text-right font-extrabold ${entry.type === 'Inflow' ? 'text-emerald-600' : 'text-[#E31A1A]'}`}>
                        PHP {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* External Bank Accounts Monitor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
            <Building2 className="text-[#00A99D] w-5 h-5" />
            External Accounts
          </h2>

          <div className="space-y-4">
            {bankBalances.length === 0 ? (
              <p className="text-gray-400 text-sm">No bank accounts monitored.</p>
            ) : (
              bankBalances.map((bank) => (
                <div key={bank.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 items-start hover:border-gray-200 transition-colors">
                  <div className="p-2 bg-white rounded-lg border border-gray-100 text-[#00A99D]">
                    <Landmark size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-800">{bank.bankName}</h4>
                    <p className="text-xs text-gray-500 font-mono">Acc: {bank.accountNumber}</p>
                    <p className="text-base font-extrabold text-[#1B254B]">
                      PHP {bank.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-gray-400">Reconciled: {bank.lastReconciled}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
