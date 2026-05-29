import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Employee,
  Client,
  Invoice,
  Payment,
  Notification,
  ActivityLog,
  ShipmentRate,
  PaymentAdjustment,
  CashFlowEntry,
  BankBalance,
  TransportationExpense,
  SupportTicket,
  PaymentValidation
} from '../types';
import {
  employees as initialEmployees,
  clients as initialClients,
  invoices as initialInvoices,
  payments as initialPayments,
  notifications as initialNotifications,
  activityLogs as initialLogs,
} from '../data/mockData';
import { derivePaymentStatus, getAgingBucket, getDaysOverdue } from '../utils/finance';

interface DataContextType {
  employees: Employee[];
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  shipmentRates: ShipmentRate[];
  cashFlowEntries: CashFlowEntry[];
  bankBalances: BankBalance[];
  expenses: TransportationExpense[];
  tickets: SupportTicket[];
  validations: PaymentValidation[];
  adjustments: PaymentAdjustment[];

  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addClient: (client: Client) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => Promise<void>;

  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => Promise<void>;
  archiveInvoice: (id: string, archived?: boolean) => Promise<void>;

  recordPayment: (payment: Payment) => Promise<void>;
  deletePayment: (id: string) => void;

  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addActivityLog: (log: ActivityLog) => Promise<void>;

  // New features
  addAdjustment: (adjustment: Omit<PaymentAdjustment, 'id' | 'dateApproved'>) => Promise<void>;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id' | 'date'>) => Promise<void>;
  addExpense: (expense: Omit<TransportationExpense, 'id' | 'date'>) => Promise<void>;
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'dateCreated' | 'lastUpdated'>) => Promise<void>;
  updateTicketStatus: (id: string, status: 'Open' | 'In-Progress' | 'Resolved') => Promise<void>;
  submitValidation: (val: Omit<PaymentValidation, 'id' | 'status' | 'dateSubmitted'>) => Promise<void>;
  verifyValidation: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  employees: 'arcms_employees',
  clients: 'arcms_clients',
  invoices: 'arcms_invoices',
  payments: 'arcms_payments',
  notifications: 'arcms_notifications',
  logs: 'arcms_logs',
  rates: 'arcms_rates',
  cashflow: 'arcms_cashflow',
  balances: 'arcms_balances',
  expenses: 'arcms_expenses',
  tickets: 'arcms_tickets',
  validations: 'arcms_validations',
  adjustments: 'arcms_adjustments',
};

const LEGACY_KEYS = [
  'speedex_orders',
  'speedex_logs',
  'speedex_employees',
  'speedex_notifications',
  'speedex_user',
];

const MIGRATION_FLAG = 'arcms_migrated_v1';

if (typeof window !== 'undefined' && !localStorage.getItem(MIGRATION_FLAG)) {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(MIGRATION_FLAG, '1');
}

