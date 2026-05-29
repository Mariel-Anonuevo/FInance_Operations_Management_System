import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { TrendingUp, ArrowDownRight, ArrowUpRight, Building2, Landmark, Plus, HelpCircle, FileText, Calendar, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency, formatDate, currencyTooltipFormatter } from '../../utils/finance';

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
  const totalInflow = useMemo(() => 
    cashFlowEntries.filter((e) => e.type === 'Inflow').reduce((sum, e) => sum + e.amount, 0),
    [cashFlowEntries]
  );

  const totalOutflow = useMemo(() => 
    cashFlowEntries.filter((e) => e.type === 'Outflow').reduce((sum, e) => sum + e.amount, 0),
    [cashFlowEntries]
  );

  const netCashFlow = totalInflow - totalOutflow;

  // Aggregate daily data for Recharts Trend
  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; inflow: number; outflow: number }> = {};
    
    // Sort entries to process chronologically
    const sorted = [...cashFlowEntries].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach(entry => {
      const dateStr = entry.date;
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, inflow: 0, outflow: 0 };
      }
      if (entry.type === 'Inflow') {
        dailyData[dateStr].inflow += entry.amount;
      } else {
        dailyData[dateStr].outflow += entry.amount;
      }
    });

    return Object.values(dailyData);
  }, [cashFlowEntries]);

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
    <>
      <Header
        title="Cash Flow & Bank Reconciliations"
        subtitle="Operations · FOMS"
        actions={
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="btn btn-primary rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={18} />
            {showLogForm ? 'CLOSE VIEW' : 'LOG TRANSACTION'}
          </button>
        }
      />

      <div className="dashboard-content animate-fade-in">
        {/* Totals cards */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatCard
            icon={<ArrowUpRight size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="TOTAL INFLOW"
            value={formatCurrency(totalInflow)}
            subtitle="Received revenue/collections"
            accentColor="#01B574"
          />
          <StatCard
            icon={<ArrowDownRight size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="TOTAL OUTFLOW"
            value={formatCurrency(totalOutflow)}
            subtitle="Expenses and operational costs"
            accentColor="#E31A1A"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            iconColor={netCashFlow >= 0 ? 'var(--primary)' : 'var(--status-failed)'}
            iconBg={netCashFlow >= 0 ? 'var(--status-transit-bg)' : 'var(--status-failed-bg)'}
            label="NET POSITION"
            value={formatCurrency(netCashFlow)}
            subtitle="Current net liquidity"
            accentColor={netCashFlow >= 0 ? '#00A99D' : '#E31A1A'}
          />
        </div>

        {showLogForm && (
          <div className="card animate-scale-in" style={{ maxWidth: '800px', border: '1.5px solid var(--primary)' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <DollarSign size={18} color="var(--primary)" />
                Log Cash Inflow / Outflow
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="form-input"
                  >
                    <option value="Inflow">Inflow (Cash coming in)</option>
                    <option value="Outflow">Outflow (Cash spent)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Collection, Fuel, Maintenance, Payroll"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (PHP)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000.00"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reference No</label>
                  <input
                    type="text"
                    required
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. OR-88120, EXP-3021"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write transaction detail memo..."
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
                  {loading ? 'Saving...' : 'SAVE TRANSACTION'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Charts & Bank Accounts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--gap)' }} className="dashboard-grid">
          {/* Cash Flow Trend Chart */}
          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-2">
                <TrendingUp size={16} color="var(--primary)" />
                Liquidity & Flow Trends
              </h3>
              <span className="system-all-operational text-sm" style={{ background: 'var(--status-transit-bg)', color: 'var(--primary)' }}>
                Cash Inflow vs Outflow
              </span>
            </div>
            <div style={{ width: '100%', height: '260px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-active)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--status-active)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-failed)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--status-failed)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => formatDate(v)}
                    tick={{ fontSize: 11, fill: '#A3AED0' }} 
                  />
                  <YAxis tickFormatter={(v) => `₱${v}`} tick={{ fontSize: 10, fill: '#A3AED0' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={currencyTooltipFormatter} labelFormatter={(l) => formatDate(l)} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="inflow" name="Inflow" stroke="var(--status-active)" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={2} />
                  <Area type="monotone" dataKey="outflow" name="Outflow" stroke="var(--status-failed)" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* External Accounts */}
          <div className="card flex flex-col gap-md">
            <div className="card-header">
              <h3 className="flex items-center gap-2">
                <Building2 size={16} color="var(--primary)" />
                External Accounts
              </h3>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              overflowY: 'auto',
              maxHeight: '320px',
              paddingRight: '6px'
            }}>
              {bankBalances.length === 0 ? (
                <p className="text-muted text-sm text-center py-6">No bank accounts monitored.</p>
              ) : (
                bankBalances.map((bank) => (
                  <div
                    key={bank.id}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'center',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1.5px solid var(--border)',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      padding: '10px',
                      background: '#ffffff',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      color: '#00A99D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)'
                    }}>
                      <Landmark size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{bank.bankName}</h4>
                      <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: 0 }}>Acc: {bank.accountNumber}</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
                        {formatCurrency(bank.currentBalance)}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        <span>Reconciled</span>
                        <span>{bank.lastReconciled}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cash Flow Ledger Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <FileText size={16} color="var(--primary)" />
              Cash Flow Ledger
            </h3>
            <span className="text-muted text-sm font-semibold">{cashFlowEntries.length} total entries</span>
          </div>

          {cashFlowEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
              <HelpCircle size={40} className="text-gray-300" />
              <p>No cash flow logs found.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>CATEGORY</th>
                  <th>REFERENCE</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT (PHP)</th>
                </tr>
              </thead>
              <tbody>
                {cashFlowEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-semibold" style={{ color: '#1B254B' }}>{formatDate(entry.date)}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="btn btn-sm"
                        style={{
                          background: entry.type === 'Inflow' ? 'var(--status-active-bg)' : 'var(--status-failed-bg)',
                          color: entry.type === 'Inflow' ? 'var(--status-active)' : 'var(--status-failed)',
                          fontWeight: '800',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '10px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {entry.type === 'Inflow' ? '▲ ' : '▼ '}
                        {entry.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="cell-name">{entry.category}</span>
                      <div className="cell-sub text-xs text-gray-400">{entry.description}</div>
                    </td>
                    <td>
                      <span className="font-mono text-xs" style={{ color: '#8F9BBA', background: '#F4F7FE', padding: '2px 6px', borderRadius: '4px' }}>
                        {entry.referenceNo}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span
                        className="font-extrabold"
                        style={{
                          color: entry.type === 'Inflow' ? 'var(--status-active)' : 'var(--status-failed)',
                          fontSize: '0.98rem'
                        }}
                      >
                        {entry.type === 'Inflow' ? '+' : '-'} {formatCurrency(entry.amount)}
                      </span>
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
