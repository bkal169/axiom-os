import React, { useState } from 'react';
import { calculateROI, calculateCapRate } from '../../lib/calculations';

export const ROICalc: React.FC = () => {
    const [cost, setCost] = useState(1000000);
    const [income, setIncome] = useState(120000);
    const [expenses, setExpenses] = useState(40000);

    const noi = income - expenses;
    const capRate = calculateCapRate(noi, cost);
    // Simplified ROI assuming cash purchase for now
    const roi = calculateROI(noi, cost);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Project Cost</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={cost}
                            onChange={e => setCost(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Annual Gross Income</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={income}
                            onChange={e => setIncome(Number(e.target.value))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Annual Operating Expenses</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                        <input
                            type="number"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={expenses}
                            onChange={e => setExpenses(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                    <span className="block text-xs font-bold text-emerald-600 uppercase">Net Operating Income (NOI)</span>
                    <span className="text-3xl font-bold text-emerald-800">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(noi)}
                    </span>
                    <span className="block text-xs text-emerald-600 mt-1">Annually</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="block text-xs font-bold text-slate-500 uppercase">Cap Rate</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {capRate.toFixed(2)}%
                        </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <span className="block text-xs font-bold text-slate-500 uppercase">Cash-on-Cash</span>
                        <span className="text-2xl font-bold text-slate-800">
                            {roi.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