function loadOrInit<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function recalcInvoice(invoice: Invoice): Invoice {
  const daysOverdue = getDaysOverdue(invoice.dueDate);
  const balance = +(invoice.totalAmount - invoice.amountPaid).toFixed(2);
  const paymentStatus = derivePaymentStatus(invoice.totalAmount, invoice.amountPaid, daysOverdue);
  return {
    ...invoice,
    balance,
    daysOverdue,
    agingBucket: getAgingBucket(daysOverdue),
    paymentStatus,
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const list = loadOrInit<Employee[]>(STORAGE_KEYS.employees, initialEmployees);
    return list.map((emp) => (emp.id === 'EMP-002' ? { ...emp, status: 'Active' as const } : emp));
  });
  const [clients, setClients] = useState<Client[]>(() => loadOrInit(STORAGE_KEYS.clients, initialClients));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadOrInit(STORAGE_KEYS.invoices, initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => loadOrInit(STORAGE_KEYS.payments, initialPayments));
  const [notifications, setNotifications] = useState<Notification[]>(() => initialNotifications);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadOrInit(STORAGE_KEYS.logs, initialLogs));

  // New submodule states
  const [shipmentRates, setShipmentRates] = useState<ShipmentRate[]>(() => loadOrInit(STORAGE_KEYS.rates, []));
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>(() => loadOrInit(STORAGE_KEYS.cashflow, []));
  const [bankBalances, setBankBalances] = useState<BankBalance[]>(() => loadOrInit(STORAGE_KEYS.balances, []));
  const [expenses, setExpenses] = useState<TransportationExpense[]>(() => loadOrInit(STORAGE_KEYS.expenses, []));
  const [tickets, setTickets] = useState<SupportTicket[]>(() => loadOrInit(STORAGE_KEYS.tickets, []));
  const [validations, setValidations] = useState<PaymentValidation[]>(() => loadOrInit(STORAGE_KEYS.validations, []));
  const [adjustments, setAdjustments] = useState<PaymentAdjustment[]>(() => loadOrInit(STORAGE_KEYS.adjustments, []));

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.rates, JSON.stringify(shipmentRates)); }, [shipmentRates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.cashflow, JSON.stringify(cashFlowEntries)); }, [cashFlowEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.balances, JSON.stringify(bankBalances)); }, [bankBalances]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.tickets, JSON.stringify(tickets)); }, [tickets]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.validations, JSON.stringify(validations)); }, [validations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.adjustments, JSON.stringify(adjustments)); }, [adjustments]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, invoicesRes, paymentsRes, logsRes, notificationsRes, ratesRes, cashflowRes, balancesRes, expensesRes, ticketsRes, validationsRes, adjustmentsRes] = await Promise.all([
          fetch('/api/v1/clients'),
          fetch('/api/v1/invoices'),
          fetch('/api/v1/payments'),
          fetch('/api/v1/logs'),
          fetch('/api/v1/notifications'),
          fetch('/api/v1/shipment-pricing/rates'),
          fetch('/api/v1/cashflow'),
          fetch('/api/v1/cashflow/balances'),
          fetch('/api/v1/expenses/transportation'),
          fetch('/api/v1/tickets'),
          fetch('/api/v1/validations'),
          fetch('/api/v1/adjustments'),
        ]);

        if (clientsRes.ok) setClients(await clientsRes.json());
        if (invoicesRes.ok) setInvoices((await invoicesRes.json()).map(recalcInvoice));
        if (paymentsRes.ok) setPayments(await paymentsRes.json());
        if (logsRes.ok) setActivityLogs(await logsRes.json());
        if (notificationsRes.ok) setNotifications(await notificationsRes.json());
        if (ratesRes.ok) setShipmentRates(await ratesRes.json());
        if (cashflowRes.ok) setCashFlowEntries(await cashflowRes.json());
        if (balancesRes.ok) setBankBalances(await balancesRes.json());
        if (expensesRes.ok) setExpenses(await expensesRes.json());
        if (ticketsRes.ok) setTickets(await ticketsRes.json());
        if (validationsRes.ok) setValidations(await validationsRes.json());
        if (adjustmentsRes.ok) setAdjustments(await adjustmentsRes.json());
      } catch (err) {
        console.warn("Could not connect to API backend, using local/mock data storage.", err);
      }
    };
    fetchData();
  }, []);

  const addEmployee = (employee: Employee) => setEmployees((prev) => [...prev, employee]);
  const updateEmployee = (id: string, updated: Partial<Employee>) =>
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updated } : emp)));
  const deleteEmployee = (id: string) => setEmployees((prev) => prev.filter((emp) => emp.id !== id));

  const recalcClientBalances = (clientId: string, allInvoices: Invoice[]) => {
    const clientInvoices = allInvoices.filter((inv) => inv.clientId === clientId);
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalPaid = clientInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const currentBalance = +(totalBilled - totalPaid).toFixed(2);
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              totalBilled: +totalBilled.toFixed(2),
              totalPaid: +totalPaid.toFixed(2),
              currentBalance,
              lastTransaction: new Date().toISOString().slice(0, 10),
            }
          : c,
      ),
    );
  };

  const addClient = async (client: Client) => {
    setClients((prev) => [...prev, client]);
    try {
      await fetch('/api/v1/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientCode: client.clientCode,
          name: client.name,
          businessName: client.businessName,
          contactPerson: client.contactPerson,
          contactNumber: client.contactNumber,
          email: client.email,
          address: client.address,
          tin: client.tin,
          creditLimit: client.creditLimit,
        }),
      });
    } catch (err) {
      console.error("Failed to sync new client to API backend.", err);
    }
  };

  const updateClient = (id: string, updated: Partial<Client>) =>
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));

  const deleteClient = async (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/v1/clients/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error("Failed to delete client on API backend.", err);
    }
  };

  const addInvoice = async (invoice: Invoice) => {
    const final = recalcInvoice(invoice);
    setInvoices((prev) => {
      const next = [final, ...prev];
      recalcClientBalances(final.clientId, next);
      return next;
    });
    try {
      await fetch('/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo: final.invoiceNo,
          clientId: final.clientId,
          clientName: final.clientName,
          billingDate: final.billingDate,
          dueDate: final.dueDate,
          freightCharges: final.freightCharges,
          otherCharges: final.otherCharges,
          subtotal: final.subtotal,
          vatRate: final.vatRate,
          vatAmount: final.vatAmount,
          surcharge: final.surcharge,
          totalAmount: final.totalAmount,
          description: final.description,
          encodedBy: final.encodedBy,
        }),
      });
    } catch (err) {
      console.error("Failed to sync new invoice to API backend.", err);
    }
  };

  const updateInvoice = (id: string, updated: Partial<Invoice>) => {
    setInvoices((prev) => {
      const next = prev.map((inv) => (inv.id === id ? recalcInvoice({ ...inv, ...updated }) : inv));
      const target = next.find((inv) => inv.id === id);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
  };

  const deleteInvoice = async (id: string) => {
    setInvoices((prev) => {
      const target = prev.find((inv) => inv.id === id);
      const next = prev.filter((inv) => inv.id !== id);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
    try {
      await fetch(`/api/v1/invoices/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error("Failed to delete invoice on API backend.", err);
    }
  };

  const archiveInvoice = async (id: string, archived: boolean = true) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, archived } : inv)));
    try {
      await fetch(`/api/v1/invoices/${id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      });
    } catch (err) {
      console.error("Failed to archive invoice on API backend.", err);
    }
  };

  const recordPayment = async (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
    setInvoices((prev) => {
      const next = prev.map((inv) => {
        if (inv.id !== payment.invoiceId && inv.invoiceNo !== payment.invoiceNo) return inv;
        const newAmountPaid = +(inv.amountPaid + payment.amount).toFixed(2);
        return recalcInvoice({
          ...inv,
          amountPaid: Math.min(newAmountPaid, inv.totalAmount),
          lastUpdated: new Date().toISOString(),
          updatedBy: payment.recordedBy,
        });
      });
      const target = next.find((inv) => inv.id === payment.invoiceId || inv.invoiceNo === payment.invoiceNo);
      if (target) recalcClientBalances(target.clientId, next);
      return next;
    });
    try {
      await fetch('/api/v1/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orNumber: payment.orNumber,
          invoiceId: payment.invoiceId,
          invoiceNo: payment.invoiceNo,
          clientId: payment.clientId,
          clientName: payment.clientName,
          paymentDate: payment.paymentDate,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          referenceNumber: payment.referenceNumber,
          remarks: payment.remarks,
          recordedBy: payment.recordedBy,
        }),
      });
    } catch (err) {
      console.error("Failed to record payment on API backend.", err);
    }
  };

  const deletePayment = (id: string) => {
    const target = payments.find((p) => p.id === id);
    setPayments((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      setInvoices((prev) => {
        const next = prev.map((inv) => {
          if (inv.id !== target.invoiceId && inv.invoiceNo !== target.invoiceNo) return inv;
          const newAmountPaid = Math.max(0, +(inv.amountPaid - target.amount).toFixed(2));
          return recalcInvoice({ ...inv, amountPaid: newAmountPaid });
        });
        const inv = next.find((i) => i.id === target.invoiceId || i.invoiceNo === target.invoiceNo);
        if (inv) recalcClientBalances(inv.clientId, next);
        return next;
      });
    }
  };

  const addNotification = (notification: Notification) =>
    setNotifications((prev) => [notification, ...prev]);

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
      });
    } catch (err) {
      console.error("Failed to mark notification read on API backend.", err);
    }
  };

  const markAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const deleteNotification = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);

  const addActivityLog = async (log: ActivityLog) => {
    setActivityLogs((prev) => [log, ...prev]);
    try {
      await fetch('/api/v1/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: log.userName,
          userRole: log.userRole,
          userInitials: log.userInitials,
          userColor: log.userColor,
          action: log.action,
          description: log.description,
          reference: log.reference,
        }),
      });
    } catch (err) {
      console.error("Failed to add activity log on API backend.", err);
    }
  };

  // ──── New Submodule Handlers ────

  const addAdjustment = async (adj: Omit<PaymentAdjustment, 'id' | 'dateApproved'>) => {
    const newAdj: PaymentAdjustment = {
      ...adj,
      id: 'ADJ-' + Date.now(),
      dateApproved: new Date().toISOString().slice(0, 10),
    };
    setAdjustments((prev) => [newAdj, ...prev]);

    setInvoices((prev) => prev.map((inv) => {
      if (inv.invoiceNo !== adj.invoiceNo) return inv;
      let newBalance = inv.balance;
      let newAmtPaid = inv.amountPaid;
      let newTotal = inv.totalAmount;
      if (adj.adjustmentType.toLowerCase() === 'credit' || adj.adjustmentType.toLowerCase() === 'write-off') {
        newBalance = Math.max(0, inv.balance - adj.amount);
        newAmtPaid += adj.amount;
      } else if (adj.adjustmentType.toLowerCase() === 'debit') {
        newTotal += adj.amount;
        newBalance += adj.amount;
      }
      return recalcInvoice({ ...inv, balance: newBalance, amountPaid: newAmtPaid, totalAmount: newTotal });
    }));

    try {
      await fetch('/api/v1/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adj),
      });
    } catch (err) {
      console.error("Failed to sync adjustment on API backend.", err);
    }
  };

  const addCashFlowEntry = async (entry: Omit<CashFlowEntry, 'id' | 'date'>) => {
    const newEntry: CashFlowEntry = {
      ...entry,
      id: 'CF-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    setCashFlowEntries((prev) => [newEntry, ...prev]);
    try {
      await fetch('/api/v1/cashflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Failed to sync cashflow on API backend.", err);
    }
  };

  const addExpense = async (exp: Omit<TransportationExpense, 'id' | 'date'>) => {
    const newExp: TransportationExpense = {
      ...exp,
      id: 'EXP-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
    };
    setExpenses((prev) => [newExp, ...prev]);

    const newFlow: CashFlowEntry = {
      id: 'CF-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      type: 'Outflow',
      category: exp.expenseType,
      amount: exp.amount,
      referenceNo: 'EXP-T',
      description: `Fleet expense: ${exp.plateNumber} - ${exp.description}`,
    };
    setCashFlowEntries((prev) => [newFlow, ...prev]);

    try {
      await fetch('/api/v1/expenses/transportation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
    } catch (err) {
      console.error("Failed to sync expense on API backend.", err);
    }
  };

  const addTicket = async (tkt: Omit<SupportTicket, 'id' | 'status' | 'dateCreated' | 'lastUpdated'>) => {
    const newTkt: SupportTicket = {
      ...tkt,
      id: 'TKT-' + Date.now(),
      status: 'Open',
      dateCreated: new Date().toISOString().replace('T', ' ').slice(0, 19),
      lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setTickets((prev) => [newTkt, ...prev]);
    try {
      await fetch('/api/v1/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tkt),
      });
    } catch (err) {
      console.error("Failed to submit support ticket to API backend.", err);
    }
  };

  const updateTicketStatus = async (id: string, status: 'Open' | 'In-Progress' | 'Resolved') => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status, lastUpdated: new Date().toISOString().replace('T', ' ').slice(0, 19) } : t)));
    try {
      await fetch(`/api/v1/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error("Failed to update ticket status on API backend.", err);
    }
  };

  const submitValidation = async (val: Omit<PaymentValidation, 'id' | 'status' | 'dateSubmitted'>) => {
    const newVal: PaymentValidation = {
      ...val,
      id: 'VAL-' + Date.now(),
      status: 'Pending',
      dateSubmitted: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setValidations((prev) => [newVal, ...prev]);
    try {
      await fetch('/api/v1/validations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(val),
      });
    } catch (err) {
      console.error("Failed to submit payment validation to API backend.", err);
    }
  };

  const verifyValidation = async (id: string, status: 'Approved' | 'Rejected') => {
    setValidations((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    
    const validation = validations.find(v => v.id === id);
    if (validation && status === 'Approved') {
      const inv = invoices.find(i => i.invoiceNo === validation.invoiceNo);
      if (inv) {
        const dummyPayment: Payment = {
          id: 'OR-COD-' + Date.now(),
          orNumber: 'OR-COD-' + Date.now().toString().slice(-6),
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          clientId: inv.clientId,
          clientName: inv.clientName,
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: validation.amountCollected,
          paymentMethod: 'Cash',
          referenceNumber: 'COD-RECON',
          recordedBy: 'COD Driver System',
          dateRecorded: new Date().toISOString().slice(0, 10),
        };
        setPayments((prev) => [dummyPayment, ...prev]);
        setInvoices((prev) => prev.map((i) => {
          if (i.invoiceNo !== inv.invoiceNo) return i;
          const newAmtPaid = +(i.amountPaid + validation.amountCollected).toFixed(2);
          return recalcInvoice({ ...i, amountPaid: newAmtPaid });
        }));
      }
    }

    try {
      await fetch(`/api/v1/validations/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (err) {
      console.error("Failed to verify payment validation on API backend.", err);
    }
  };

  return (
    <DataContext.Provider
      value={{
        employees,
        clients,
        invoices,
        payments,
        notifications,
        activityLogs,
        shipmentRates,
        cashFlowEntries,
        bankBalances,
        expenses,
        tickets,
        validations,
        adjustments,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addClient,
        updateClient,
        deleteClient,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        archiveInvoice,
        recordPayment,
        deletePayment,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        addActivityLog,
        addAdjustment,
        addCashFlowEntry,
        addExpense,
        addTicket,
        updateTicketStatus,
        submitValidation,
        verifyValidation,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
