import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Plus, AlertCircle, FileText, Clock, CheckSquare } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';

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
    <>
      <Header
        title="Disputes & Ticketing Support Desk"
        subtitle="Support · FOMS"
        actions={
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="btn btn-primary rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            style={{ padding: '10px 20px', fontWeight: 700 }}
          >
            <Plus size={16} />
            {showLogForm ? 'CLOSE DESK' : 'LOG SUPPORT TICKET'}
          </button>
        }
      />

      <div className="dashboard-content animate-fade-in">
        {/* Status metrics grid */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard
            icon={<FileText size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="TOTAL TICKETS"
            value={totalTickets}
            subtitle="All logged disputes"
            accentColor="#00A99D"
          />
          <StatCard
            icon={<AlertCircle size={18} />}
            iconColor="var(--status-failed)"
            iconBg="var(--status-failed-bg)"
            label="OPEN DISPUTES"
            value={openTickets}
            subtitle="Awaiting desk review"
            accentColor="#E31A1A"
          />
          <StatCard
            icon={<Clock size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="IN-PROGRESS"
            value={inProgressTickets}
            subtitle="Actively being verified"
            accentColor="#FFB547"
          />
          <StatCard
            icon={<CheckSquare size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="RESOLVED"
            value={resolvedTickets}
            subtitle="Successfully settled claims"
            accentColor="#01B574"
          />
        </div>

        {showLogForm && (
          <div className="card animate-scale-in" style={{ maxWidth: '800px', border: '1.5px solid var(--primary)' }}>
            <div className="card-header" style={{ marginBottom: '24px' }}>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Plus size={18} color="var(--primary)" />
                Log Dispute Ticket
              </h3>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Client Account</label>
                  <select
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Ticket Subject / Title</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g., Double billing check, Dispute freight fee"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Concern Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail client concern explanations..."
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
                  {loading ? 'Submitting...' : 'SUBMIT TICKET'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket Logs list */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <FileText className="text-[#00A99D]" size={16} />
              Disputes Ticketing Ledger
            </h3>
          </div>

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
    </>
  );
}
