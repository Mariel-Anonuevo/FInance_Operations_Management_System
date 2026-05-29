import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Fuel, Plus, FileText, AlertCircle } from 'lucide-react';

export default function Expenses() {
  const { expenses, addExpense } = useData();

  const [showLogForm, setShowLogForm] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [expenseType, setExpenseType] = useState('Fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate sum of fleet operational costs
  const totalFleetExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addExpense({
      plateNumber,
      driverName,
      expenseType: expenseType as 'Fuel' | 'Toll' | 'Maintenance' | 'Allowance',
      amount: parseFloat(amount) || 0,
      description,
    });

    setPlateNumber('');
    setDriverName('');
    setAmount('');
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
            Transportation Expense Monitoring
          </h1>
          <p className="text-gray-500 mt-1">
            Track and reconcile logistics fuel expenditures, driver allowances, toll ways, and vehicle repairs.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="btn btn-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          {showLogForm ? 'CLOSE VIEW' : 'LOG FLEET EXPENSE'}
        </button>
      </div>

      {/* Overview Card */}
      <div className="bg-[#1B254B] text-white rounded-2xl p-6 shadow-lg shadow-[#1B254B]/15 flex items-center justify-between max-w-xl">
        <div className="space-y-1">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Logistics Expenditure</span>
          <h3 className="text-3xl font-extrabold text-[#00A99D]">
            PHP {totalFleetExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-[#00A99D]">
          <Fuel size={28} />
        </div>
      </div>

      {showLogForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl animate-scaleUp space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            Log Logistics Expense
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Vehicle Plate Number</label>
                <input
                  type="text"
                  required
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. NBC-8821, WEX-102"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Expense Type</label>
                <select
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="Fuel">Fuel (Diesel / Gasoline)</option>
                  <option value="Toll">Toll Fees (Expressway)</option>
                  <option value="Maintenance">Maintenance (Repairs / Parts)</option>
                  <option value="Allowance">Allowance (Food / Lodging)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Expense Cost (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500.00"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Detail Description</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write specific description details (e.g., Oil change, Shell station diesel)..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Logging...' : 'LOG COST'}
            </button>
          </form>
        </div>
      )}

      {/* Expense list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
          <FileText className="text-[#00A99D] w-5 h-5" />
          Fleet Expenses Log
        </h2>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
            <AlertCircle size={40} className="text-gray-300" />
            <p>No operational fleet expenses logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle Plate</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Expense Type</th>
                  <th className="py-3 px-4">Cost (PHP)</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-gray-500 font-semibold">{exp.date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800">{exp.plateNumber}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{exp.driverName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          exp.expenseType === 'Fuel'
                            ? 'bg-amber-50 text-amber-600'
                            : exp.expenseType === 'Maintenance'
                            ? 'bg-rose-50 text-[#E31A1A]'
                            : exp.expenseType === 'Toll'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {exp.expenseType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gray-900">
                      PHP {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-gray-500 max-w-sm truncate" title={exp.description}>
                      {exp.description}
                    </td>
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
