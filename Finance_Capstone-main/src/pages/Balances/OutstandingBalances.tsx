import { useMemo, useState } from 'react';
import { AlertTriangle, Download, Search, Receipt } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/Invoices.css';

export default function OutstandingBalances() {
  const { invoices, clients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [bucketFilter, setBucketFilter] = useState('All Buckets');

  const outstandingInvoices = useMemo(
    () => invoices.filter((inv) => inv.balance > 0 && !inv.archived),
    [invoices],
  );

  const filteredInvoices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return outstandingInvoices.filter((inv) => {
      const matchSearch =
        !term ||
        inv.invoiceNo.toLowerCase().includes(term) ||
        inv.clientName.toLowerCase().includes(term) ||
        (clients.find((c) => c.id === inv.clientId)?.clientCode || '').toLowerCase().includes(term) ||
        formatDate(inv.dueDate).toLowerCase().includes(term);

      const matchBucket =
        bucketFilter === 'All Buckets' ||
        inv.agingBucket === bucketFilter;

      return matchSearch && matchBucket;
    });
  }, [outstandingInvoices, searchTerm, bucketFilter, clients]);

  const totalBalance = useMemo(
    () => outstandingInvoices.reduce((sum, inv) => sum + inv.balance, 0),
    [outstandingInvoices],
  );

  const overdueCount = useMemo(
    () => outstandingInvoices.filter((inv) => inv.paymentStatus === 'Overdue').length,
    [outstandingInvoices],
  );

  const partialCount = useMemo(
    () => outstandingInvoices.filter((inv) => inv.paymentStatus === 'Partially Paid').length,
    [outstandingInvoices],
  );

  const handleExport = () => {
    const rows = [
      ['Invoice No.', 'Client', 'Balance', 'Due Date', 'Status', 'Bucket', 'Days Overdue'],
      ...filteredInvoices.map((inv) => [
        inv.invoiceNo,
        inv.clientName,
        formatCurrency(inv.balance),
        formatDate(inv.dueDate),
        inv.paymentStatus,
        inv.agingBucket,
        inv.daysOverdue,
      ]),
    ];
    downloadCSV('outstanding-balances', rows);
  };

  return (
    <>
      <Header
        title="Outstanding Balances"
        subtitle="Finance Operation Service › Outstanding Balances"
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        actions={
          <div className="flex gap-sm">
            <button className="btn btn-outline btn-sm" onClick={handleExport}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        }
      />

      <div className="page-content">
        <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gap)' }}>
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="#D97706"
            iconBg="rgba(245,158,11,0.1)"
            label="OUTSTANDING INVOICES"
            value={outstandingInvoices.length}
            subtitle="Active balances"
            subtitleColor="#D97706"
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL OUTSTANDING"
            value={formatCurrency(totalBalance)}
            subtitle="Client receivables"
            subtitleColor="var(--status-active)"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OVERDUE INVOICES"
            value={overdueCount}
            subtitle="Past due"
            subtitleColor="var(--status-failed)"
          />
          <StatCard
            icon={<Receipt size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="PARTIALLY PAID"
            value={partialCount}
            subtitle="Pending collection"
            subtitleColor="var(--status-pending)"
          />
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search invoices, clients, due dates..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="filter-select" value={bucketFilter} onChange={(e) => setBucketFilter(e.target.value)}>
            <option>All Buckets</option>
            <option>Current</option>
            <option>1-30</option>
            <option>31-60</option>
            <option>61-90</option>
            <option>90+</option>
          </select>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>BUCKET</th>
                <th>DAYS OVERDUE</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No outstanding balances match your query.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoiceNo}</td>
                    <td>
                      <span className="cell-name">{inv.clientName}</span>
                      <div className="cell-sub">{clients.find((c) => c.id === inv.clientId)?.clientCode || inv.clientId}</div>
                    </td>
                    <td>{formatDate(inv.dueDate)}</td>
                    <td><StatusBadge status={inv.paymentStatus} size="sm" /></td>
                    <td><StatusBadge status={inv.agingBucket} size="sm" /></td>
                    <td>{inv.daysOverdue} days</td>
                    <td className="amount-cell">{formatCurrency(inv.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-pagination">
            <span className="pagination-info">Showing {filteredInvoices.length} outstanding invoices</span>
          </div>
        </div>
      </div>
    </>
  );
}
