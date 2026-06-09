import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  Receipt,
  AlertTriangle,
  Settings2,
  CheckSquare,
  HelpCircle,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/finance';
import './BookkeeperDashboard.css';

/* ─── Helper: status badge ─── */
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Paid:            'bk-badge bk-badge-green',
    'Partially Paid':'bk-badge bk-badge-yellow',
    Unpaid:          'bk-badge bk-badge-red',
    Overdue:         'bk-badge bk-badge-red',
    Approved:        'bk-badge bk-badge-green',
    Rejected:        'bk-badge bk-badge-red',
    Pending:         'bk-badge bk-badge-yellow',
    Open:            'bk-badge bk-badge-blue',
    'In-Progress':   'bk-badge bk-badge-orange',
    Resolved:        'bk-badge bk-badge-gray',
    Cash:            'bk-badge bk-badge-green',
    Check:           'bk-badge bk-badge-teal',
    'Bank Transfer': 'bk-badge bk-badge-blue',
    GCash:           'bk-badge bk-badge-teal',
    Credit:          'bk-badge bk-badge-green',
    Debit:           'bk-badge bk-badge-red',
    'Write-Off':     'bk-badge bk-badge-orange',
  };
  return <span className={map[status] ?? 'bk-badge bk-badge-gray'}>{status}</span>;
}

