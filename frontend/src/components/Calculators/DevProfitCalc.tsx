import React, { useState } from 'react';
import { calculateDevProfit } from '../../lib/calculations';

export const DevProfitCalc: React.FC = () => {
    const [acquisition, setAcquisition] = useState(1000000);
    const [renovation, setRenovation] = useState(500000);
    const [holding, setHolding] = useState(50000);
    const [sellingCosts, setSellingCosts] = useState(100000);
    const [exitValue, setExitValue] = useState(2000000); // ARV

    const totalCost = acquisition + renovation + holding + sellingCosts;
    const profit = calculateDevProfit(exitValue, acquisition, renovation, holding, sellingCosts);
    const roi = (profit / totalCost) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Acquisition Cost</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={acquisition}
                            onChange={e => setAcquisition(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Renovation / Hard Costs</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={renovation}
                            onChange={e => setRenovation(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Holding & Soft Costs</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={holding}
                            onChange={e => setHolding(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Costs (Commissions/Closing)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={sellingCosts}
                            onChange={e => setSellingCosts(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Projected Exit Value (ARV)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-emerald-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50 text-emerald-900 font-bold"
                            value={exitValue}
                            onChange={e => setExitValue(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <span className="block text-xs font-bold text-purple-600 uppercase">Projected Net Profit</span>
                    <span className="text-4xl font-bold text-purple-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(profit)}
                    </span>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-200">
                        <span className="text-sm text-purple-700">Margin / ROI</span>
                        <span className="text-xl font-bold text-purple-900">{roi.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
