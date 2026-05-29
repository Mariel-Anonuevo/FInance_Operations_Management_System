import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, AlertCircle, FileText } from 'lucide-react';

export default function SupportDesk() {
  const { tickets, clients, addTicket, updateTicketStatus } = useData();

  const [showLogForm, setShowLogForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute status metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'In-Progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await addTicket({
      clientName,
      ticketSubject,
      description,
    });

    setClientName('');
    setTicketSubject('');
    setDescription('');
    setLoading(false);
    setShowLogForm(false);
  };

  const handleStatusChange = async (id: string, newStatus: 'Open' | 'In-Progress' | 'Resolved') => {
    await updateTicketStatus(id, newStatus);
  };

  return (
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Ticketing & Payment disputes desk
          </h1>
          <p className="text-gray-500 mt-1">
            Log and manage customer discrepancies, invoice audit claims, and general billing support tickets.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="btn btn-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          {showLogForm ? 'CLOSE DESK' : 'LOG SUPPORT TICKET'}
        </button>
      </div>

      {/* Status metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tickets</span>
          <h3 className="text-2xl font-extrabold text-gray-800">{totalTickets}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Open disputes</span>
          <h3 className="text-2xl font-extrabold text-rose-500">{openTickets}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">In-Progress</span>
          <h3 className="text-2xl font-extrabold text-blue-500">{inProgressTickets}</h3>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resolved</span>
          <h3 className="text-2xl font-extrabold text-emerald-500">{resolvedTickets}</h3>
        </div>
      </div>

      {showLogForm && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm max-w-3xl animate-scaleUp space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
            Log Dispute Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Client Account</label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Ticket Subject / Title</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g., Double billing check, Dispute freight fee"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Concern Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail client concern explanations..."
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loading ? 'Submitting...' : 'SUBMIT TICKET'}
            </button>
          </form>
        </div>
      )}

      {/* Ticket Logs list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
          <FileText className="text-[#00A99D] w-5 h-5" />
          Disputes Ticketing Ledger
        </h2>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-2">
            <AlertCircle size={40} className="text-gray-300" />
            <p>No support tickets logged.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-bold text-gray-400">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logged Date</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                {tickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-500">{tkt.id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800">{tkt.clientName}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">
                      <div className="space-y-0.5">
                        <p>{tkt.ticketSubject}</p>
                        <p className="text-xs text-gray-400 font-normal max-w-sm truncate" title={tkt.description}>
                          {tkt.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          tkt.status === 'Open'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : tkt.status === 'In-Progress'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-semibold">{tkt.dateCreated}</td>
                    <td className="py-3 px-4">
                      <select
                        value={tkt.status}
                        onChange={(e) => handleStatusChange(tkt.id, e.target.value as any)}
                        className="p-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#00A99D] bg-white transition-colors cursor-pointer"
                      >
                        <option value="Open">Open</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
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