export default function BookkeeperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { payments, invoices, tickets, validations, adjustments } = useData();

  const [paymentSearch, setPaymentSearch] = useState('');
  const [ticketSearch, setTicketSearch] = useState('');
  const [validationSearch, setValidationSearch] = useState('');

  /* ─── KPIs ─── */
  const totalCollected = useMemo(() =>
    payments.reduce((s, p) => s + p.amount, 0), [payments]);

  const outstandingTotal = useMemo(() =>
    invoices.filter(i => !i.archived).reduce((s, i) => s + i.balance, 0), [invoices]);

  const unpaidInvoices = useMemo(() =>
    invoices.filter(i => i.paymentStatus !== 'Paid' && !i.archived).length, [invoices]);

  const openTickets = useMemo(() =>
    tickets.filter(t => t.status === 'Open' || t.status === 'In-Progress').length, [tickets]);

  const pendingValidations = useMemo(() =>
    validations.filter(v => v.status === 'Pending').length, [validations]);

  const totalAdjustments = adjustments.length;

  /* ─── Collection this month ─── */
  const collectedThisMonth = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return payments.filter(p => p.paymentDate.startsWith(month)).reduce((s, p) => s + p.amount, 0);
  }, [payments]);

  /* ─── Recent Payment Collection ─── */
  const recentPayments = useMemo(() =>
    [...payments]
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
      .slice(0, 8),
    [payments]);

  const filteredPayments = useMemo(() =>
    recentPayments.filter(p =>
      p.orNumber.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.clientName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.invoiceNo.toLowerCase().includes(paymentSearch.toLowerCase())
    ), [recentPayments, paymentSearch]);

  /* ─── Outstanding Balances ─── */
  const outstandingInvoices = useMemo(() =>
    [...invoices]
      .filter(i => i.balance > 0 && !i.archived)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 6),
    [invoices]);

  /* ─── Adjustments ─── */
  const recentAdjustments = useMemo(() =>
    [...adjustments]
      .sort((a, b) => b.dateApproved.localeCompare(a.dateApproved))
      .slice(0, 5),
    [adjustments]);

  /* ─── Validations ─── */
  const filteredValidations = useMemo(() =>
    [...validations]
      .sort((a, b) => b.dateSubmitted.localeCompare(a.dateSubmitted))
      .filter(v =>
        v.invoiceNo.toLowerCase().includes(validationSearch.toLowerCase()) ||
        v.clientName.toLowerCase().includes(validationSearch.toLowerCase()) ||
        v.driverName.toLowerCase().includes(validationSearch.toLowerCase())
      )
      .slice(0, 6),
    [validations, validationSearch]);

  /* ─── Tickets ─── */
  const filteredTickets = useMemo(() =>
    [...tickets]
      .sort((a, b) => b.dateCreated.localeCompare(a.dateCreated))
      .filter(t =>
        t.clientName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        t.ticketSubject.toLowerCase().includes(ticketSearch.toLowerCase())
      )
      .slice(0, 6),
    [tickets, ticketSearch]);

  /* ─── Official Receipts (from payments) ─── */
  const recentReceipts = useMemo(() =>
    [...payments]
      .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
      .slice(0, 5),
    [payments]);

  /* ─── Outstanding by status breakdown ─── */
  const overdueCount = invoices.filter(i => i.paymentStatus === 'Overdue' && !i.archived).length;
  const partialCount = invoices.filter(i => i.paymentStatus === 'Partially Paid' && !i.archived).length;

  return (
    <>
      <Header
        title="Bookkeeper Dashboard"
        subtitle={`${user?.role ?? 'Bookkeeper'} · Finance Operation Service`}
        date={new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="bk-dashboard">

        {/* ─── KPI Cards ─── */}
        <div className="bk-stats-row">
          <StatCard
            icon={<CircleDollarSign size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL COLLECTED"
            value={formatCurrency(totalCollected)}
            subtitle={`${formatCurrency(collectedThisMonth)} this month`}
            subtitleColor="var(--status-active)"
            accentColor="#00A99D"
          />
          <StatCard
            icon={<AlertTriangle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OUTSTANDING BALANCES"
            value={formatCurrency(outstandingTotal)}
            subtitle={`${unpaidInvoices} unpaid invoices`}
            subtitleColor="var(--status-failed)"
            accentColor="#E31A1A"
          />
          <StatCard
            icon={<HelpCircle size={18} />}
            iconColor="#4318FF"
            iconBg="var(--status-new-bg)"
            label="OPEN TICKETS"
            value={openTickets}
            subtitle="Disputes & concerns"
            accentColor="#4318FF"
          />
          <StatCard
            icon={<CheckSquare size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="PENDING VALIDATIONS"
            value={pendingValidations}
            subtitle="Awaiting review"
            subtitleColor="var(--status-pending)"
            accentColor="#FFB547"
          />
        </div>

        {/* ─── Quick Actions + Outstanding Summary ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--gap)' }}>

          {/* Quick Actions */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'var(--status-transit-bg)' }}>
                  <TrendingUp size={16} color="var(--primary)" />
                </div>
                Quick Actions
              </div>
            </div>
            <div className="bk-quick-actions">
              <button className="bk-quick-btn" onClick={() => navigate('/payments/new')} style={{ background: '#1B254B', border: 'none' }}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <Plus size={20} color="#fff" />
                </div>
                <span style={{ color: '#fff' }}>Record Payment</span>
              </button>
              <button className="bk-quick-btn" onClick={() => navigate('/official-receipts')}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(0,169,157,0.1)' }}>
                  <Receipt size={20} color="var(--primary)" />
                </div>
                <span>Issue Receipt</span>
              </button>
              <button className="bk-quick-btn" onClick={() => navigate('/adjustments')}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(255,181,71,0.1)' }}>
                  <Settings2 size={20} color="#E09A00" />
                </div>
                <span>Adjustment</span>
              </button>
              <button className="bk-quick-btn" onClick={() => navigate('/support')}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(67,24,255,0.1)' }}>
                  <HelpCircle size={20} color="#4318FF" />
                </div>
                <span>New Ticket</span>
              </button>
              <button className="bk-quick-btn" onClick={() => navigate('/validations')}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(1,181,116,0.1)' }}>
                  <CheckSquare size={20} color="var(--status-active)" />
                </div>
                <span>Validate COD</span>
              </button>
              <button className="bk-quick-btn" onClick={() => navigate('/outstanding-balances')}>
                <div className="bk-quick-btn-icon" style={{ background: 'rgba(227,26,26,0.1)' }}>
                  <AlertTriangle size={20} color="var(--status-failed)" />
                </div>
                <span>View Balances</span>
              </button>
            </div>
          </div>

          {/* Outstanding Balance Snapshot */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'rgba(227,26,26,0.1)' }}>
                  <AlertTriangle size={16} color="var(--status-failed)" />
                </div>
                Outstanding Balances — Top Accounts
              </div>
              <button className="bk-view-all" onClick={() => navigate('/outstanding-balances')}>View All →</button>
            </div>

            {/* Balance breakdown pills */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(227,26,26,0.08)', borderRadius: '8px', border: '1px solid rgba(227,26,26,0.2)' }}>
                <XCircle size={13} color="var(--status-failed)" />
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--status-failed)' }}>{overdueCount} Overdue</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(255,181,71,0.08)', borderRadius: '8px', border: '1px solid rgba(255,181,71,0.2)' }}>
                <Clock size={13} color="#E09A00" />
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#E09A00' }}>{partialCount} Partially Paid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(0,169,157,0.08)', borderRadius: '8px', border: '1px solid rgba(0,169,157,0.2)' }}>
                <TrendingDown size={13} color="var(--primary)" />
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--primary)' }}>{formatCurrency(outstandingTotal)} Total Due</span>
              </div>
            </div>

            <table className="bk-table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Client</th>
                  <th>Outstanding</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {outstandingInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="bk-table-empty">All invoices are settled.</td></tr>
                ) : (
                  outstandingInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td><span className="bk-cell-primary">{inv.invoiceNo}</span></td>
                      <td>{inv.clientName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--status-failed)' }}>{formatCurrency(inv.balance)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatDate(inv.dueDate)}</td>
                      <td><Badge status={inv.paymentStatus} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Payment Collection ─── */}
        <div className="bk-module-card">
          <div className="bk-section-header">
            <div className="bk-section-title">
              <div className="bk-section-icon" style={{ background: 'var(--status-transit-bg)' }}>
                <CircleDollarSign size={16} color="var(--primary)" />
              </div>
              Payment Collection
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="bk-view-all" onClick={() => navigate('/payments')}>View All →</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/payments/new')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Record Payment
              </button>
            </div>
          </div>

          <div className="bk-search-bar">
            <div className="bk-search-input-wrap">
              <Search size={15} className="bk-search-icon" />
              <input
                className="bk-search-input"
                placeholder="Search by OR number, client, or invoice..."
                value={paymentSearch}
                onChange={e => setPaymentSearch(e.target.value)}
              />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Filter size={14} /> Filter
            </button>
          </div>

          <table className="bk-table">
            <thead>
              <tr>
                <th>OR Number</th>
                <th>Client</th>
                <th>Invoice No.</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={7} className="bk-table-empty">No payment records found.</td></tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id} onClick={() => navigate('/payments')}>
                    <td>
                      <span className="bk-cell-primary">{p.orNumber}</span>
                      <div className="bk-cell-sub">{formatDate(p.paymentDate)}</div>
                    </td>
                    <td>{p.clientName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.invoiceNo}</td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(p.amount)}</td>
                    <td><Badge status={p.paymentMethod} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{formatDate(p.paymentDate)}</td>
                    <td><Badge status="Paid" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Official Receipts + Payment Adjustment ─── */}
        <div className="bk-module-grid-2">

          {/* Official Receipts */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'rgba(1,181,116,0.1)' }}>
                  <Receipt size={16} color="var(--status-active)" />
                </div>
                Official Receipts
              </div>
              <button className="bk-view-all" onClick={() => navigate('/official-receipts')}>View All →</button>
            </div>
            <table className="bk-table">
              <thead>
                <tr>
                  <th>OR Number</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReceipts.length === 0 ? (
                  <tr><td colSpan={4} className="bk-table-empty">No receipts generated.</td></tr>
                ) : (
                  recentReceipts.map(r => (
                    <tr key={r.id}>
                      <td><span className="bk-cell-primary">{r.orNumber}</span></td>
                      <td>{r.clientName}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(r.amount)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatDate(r.paymentDate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Adjustment */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'rgba(255,181,71,0.1)' }}>
                  <Settings2 size={16} color="#E09A00" />
                </div>
                Payment Adjustments
                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', background: 'rgba(255,181,71,0.12)', color: '#E09A00', borderRadius: '999px' }}>
                  {totalAdjustments} records
                </span>
              </div>
              <button className="bk-view-all" onClick={() => navigate('/adjustments')}>View All →</button>
            </div>
            <table className="bk-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="bk-table-empty">No adjustments recorded.</td>
                  </tr>
                ) : (
                  recentAdjustments.map(a => (
                    <tr key={a.id} onClick={() => navigate('/adjustments')}>
                      <td><span className="bk-cell-primary">{a.invoiceNo}</span></td>
                      <td><Badge status={a.adjustmentType} /></td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(a.amount)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{formatDate(a.dateApproved)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Delivery Payment Validation + Disputes & Tickets ─── */}
        <div className="bk-module-grid-2">

          {/* Delivery Payment Validation */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'rgba(1,181,116,0.1)' }}>
                  <CheckSquare size={16} color="var(--status-active)" />
                </div>
                Delivery Payment Validation
                {pendingValidations > 0 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(255,181,71,0.12)', color: '#E09A00', borderRadius: '999px' }}>
                    {pendingValidations} pending
                  </span>
                )}
              </div>
              <button className="bk-view-all" onClick={() => navigate('/validations')}>View All →</button>
            </div>

            <div className="bk-search-bar" style={{ marginBottom: '12px' }}>
              <div className="bk-search-input-wrap">
                <Search size={15} className="bk-search-icon" />
                <input
                  className="bk-search-input"
                  placeholder="Search invoice, client, or driver..."
                  value={validationSearch}
                  onChange={e => setValidationSearch(e.target.value)}
                />
              </div>
            </div>

            <table className="bk-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Driver</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredValidations.length === 0 ? (
                  <tr><td colSpan={6} className="bk-table-empty">No validation records found.</td></tr>
                ) : (
                  filteredValidations.map(v => (
                    <tr key={v.id} onClick={() => navigate('/validations')}>
                      <td><span className="bk-cell-primary">{v.invoiceNo}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{v.clientName}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{v.driverName}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(v.amountCollected)}</td>
                      <td>
                        <span className={
                          v.status === 'Approved' ? 'bk-badge bk-badge-green' :
                          v.status === 'Rejected' ? 'bk-badge bk-badge-red' :
                          'bk-badge bk-badge-yellow'
                        }>
                          {v.status === 'Approved' && <CheckCircle size={11} />}
                          {v.status === 'Rejected' && <XCircle size={11} />}
                          {v.status === 'Pending'  && <Clock size={11} />}
                          {v.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v.dateSubmitted.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Disputes & Tickets */}
          <div className="bk-module-card">
            <div className="bk-section-header">
              <div className="bk-section-title">
                <div className="bk-section-icon" style={{ background: 'rgba(67,24,255,0.1)' }}>
                  <HelpCircle size={16} color="#4318FF" />
                </div>
                Disputes & Tickets
                {openTickets > 0 && (
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(67,24,255,0.1)', color: '#4318FF', borderRadius: '999px' }}>
                    {openTickets} open
                  </span>
                )}
              </div>
              <button className="bk-view-all" onClick={() => navigate('/support')}>View All →</button>
            </div>

            <div className="bk-search-bar" style={{ marginBottom: '12px' }}>
              <div className="bk-search-input-wrap">
                <Search size={15} className="bk-search-icon" />
                <input
                  className="bk-search-input"
                  placeholder="Search by client or subject..."
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                />
              </div>
            </div>

            <table className="bk-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Client</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr><td colSpan={5} className="bk-table-empty">No tickets found.</td></tr>
                ) : (
                  filteredTickets.map(t => (
                    <tr key={t.id} onClick={() => navigate('/support')}>
                      <td><span className="bk-cell-primary" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{t.id}</span></td>
                      <td style={{ fontSize: '0.82rem' }}>{t.clientName}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.ticketSubject}</td>
                      <td>
                        <span className={
                          t.status === 'Open'        ? 'bk-badge bk-badge-blue' :
                          t.status === 'In-Progress' ? 'bk-badge bk-badge-orange' :
                          'bk-badge bk-badge-gray'
                        }>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.dateCreated.slice(0, 10)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
