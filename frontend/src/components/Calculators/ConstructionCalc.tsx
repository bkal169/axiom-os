import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export const ConstructionCalc: React.FC = () => {
    const [sqft, setSqft] = useState(100000);
    const [costPerSf, setCostPerSf] = useState(150);
    const [contingencyPct, setContingencyPct] = useState(10);
    const [totalCost, setTotalCost] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchConstruction = async () => {
            setLoading(true);
            const data = await api.getConstructionEstimate(sqft, costPerSf, contingencyPct / 100);
            if (mounted && data) {
                setTotalCost(data.estimated_total_cost);
            }
            if (mounted) setLoading(false);
        };
        fetchConstruction();
        return () => { mounted = false; };
    }, [sqft, costPerSf, contingencyPct]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Total Square Footage (RSF/GSF)</label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                        value={sqft}
                        onChange={e => setSqft(Number(e.target.value))}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expected Cost per SqFt</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={costPerSf}
                            onChange={e => setCostPerSf(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contingency Buffer (%)</label>
                    <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                        value={contingencyPct}
                        onChange={e => setContingencyPct(Number(e.target.value))}
                    />
                    <input
                        type="range" min="0" max="30" step="1"
                        className="w-full mt-2"
                        value={contingencyPct} onChange={e => setContingencyPct(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="bg-amber-50 text-amber-900 p-8 rounded-xl flex flex-col justify-center items-center text-center border border-amber-100">
                <span className="text-amber-700 text-sm uppercase tracking-widest font-bold mb-2">Estimated Hard Costs</span>
                <span className="text-5xl font-bold">
                    {loading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost)}
                </span>
                <span className="text-amber-600 text-sm mt-4">Including {contingencyPct}% Contingency Buffer</span>
            </div>
        </div>
    );
};
