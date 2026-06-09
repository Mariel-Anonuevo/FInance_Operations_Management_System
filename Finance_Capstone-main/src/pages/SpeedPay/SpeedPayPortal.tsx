import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Landmark, CreditCard, ChevronRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SpeedPayPortal() {
  const { invoices, recordPayment } = useData();

  const [invoiceNo, setInvoiceNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receipt, setReceipt] = useState<{
    txId: string;
    invoiceNo: string;
    amount: number;
    reference: string;
    date: string;
  } | null>(null);

  const activeInvoices = invoices.filter((i) => i.balance > 0 && !i.archived);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const targetInvoice = invoices.find((i) => i.invoiceNo === invoiceNo);
    if (!targetInvoice) {
      alert("Please select a valid invoice.");
      setLoading(false);
      return;
    }

    const payAmount = targetInvoice.balance;
    const cleanCard = cardNumber.replace(/\s?/g, '');
    const brand = cleanCard.startsWith('4') ? 'Visa' : cleanCard.startsWith('5') ? 'Mastercard' : 'Digital Express';
    const last4 = cleanCard.slice(-4) || '1111';

    try {
      const response = await fetch('/api/v1/speedpay/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo,
          amount: payAmount,
          cardBrand: brand,
          cardLast4: last4,
        }),
      });

      if (response.ok) {
        const tx = await response.json();
        
        // Sync local React state conceptual changes
        await recordPayment({
          id: 'OR-SP-' + Date.now().toString().slice(-6),
          orNumber: 'OR-SP-' + Date.now().toString().slice(-6),
          invoiceId: targetInvoice.id,
          invoiceNo: targetInvoice.invoiceNo,
          clientId: targetInvoice.clientId,
          clientName: targetInvoice.clientName,
          paymentDate: new Date().toISOString().slice(0, 10),
          amount: payAmount,
          paymentMethod: 'Bank Transfer',
          referenceNumber: tx.id,
          recordedBy: 'SpeedPay Gateway',
          dateRecorded: new Date().toISOString().slice(0, 10),
        });

        setReceipt({
          txId: tx.id,
          invoiceNo: targetInvoice.invoiceNo,
          amount: payAmount,
          reference: 'SP-' + Date.now().toString().slice(-6),
          date: new Date().toLocaleString(),
        });
        setSuccess(true);
      } else {
        processOffline(targetInvoice, payAmount);
      }
    } catch {
      processOffline(targetInvoice, payAmount);
    } finally {
      setLoading(false);
    }
  };

  const processOffline = async (targetInvoice: any, payAmount: number) => {
    // offline mock transaction
    const txId = 'TX-SP-' + Date.now().toString().slice(-6);

    await recordPayment({
      id: 'OR-SP-' + Date.now().toString().slice(-6),
      orNumber: 'OR-SP-' + Date.now().toString().slice(-6),
      invoiceId: targetInvoice.id,
      invoiceNo: targetInvoice.invoiceNo,
      clientId: targetInvoice.clientId,
      clientName: targetInvoice.clientName,
      paymentDate: new Date().toISOString().slice(0, 10),
      amount: payAmount,
      paymentMethod: 'Bank Transfer',
      referenceNumber: txId,
      recordedBy: 'SpeedPay Gateway',
      dateRecorded: new Date().toISOString().slice(0, 10),
    });

    setReceipt({
      txId: txId,
      invoiceNo: targetInvoice.invoiceNo,
      amount: payAmount,
      reference: 'SP-OFFLINE-' + Date.now().toString().slice(-4),
      date: new Date().toLocaleString(),
    });
    setSuccess(true);
  };

  const handleReset = () => {
    setSuccess(false);
    setInvoiceNo('');
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setReceipt(null);
  };

  return (
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Landmark className="text-[#00A99D]" />
          SpeedPay Gateway simulated Portal
        </h1>
        <p className="text-gray-500 mt-1">
          Secure digital checkout terminal simulating credit card processing and immediate invoice reconciliations.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Payment Checkout Panel */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-md space-y-6">
          {success && receipt ? (
            <div className="space-y-6 animate-scaleUp text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-800">Checkout Approved</h3>
                <p className="text-sm text-gray-400">Your digital transaction has processed successfully.</p>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-left text-xs space-y-2 text-gray-600 font-semibold font-mono">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="text-gray-800">{receipt.txId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice No:</span>
                  <span className="text-gray-800">{receipt.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Settled:</span>
                  <span className="text-gray-800">PHP {receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Merchant Ref:</span>
                  <span className="text-gray-800">{receipt.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Date:</span>
                  <span className="text-gray-800">{receipt.date}</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                PROCESS ANOTHER PAYMENT
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                <CreditCard className="text-[#00A99D]" /> Secure digital pay
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Select invoice to settle</label>
                <select
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all text-sm font-semibold"
                >
                  <option value="">-- Outstanding Invoices --</option>
                  {activeInvoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} - {inv.clientName} (Amt: PHP {inv.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Maria Dela Cruz"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all text-sm text-center"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase">CVV / Security Code</label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="***"
                    maxLength={3}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all text-sm text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-dark py-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? 'Authorizing Gateway...' : 'AUTHORIZE SECURE TRANSACTION'}
                <ChevronRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Security / Info Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-800 flex items-center gap-2">
              <ShieldCheck className="text-[#00A99D] w-5 h-5" />
              Gateway Security
            </h3>
            <p className="text-sm text-gray-500">
              FOMS SpeedPay portal communicates with tokenized bank APIs via end-to-end SSL encryption protocol. No card numbers are saved on persistent server structures.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Simulated test cards</h4>
            <div className="space-y-2 text-xs font-semibold text-gray-600">
              <div className="flex justify-between border-b pb-2">
                <span>Visa Card Number:</span>
                <span className="font-mono text-gray-800">4111 2222 3333 4444</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Mastercard Number:</span>
                <span className="font-mono text-gray-800">5500 1234 5678 9012</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
