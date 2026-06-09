import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login/Login';
import AccountLocked from './pages/AccountLocked/AccountLocked';

// ─── Shared / Auth ───────────────────────────────────────────────
import Dashboard from './pages/Dashboard/Dashboard';

// ─── Bookkeeper: Payment Collection ──────────────────────────────
import BookkeeperDashboard from './pages/Dashboard/BookkeeperDashboard';
import Payments from './pages/Payments/Payments';
import PaymentForm from './pages/Payments/PaymentForm';
import OfficialReceipts from './pages/Payments/OfficialReceipts';
import OutstandingBalances from './pages/Balances/OutstandingBalances';
import Adjustments from './pages/Adjustments/Adjustments';
import DeliveryValidation from './pages/Validations/DeliveryValidation';
import SupportDesk from './pages/Support/SupportDesk';

// ─── Accountant: Finance Monitoring ──────────────────────────────
import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import ClientForm from './pages/Clients/ClientForm';
import ShipmentPricing from './pages/Pricing/ShipmentPricing';
import Invoices from './pages/Invoices/Invoices';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';
import InvoiceForm from './pages/Invoices/InvoiceForm';
import InvoiceHistoryLog from './pages/Invoices/InvoiceHistoryLog';
import AgingReport from './pages/Aging/AgingReport';
import OverdueAccounts from './pages/Overdue/OverdueAccounts';
import CashFlow from './pages/CashFlow/CashFlow';
import GeneralLedger from './pages/Accounting/GeneralLedger';
import ChartOfAccounts from './pages/Accounting/ChartOfAccounts';
import AdjustmentLogs from './pages/Accounting/AdjustmentLogs';
import Reports from './pages/Report/Reports';

// ─── Payroll Officer ─────────────────────────────────────────────
import PayrollManagement from './pages/Payroll/PayrollManagement';

import { useAuth } from './context/AuthContext';

// Role redirect helper — each role goes to their first module on root
function RootRedirect() {
  const { user } = useAuth();
  if (user?.role === 'Bookkeeper') {
    return <Navigate to="/bookkeeper-dashboard" replace />;
  }
  if (user?.role === 'Payroll Officer') {
    return <Navigate to="/payroll" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/account-locked" element={<AccountLocked />} />

        {/* ── BOOKKEEPER routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['Bookkeeper']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/bookkeeper-dashboard" element={<BookkeeperDashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/new" element={<PaymentForm />} />
            <Route path="/official-receipts" element={<OfficialReceipts />} />
            <Route path="/outstanding-balances" element={<OutstandingBalances />} />
            <Route path="/adjustments" element={<Adjustments />} />
            <Route path="/validations" element={<DeliveryValidation />} />
            <Route path="/support" element={<SupportDesk />} />
          </Route>
        </Route>

        {/* ── ACCOUNTANT routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['Accountant']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/pricing" element={<ShipmentPricing />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/new" element={<InvoiceForm />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            
            <Route path="/invoices/:id/history" element={<InvoiceHistoryLog />} />
            <Route path="/aging" element={<AgingReport />} />
            <Route path="/overdue" element={<OverdueAccounts />} />
            <Route path="/cash-flow" element={<CashFlow />} />
            <Route path="/general-ledger" element={<GeneralLedger />} />
            <Route path="/chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="/adjustment-logs" element={<AdjustmentLogs />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* ── PAYROLL OFFICER routes ── */}
        <Route element={<ProtectedRoute allowedRoles={['Payroll Officer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/payroll" element={<PayrollManagement />} />
          </Route>
        </Route>

        {/* Root redirect — goes to first meaningful page per role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Catch-all — send to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
