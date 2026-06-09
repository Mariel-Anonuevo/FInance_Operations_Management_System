import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Truck, ShieldAlert, DollarSign, Search, Info } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../utils/finance';

export default function ShipmentPricing() {
  const { shipmentRates } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return shipmentRates.filter((rate) =>
      rate.origin.toLowerCase().includes(term) ||
      rate.destination.toLowerCase().includes(term) ||
      `${rate.origin} ${rate.destination}`.toLowerCase().includes(term)
    );
  }, [shipmentRates, searchTerm]);

  const totalRoutes = filteredRates.length;
  const avgBaseFare = filteredRates.length
    ? filteredRates.reduce((sum, rate) => sum + rate.baseFare, 0) / filteredRates.length
    : 0;
  const avgKgRate = filteredRates.length
    ? filteredRates.reduce((sum, rate) => sum + rate.ratePerKg, 0) / filteredRates.length
    : 0;

  return (
    <>
      <Header
        title="Shipment Records"
        subtitle="Billing · FOMS"
      />

      <div className="dashboard-content animate-fade-in">
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <StatCard
            icon={<DollarSign size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="ROUTES AVAILABLE"
            value={shipmentRates.length}
            subtitle="Total tariff records"
            accentColor="#01B574"
          />
          <StatCard
            icon={<MapPin size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="FILTERED ROUTES"
            value={totalRoutes}
            subtitle="Search results"
            accentColor="#4318FF"
          />
          <StatCard
            icon={<ShieldAlert size={18} />}
            iconColor="var(--status-pending)"
            iconBg="var(--status-pending-bg)"
            label="AVG BASE FARE"
            value={formatCurrency(avgBaseFare)}
            subtitle="Displayed routes average"
            accentColor="#FFB547"
          />
          <StatCard
            icon={<Truck size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="AVG RATE / KG"
            value={formatCurrency(avgKgRate)}
            subtitle="Displayed routes average"
            accentColor="#00A99D"
          />
        </div>

        <div className="card" style={{ marginTop: 'var(--gap)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="text-lg font-bold">Shipment Records</h3>
              <p className="text-sm text-gray-500">View available shipment pricing routes, tariffs, and estimated transit schedules.</p>
            </div>
            <div className="orders-filter-bar" style={{ gap: '12px', margin: 0 }}>
              <div className="filter-search" style={{ maxWidth: '320px' }}>
                <Search size={16} className="filter-search-icon" />
                <input
                  type="text"
                  placeholder="Search origin, destination..."
                  className="filter-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table className="data-table" style={{ minWidth: '900px' }}>
              <thead>
                <tr>
                  <th>ROUTE</th>
                  <th>BASE FARE</th>
                  <th>RATE / KG</th>
                  <th>RATE / CBM</th>
                  <th>ESTIMATED DAYS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRates.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      No shipment records found.
                    </td>
                  </tr>
                ) : (
                  filteredRates.map((rate) => (
                    <tr key={rate.id}>
                      <td>
                        <div className="cell-name" style={{ fontWeight: 700 }}>{rate.origin} → {rate.destination}</div>
                        <div className="cell-sub">Route ID: {rate.id}</div>
                      </td>
                      <td>{formatCurrency(rate.baseFare)}</td>
                      <td>{formatCurrency(rate.ratePerKg)}</td>
                      <td>{formatCurrency(rate.ratePerCbm)}</td>
                      <td>{rate.estimatedDays} days</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ marginTop: 'var(--gap)' }}>
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <Info size={16} color="var(--primary)" />
              Notes
            </h3>
          </div>
          <div style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
            <p>This page is read-only. Shipment pricing records are available as route tariffs and service guidelines only.</p>
            <p style={{ marginTop: '8px' }}>Use this list to review active routes, base fares, and per-unit shipping rates.</p>
          </div>
        </div>
      </div>
    </>
  );
}

