import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Scale, Box, Truck, ShieldAlert, DollarSign, Calculator, HelpCircle, Info } from 'lucide-react';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../utils/finance';

export default function ShipmentPricing() {
  const { shipmentRates } = useData();

  const [origin, setOrigin] = useState('Manila');
  const [destination, setDestination] = useState('Cebu');
  const [weight, setWeight] = useState('10');
  const [volume, setVolume] = useState('0.5');
  const [cargoType, setCargoType] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    baseFare: number;
    weightCharge: number;
    volumeCharge: number;
    extraCharge: number;
    totalCharges: number;
    estimatedDays: number;
  } | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/shipment-pricing/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          weight: parseFloat(weight) || 0,
          volume: parseFloat(volume) || 0,
          cargoType,
        }),
      });

      if (response.ok) {
        setResult(await response.json());
      } else {
        calculateOffline();
      }
    } catch {
      calculateOffline();
    } finally {
      setLoading(false);
    }
  };

  const calculateOffline = () => {
    const rate = shipmentRates.find(
      (r) => r.origin.toLowerCase() === origin.toLowerCase() && r.destination.toLowerCase() === destination.toLowerCase()
    );

    const baseFare = rate?.baseFare ?? 150;
    const ratePerKg = rate?.ratePerKg ?? 12;
    const ratePerCbm = rate?.ratePerCbm ?? 220;
    let estDays = rate?.estimatedDays ?? 3;

    const w = parseFloat(weight) || 0;
    const v = parseFloat(volume) || 0;

    const weightCharge = w * ratePerKg;
    const volumeCharge = v * ratePerCbm;
    let extraCharge = 0;

    if (cargoType === 'Fragile') {
      extraCharge = 100;
    } else if (cargoType === 'Express') {
      extraCharge = 250;
      estDays = Math.max(1, estDays - 1);
    }

    const totalCharges = baseFare + weightCharge + volumeCharge + extraCharge;
    setResult({
      baseFare,
      weightCharge,
      volumeCharge,
      extraCharge,
      totalCharges,
      estimatedDays: estDays,
    });
  };

  return (
    <>
      <Header
        title="Shipment Pricing & Charge Calculator"
        subtitle="Billing · FOMS"
      />

      <div className="dashboard-content animate-fade-in">
        {/* Metric widgets */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <StatCard
            icon={<DollarSign size={18} />}
            iconColor="var(--status-active)"
            iconBg="var(--status-active-bg)"
            label="BASE TARIFF MINIMUM"
            value="₱150.00"
            subtitle="Flat-rate terminal starting fee"
            accentColor="#01B574"
          />
          <StatCard
            icon={<Truck size={18} />}
            iconColor="var(--primary)"
            iconBg="var(--status-transit-bg)"
            label="ESTIMATED TRANSIT WINDOW"
            value="2-3 Days"
            subtitle="Standard shipping duration"
            accentColor="#00A99D"
          />
          <StatCard
            icon={<MapPin size={18} />}
            iconColor="var(--status-new)"
            iconBg="var(--status-new-bg)"
            label="ACTIVE HUB ZONES"
            value="4 Hubs"
            subtitle="Manila, Cebu, Davao, & Iloilo"
            accentColor="#4318FF"
          />
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--gap)' }}>
          {/* Inputs Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="flex items-center gap-2">
                <Calculator size={16} color="var(--primary)" />
                Calculator Inputs
              </h3>
            </div>

            <form onSubmit={handleCalculate} className="flex flex-col gap-4">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> Origin Hub
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="form-input"
                  >
                    <option value="Manila">Manila</option>
                    <option value="Cebu">Cebu</option>
                    <option value="Davao">Davao</option>
                    <option value="Iloilo">Iloilo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400" /> Destination Hub
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="form-input"
                  >
                    <option value="Cebu">Cebu</option>
                    <option value="Manila">Manila</option>
                    <option value="Davao">Davao</option>
                    <option value="Iloilo">Iloilo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    <Scale size={14} className="text-gray-400" /> Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 15.5"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-1.5">
                    <Box size={14} className="text-gray-400" /> Volume (CBM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    placeholder="e.g. 0.8"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cargo Handling Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['Standard', 'Fragile', 'Express'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCargoType(type)}
                      className="btn font-extrabold text-xs"
                      style={{
                        padding: '10px 0',
                        border: cargoType === type ? '2px solid var(--primary)' : '1px solid #E9EDF7',
                        background: cargoType === type ? 'var(--status-transit-bg)' : '#ffffff',
                        color: cargoType === type ? 'var(--primary)' : '#1B254B',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: cargoType === type ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary rounded-xl w-full py-3.5 mt-2 font-bold cursor-pointer transition-all hover:scale-[1.01]"
              >
                {loading ? 'COMPUTING CHARGES...' : 'CALCULATE CHARGES'}
              </button>
            </form>
          </div>

          {/* Breakdown Results or Guidelines Section */}
          <div className="flex flex-col gap-md">
            {result ? (
              <div className="card animate-scale-in flex-1 justify-between flex flex-col" style={{ border: '1.5px solid var(--primary)' }}>
                <div>
                  <div className="card-header">
                    <h3 className="flex items-center gap-2 text-[#1B254B] font-extrabold">
                      <Info size={16} color="var(--primary)" />
                      Compute Charge Breakdown
                    </h3>
                  </div>

                  <div className="flex flex-col gap-md text-sm text-gray-600">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                      <span className="font-semibold text-gray-500">Route details</span>
                      <span className="font-extrabold text-[#1B254B]">{origin} ➔ {destination}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Base Terminal Fare</span>
                      <span className="font-bold text-gray-800">{formatCurrency(result.baseFare)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Weight Charge ({weight} kg)</span>
                      <span className="font-bold text-gray-800">{formatCurrency(result.weightCharge)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Volume Charge ({volume} CBM)</span>
                      <span className="font-bold text-gray-800">{formatCurrency(result.volumeCharge)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Handling Fees ({cargoType})</span>
                      <span className="font-bold text-gray-800">{formatCurrency(result.extraCharge)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-extrabold text-[#1B254B]">TOTAL CHARGES (PHP)</span>
                    <span className="text-xl font-black text-[#00A99D]">{formatCurrency(result.totalCharges)}</span>
                  </div>

                  <div className="p-3.5 bg-teal-50/50 rounded-xl flex items-center justify-between text-[#00A99D] font-bold text-xs border border-teal-100">
                    <span className="flex items-center gap-1.5">
                      <Truck size={16} /> Estimated Transit Time:
                    </span>
                    <span className="bg-white px-3 py-1 rounded-lg border border-teal-200">{result.estimatedDays} Business Days</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex-1 flex flex-col justify-center items-center text-center p-8 text-gray-400 gap-3 border border-dashed border-gray-200">
                <HelpCircle size={48} className="text-gray-300 animate-pulse" />
                <div>
                  <h4 className="font-bold text-[#1B254B] text-sm mb-1">Awaiting Inputs</h4>
                  <p className="text-xs max-w-[280px]">Fill in the shipment weight, volume, and routes on the left, then click Calculate.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rate Standards Guide Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="flex items-center gap-2">
              <ShieldAlert size={16} color="var(--primary)" />
              Active Route Tariffs & Service Guidelines
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '8px' }}>
            <div style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border)',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Manila ➔ Cebu</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Base {formatCurrency(150)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-new-bg)', color: 'var(--status-new)' }}>Weight: ₱12/kg</span>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-transit-bg)', color: 'var(--status-transit)' }}>Volume: ₱220/cbm</span>
              </div>
            </div>

            <div style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border)',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Manila ➔ Davao</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Base {formatCurrency(200)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-new-bg)', color: 'var(--status-new)' }}>Weight: ₱16/kg</span>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-transit-bg)', color: 'var(--status-transit)' }}>Volume: ₱280/cbm</span>
              </div>
            </div>

            <div style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--border)',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '130px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>Manila ➔ Iloilo</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Base {formatCurrency(160)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-new-bg)', color: 'var(--status-new)' }}>Weight: ₱13/kg</span>
                <span style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.8rem', background: 'var(--status-transit-bg)', color: 'var(--status-transit)' }}>Volume: ₱230/cbm</span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '14px 18px',
            background: '#FFFDF5',
            color: '#B7791F',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: '12px',
            border: '1px solid #FEEBC8',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Info size={16} className="flex-shrink-0" />
            <span>Handling Fees: Fragile cargo incurs flat +₱100.00 fee. Express cargo incurs flat +₱250.00 fee and cuts estimated transit time by 1 business day.</span>
          </div>
        </div>
      </div>
    </>
  );
}

