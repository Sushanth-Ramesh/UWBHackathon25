'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [dieselGallons, setDieselGallons] = useState('');
  const [gasolineGallons, setGasolineGallons] = useState('');
  const [naturalGasCubicMeters, setNaturalGasCubicMeters] = useState('');
  const [kwhUsed, setKwhUsed] = useState('');
  const [scope1, setScope1] = useState(null);
  const [scope2, setScope2] = useState(null);
  const [message, setMessage] = useState('');
  const resultsRef = useRef(null);
  const router = useRouter();

  // Calculate total tons of CO₂e
  const totalEmissionsTons = (scope1 !== null && scope2 !== null) ? (parseFloat(scope1) + parseFloat(scope2)) / 1000 : 0;

  // Determine impact badge and color
  const impactLevel = totalEmissionsTons < 20
    ? 'Low Impact'
    : totalEmissionsTons < 100
    ? 'Moderate Impact'
    : 'High Impact';

  const badgeColor = totalEmissionsTons < 20
    ? 'bg-green-500'
    : totalEmissionsTons < 100
    ? 'bg-yellow-500'
    : 'bg-red-500 animate-pulse'; // animate pulse only for High

  const handleCalculate = async (e) => {
    e.preventDefault();

    if (!dieselGallons && !gasolineGallons && !naturalGasCubicMeters && !kwhUsed) {
      setMessage('Please fill in at least one field.');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diesel_used: parseFloat(dieselGallons || 0),
          gasoline_used: parseFloat(gasolineGallons || 0),
          natural_gas_used: parseFloat(naturalGasCubicMeters || 0),
          kwh_used: parseFloat(kwhUsed || 0),
          State: 'Washington'
        }),
      });

      const data = await res.json();
      setScope1(data.scope1.toFixed(1));
      setScope2(data.scope2.toFixed(1));
      setMessage('Emissions calculated successfully!');
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error calculating emissions:', err);
      setMessage('Failed to calculate. Check server.');
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-10 text-center text-green-900">CarbonCraft 🌿</h1>

      {/* Home Button */}
      <div className="w-full flex justify-start mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition transform hover:scale-105"
        >
          <span>🏠</span>
          <span className="font-semibold">Home</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleCalculate} className="space-y-6 bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div>
          <label className="block font-semibold mb-2 text-gray-900">Gallons of Diesel Used</label>
          <input
            type="number"
            value={dieselGallons}
            onChange={(e) => setDieselGallons(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            placeholder="Enter diesel usage"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-gray-900">Gallons of Gasoline Used</label>
          <input
            type="number"
            value={gasolineGallons}
            onChange={(e) => setGasolineGallons(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            placeholder="Enter gasoline usage"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-gray-900">Natural Gas Used (m³)</label>
          <input
            type="number"
            value={naturalGasCubicMeters}
            onChange={(e) => setNaturalGasCubicMeters(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            placeholder="Enter natural gas usage"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-gray-900">Electricity Used (kWh)</label>
          <input
            type="number"
            value={kwhUsed}
            onChange={(e) => setKwhUsed(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900"
            placeholder="Enter kWh used"
          />
        </div>

        <button
          type="submit"
          className="px-8 py-3 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition transform hover:scale-105"
        >
          Calculate Emissions 🚀
        </button>

        {message && <p className="text-center mt-4 text-sm text-gray-700">{message}</p>}
      </form>

      {/* Results Section */}
      {scope1 !== null && scope2 !== null && (
        <div ref={resultsRef} className="mt-10 w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Your Results 🌎</h2>

          <div className="flex justify-between text-lg mb-2 text-gray-900">
            <span>Scope 1 Emissions:</span>
            <span className="font-semibold text-green-900">{(scope1 / 1000).toFixed(2)} tons CO₂e</span>
          </div>
          <div className="flex justify-between text-lg mb-2 text-gray-900">
            <span>Scope 2 Emissions:</span>
            <span className="font-semibold text-blue-900">{(scope2 / 1000).toFixed(2)} tons CO₂e</span>
          </div>

          {/* Impact Badge */}
          <div className="mt-6 flex justify-center">
            <span className={`px-4 py-2 rounded-full text-white font-semibold ${badgeColor}`}>
              {impactLevel}
            </span>
          </div>

          {/* Tier Table */}
          <div className="mt-10 w-full bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Your Tier & APR 📊</h2>
            <table className="w-full table-auto text-center">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 text-gray-800">Tier</th>
                  <th className="py-2 text-gray-800">Max Emissions (tons)</th>
                  <th className="py-2 text-gray-800">Interest Rate (APR%)</th>
                </tr>
              </thead>
              <tbody>
  {[
    { tier: "A+", max: 20, apr: 3.5 },
    { tier: "A", max: 50, apr: 4.5 },
    { tier: "B", max: 100, apr: 6.0 },
    { tier: "C", max: 175, apr: 8.5 },
    { tier: "D", max: Infinity, apr: "N/A" }
  ].map((row) => {
    let shouldHighlight = false;

    if (row.tier === "A+" && totalEmissionsTons <= 20) shouldHighlight = true;
    else if (row.tier === "A" && totalEmissionsTons > 20 && totalEmissionsTons <= 50) shouldHighlight = true;
    else if (row.tier === "B" && totalEmissionsTons > 50 && totalEmissionsTons <= 100) shouldHighlight = true;
    else if (row.tier === "C" && totalEmissionsTons > 100 && totalEmissionsTons <= 175) shouldHighlight = true;
    else if (row.tier === "D" && totalEmissionsTons > 175) shouldHighlight = true;

    return (
      <tr key={row.tier} className={shouldHighlight ? "bg-green-100 font-semibold text-gray-900" : ""}>
        <td className="py-2 text-gray-900">{row.tier}</td>
        <td className="py-2 text-gray-900">{row.max !== Infinity ? row.max : ">175"}</td>
        <td className="py-2 text-gray-900">{row.apr}</td>
      </tr>
    );
  })}
</tbody>
            </table>

            {/* Recommendation Box */}
            <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-gray-900">
              <h3 className="font-semibold mb-2 text-gray-900">🌱 Recommendation</h3>
              <p className="text-sm">
                {totalEmissionsTons > 175
                  ? "Reduce your emissions below 175 tons to requalify for better rates! 🌍"
                  : totalEmissionsTons > 100
                  ? `Reduce emissions by ${(totalEmissionsTons - 100).toFixed(2)} tons to reach Tier B!`
                  : totalEmissionsTons > 50
                  ? `Reduce emissions by ${(totalEmissionsTons - 50).toFixed(2)} tons to reach Tier A!`
                  : totalEmissionsTons > 20
                  ? `Reduce emissions by ${(totalEmissionsTons - 20).toFixed(2)} tons to reach Tier A+!`
                  : "You're already at Tier A+! 🌟 Great job!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}