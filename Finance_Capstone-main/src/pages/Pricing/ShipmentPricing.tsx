import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { MapPin, Scale, Box, Truck, ShieldAlert } from 'lucide-react';

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
    <div className="p-6 w-full space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Shipment Pricing & Charge Calculator
        </h1>
        <p className="text-gray-500 mt-1">
          Compute freight charges, dimensional weight parameters, and estimated delivery dates dynamically.
        </p>
      </div>

      <div className="space-y-8">
        {/* Calculator Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
            Pricing Inputs
          </h2>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" /> Origin
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="Manila">Manila</option>
                  <option value="Cebu">Cebu</option>
                  <option value="Davao">Davao</option>
                  <option value="Iloilo">Iloilo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <MapPin size={16} className="text-gray-400" /> Destination
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                >
                  <option value="Cebu">Cebu</option>
                  <option value="Manila">Manila</option>
                  <option value="Davao">Davao</option>
                  <option value="Iloilo">Iloilo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <Scale size={16} className="text-gray-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 15.5"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                  <Box size={16} className="text-gray-400" /> Volume (CBM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="e.g. 0.8"
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 focus:border-[#00A99D] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Cargo Handling Type</label>
              <div className="grid grid-cols-3 gap-4">
                {['Standard', 'Fragile', 'Express'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCargoType(type)}
                    className={`p-3 rounded-xl border-2 text-center font-bold text-sm transition-all ${
                      cargoType === type
                        ? 'border-[#00A99D] bg-[#00A99D]/5 text-[#00A99D]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00A99D] hover:bg-[#009189] text-white font-bold rounded-xl shadow-lg shadow-[#00A99D]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Computing...' : 'CALCULATE CHARGES'}
            </button>
          </form>

          {/* Pricing Breakdown Result Card */}
          {result && (
            <div className="mt-8 bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4 animate-scaleUp">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex justify-between items-center">
                <span>Charge Breakdowns</span>
                <span className="text-sm font-normal text-gray-500">
                  Route: {origin} ➔ {destination}
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-600">
                <div>Base Terminal Fare:</div>
                <div className="text-right font-bold text-gray-800">PHP {result.baseFare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

                <div>Weight Charge ({weight} kg):</div>
                <div className="text-right font-bold text-gray-800">PHP {result.weightCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

                <div>Volume Charge ({volume} CBM):</div>
                <div className="text-right font-bold text-gray-800">PHP {result.volumeCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

                <div>Handling Fees ({cargoType}):</div>
                <div className="text-right font-bold text-gray-800">PHP {result.extraCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

                <div className="border-t pt-3 text-base font-extrabold text-gray-900">Total Computed Cost:</div>
                <div className="border-t pt-3 text-right text-lg font-extrabold text-[#00A99D]">
                  PHP {result.totalCharges.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                <div className="col-span-2 mt-2 bg-[#00A99D]/10 rounded-xl p-3 flex items-center justify-between text-[#00A99D] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Truck size={18} /> Estimated Transit Time:
                  </span>
                  <span>{result.estimatedDays} Business Days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Guidelines / Info */}
        <div className="bg-[#1B254B] text-white rounded-2xl p-6 space-y-4">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <ShieldAlert className="text-[#00A99D]" />
            Rate Standards
          </h3>
          <p className="text-sm text-gray-300">
            Pricing is derived from route zone agreements and handling specifications.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-sm">
            <div className="border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
              <span className="text-gray-400 block mb-1">Manila ➔ Cebu:</span>
              <span className="font-semibold">Base PHP 150 · W: 12/kg · V: 220/cbm</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
              <span className="text-gray-400 block mb-1">Manila ➔ Davao:</span>
              <span className="font-semibold">Base PHP 200 · W: 16/kg · V: 280/cbm</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-1">Manila ➔ Iloilo:</span>
              <span className="font-semibold">Base PHP 160 · W: 13/kg · V: 230/cbm</span>
            </div>
          </div>
          <p className="text-xs text-[#00A99D] mt-2">
            * Express Handling incurs PHP 250 fee and reduces transit by 1 day.
          </p>
        </div>
      </div>
    </div>
  );
}
