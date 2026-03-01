import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export const InsuranceCalc: React.FC = () => {
    const [replacementCost, setReplacementCost] = useState(1000000);
    const [assetClass, setAssetClass] = useState('multifamily');
    const [locationRisk, setLocationRisk] = useState(1.0);
    const [premium, setPremium] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchInsurance = async () => {
            setLoading(true);
            const data = await api.getInsuranceEstimate(replacementCost, assetClass, locationRisk);
            if (mounted && data) {
                setPremium(data.estimated_annual_premium);
            }
            if (mounted) setLoading(false);
        };
        fetchInsurance();
        return () => { mounted = false; };
    }, [replacementCost, assetClass, locationRisk]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Replacement Cost</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={replacementCost}
                            onChange={e => setReplacementCost(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Asset Class</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                        value={assetClass}
                        onChange={e => setAssetClass(e.target.value)}
                    >
                        <option value="multifamily">Multifamily</option>
                        <option value="industrial">Industrial</option>
                        <option value="retail">Retail</option>
                        <option value="office">Office</option>
                        <option value="single_family">Single Family</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location Risk Multiplier</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                        value={locationRisk}
                        onChange={e => setLocationRisk(Number(e.target.value))}
                    >
                        <option value="0.8">Low Risk (Non-Coastal, Milder Climate)</option>
                        <option value="1.0">Average Risk</option>
                        <option value="1.5">High Wind / Hail Risk (Texas, Midwest)</option>
                        <option value="2.5">Coastal / Hurricane Risk (Florida, Gulf Coast)</option>
                        <option value="3.0">Wildfire Risk (California)</option>
                    </select>
                </div>
            </div>

            <div className="bg-sky-50 text-sky-900 p-8 rounded-xl flex flex-col justify-center items-center text-center border border-sky-100">
                <span className="text-sky-700 text-sm uppercase tracking-widest font-bold mb-2">Estimated Annual Premium</span>
                <span className="text-5xl font-bold">
                    {loading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(premium)}
                </span>
                <span className="text-sky-600 text-sm mt-4">Calculated dynamically by Axiom Engine</span>
            </div>
        </div>
    );
};
