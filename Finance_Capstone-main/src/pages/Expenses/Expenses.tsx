import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Fuel, Plus, FileText, AlertCircle, Calendar, User, Clipboard, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency, formatDate, currencyTooltipFormatter } from '../../utils/finance';

const CATEGORY_COLORS: Record<string, string> = {
  Fuel: '#FFB547',       // Amber/Orange
  Toll: '#4318FF',       // Blue/Indigo
  Maintenance: '#E31A1A', // Red
  Allowance: '#00A99D'   // Teal
};

export default function Expenses() {
  const { expenses, addExpense } = useData();

  const [showLogForm, setShowLogForm] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [expenseType, setExpenseType] = useState('Fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute stats
  const totalFleetExpense = useMemo(() => 
    expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const averageExpense = useMemo(() => 
    expenses.length > 0 ? totalFleetExpense / expenses.length : 0,
    [expenses, totalFleetExpense]
  );

  // Recharts pie data
  const pieChartData = useMemo(() => {
    const totals: Record<string, number> = { Fuel: 0, Toll: 0, Maintenance: 0, Allowance: 0 };
    expenses.forEach(e => {
      if (totals[e.expenseType] !== undefined) {
        totals[e.expenseType] += e.amount;
      }
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#8F9BBA'
      }))
      .filter(item => item.value > 0);
  }, [expenses]);

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
    <>
      <Header
        title="Transportation Expense Monitoring"
        subtitle="Operations · FOMS"
        actions={
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="btn btn-primary rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={18} />
            {showLogForm ? 'CLOSE VIEW' : 'LOG FLEET EXPENSE'}
          </button>
        }
      />

      <div className="dashboard-content animate-fade-in">
        {/* Overview cards */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatCard
            icon={<Fuel size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="LOGISTICS EXPENDITURE"
            value={formatCurrency(totalFleetExpense)}
            subtitle="Total fleet operational cost"
            accentColor="#00A99D"
          />
          <StatCard
            icon={<TrendingDown size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="AVERAGE EXPENSE"
            value={formatCurrency(averageExpense)}
            subtitle="Per logged transaction"
            accentColor="#FFB547"
          />
          <StatCard
            icon={<Clipboard size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="LOGGED TRANSACTIONS"
            value={expenses.length}
            subtitle="Total logs in system"
            accentColor="#4318FF"
          />
        </div>

        {showLogForm && (
          <div className="card animate-scale-in" style={{ maxWidth: '800px', border: '1.5px solid var(--primary)' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <DollarSign size={18} color="var(--primary)" />
                Log Fleet operational Expense
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Plate Number</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="e.g. NBC-8821, WEX-102"
                    className="form-input"
                  />
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
                  <label className="form-label">Expense Type</label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="form-input"
                  >
                    <option value="Fuel">Fuel (Diesel / Gasoline)</option>
                    <option value="Toll">Toll Fees (Expressway)</option>
                    <option value="Maintenance">Maintenance (Repairs / Parts)</option>
                    <option value="Allowance">Allowance (Food / Lodging)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expense Cost (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 2500.00"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detail Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write specific description details (e.g., Oil change, Shell station diesel)..."
                  className="form-input"
                />
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Logging...' : 'LOG COST'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: pieChartData.length > 0 ? '2fr 1.2fr' : '1fr', gap: 'var(--gap)' }} className="dashboard-grid">
          {/* Expenses list card */}
          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-2">
                <FileText size={16} color="var(--primary)" />
                Fleet Expenses Log
              </h3>
              <span className="text-muted text-sm font-semibold">{expenses.length} total entries</span>
            </div>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
                <AlertCircle size={40} className="text-gray-300" />
                <p>No operational fleet expenses logged.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>VEHICLE PLATE</th>
                    <th>DRIVER</th>
                    <th>EXPENSE TYPE</th>
                    <th style={{ textAlign: 'right' }}>COST (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td>
                        <div className="flex items-center gap-sm">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-700">{formatDate(exp.date)}</span>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-xs font-bold" style={{ background: '#F4F7FE', padding: '3px 8px', borderRadius: '4px', color: '#1B254B' }}>
                          {exp.plateNumber}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-sm">
                          <User size={14} className="text-gray-400" />
                          <div>
                            <span className="cell-name">{exp.driverName}</span>
                            <div className="cell-sub text-xs text-gray-400">{exp.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="btn btn-sm"
                          style={{
                            background: exp.expenseType === 'Fuel' ? 'rgba(255, 181, 71, 0.1)'
                                      : exp.expenseType === 'Maintenance' ? 'rgba(227, 26, 26, 0.1)'
                                      : exp.expenseType === 'Toll' ? 'rgba(67, 24, 255, 0.1)'
                                      : 'rgba(0, 169, 157, 0.1)',
                            color: CATEGORY_COLORS[exp.expenseType] || '#8F9BBA',
                            fontWeight: '800',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px'
                          }}
                        >
                          {exp.expenseType.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="font-extrabold text-gray-800" style={{ color: '#1B254B' }}>
                          {formatCurrency(exp.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pie Chart Card */}
          {pieChartData.length > 0 && (
            <div className="card flex flex-col justify-between">
              <div className="card-header">
                <h3 className="flex items-center gap-2">
                  <TrendingDown size={16} color="var(--primary)" />
                  Operational Share
                </h3>
              </div>
              <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={currencyTooltipFormatter} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 4px' }}>
                {pieChartData.map((entry) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
                      <span className="font-semibold text-gray-600">{entry.name}</span>
                    </div>
                    <span className="font-bold ml-auto text-gray-800">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
