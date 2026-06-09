import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useData } from '../../context/DataContext';
import { downloadCSV, formatCurrency, formatDate } from '../../utils/finance';
import '../Invoices/Invoices.css';

export default function OfficialReceipts() {
  const { payments } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReceipts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return payments.filter((p) => {
      return (
        !term ||
        p.orNumber.toLowerCase().includes(term) ||
        p.invoiceNo.toLowerCase().includes(term) ||
        p.clientName.toLowerCase().includes(term) ||
        (p.referenceNumber || '').toLowerCase().includes(term)
      );
    });
  }, [payments, searchTerm]);

  const totalCollected = useMemo(
    () => filteredReceipts.reduce((sum, p) => sum + p.amount, 0),
    [filteredReceipts],
  );

  const handleExport = () => {
    const rows = [
      ['OR Number', 'Invoice No.', 'Client', 'Amount', 'Method', 'Date', 'Reference', 'Recorded By'],
      ...filteredReceipts.map((p) => [
        p.orNumber,
        p.invoiceNo,
        p.clientName,
        formatCurrency(p.amount),
        p.paymentMethod,
        formatDate(p.paymentDate),
        p.referenceNumber || '',
        p.recordedBy,
      ]),
    ];
    downloadCSV('official-receipts', rows);
  };

  return (
    <>
      <Header
        title="Official Receipts"
        subtitle="Finance Operation Service › Official Receipts"
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
        <div className="order-stats-bar">
          <div className="order-stat">
            <span className="order-stat-value">{filteredReceipts.length}</span>
            <span className="order-stat-label">OFFICIAL RECEIPTS</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value highlight-green">{formatCurrency(totalCollected)}</span>
            <span className="order-stat-label">TOTAL AMOUNT</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{payments.filter((p) => p.paymentMethod === 'Bank Transfer').length}</span>
            <span className="order-stat-label">BANK TRANSFERS</span>
          </div>
          <div className="order-stat-divider" />
          <div className="order-stat">
            <span className="order-stat-value">{payments.filter((p) => p.paymentMethod === 'GCash').length}</span>
            <span className="order-stat-label">GCASH RECEIPTS</span>
          </div>
        </div>

        <div className="orders-filter-bar">
          <div className="filter-search">
            <Search size={16} className="filter-search-icon" />
            <input
              type="text"
              placeholder="Search by OR number, invoice, client, or reference..."
              className="filter-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>OR NUMBER</th>
                <th>INVOICE NO.</th>
                <th>CLIENT</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
                <th>DATE</th>
                <th>REFERENCE</th>
                <th>RECORDED BY</th>
              </tr>
            </thead>
            <tbody>
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No official receipts found.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id}>
                    <td>
                      <span className="waybill-link">{receipt.orNumber}</span>
                      {receipt.referenceNumber && <div className="cell-sub">Ref: {receipt.referenceNumber}</div>}
                    </td>
                    <td>{receipt.invoiceNo}</td>
                    <td>
                      <span className="cell-name">{receipt.clientName}</span>
                    </td>
                    <td className="amount-cell">{formatCurrency(receipt.amount)}</td>
                    <td>{receipt.paymentMethod}</td>
                    <td>{formatDate(receipt.paymentDate)}</td>
                    <td className="cell-sub">{receipt.referenceNumber || '—'}</td>
                    <td className="cell-sub">{receipt.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="table-pagination">
            <span className="pagination-info">Showing {filteredReceipts.length} receipts</span>
          </div>
        </div>
      </div>
    </>
  );
}
