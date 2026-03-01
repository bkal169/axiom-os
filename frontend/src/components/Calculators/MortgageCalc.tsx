import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export const MortgageCalc: React.FC = () => {
    const [loanAmount, setLoanAmount] = useState(500000);
    const [rate, setRate] = useState(6.5);
    const [years, setYears] = useState(30);
    const [payment, setPayment] = useState(0);
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchSchedule = async () => {
            setLoading(true);
            const data = await api.getMortgageSchedule(loanAmount, rate, years);
            if (mounted && data) {
                setPayment(data.monthly_payment);
                setSchedule(data.amort_preview || []);
            }
            if (mounted) setLoading(false);
        };
        fetchSchedule();
        return () => { mounted = false; };
    }, [loanAmount, rate, years]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Loan Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                                value={loanAmount}
                                onChange={e => setLoanAmount(Number(e.target.value))}
                            />
                        </div>
                        <input
                            type="range" min="50000" max="5000000" step="10000"
                            className="w-full mt-2"
                            value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Interest Rate (%)</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={rate}
                            step="0.1"
                            onChange={e => setRate(Number(e.target.value))}
                        />
                        <input
                            type="range" min="2" max="15" step="0.125"
                            className="w-full mt-2"
                            value={rate} onChange={e => setRate(Number(e.target.value))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Term (Years)</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                            value={years}
                            onChange={e => setYears(Number(e.target.value))}
                        >
                            <option value="15">15 Years</option>
                            <option value="20">20 Years</option>
                            <option value="25">25 Years</option>
                            <option value="30">30 Years</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-xl flex flex-col justify-center items-center text-center">
                    <span className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-2">Monthly Payment</span>
                    <span className="text-5xl font-bold">
                        {loading ? '...' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payment)}
                    </span>
                    <span className="text-slate-400 text-sm mt-4">Principal & Interest Only</span>
                </div>
            </div>

            {/* Amortization Schedule Preview */}
            {schedule.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">Year 1 Amortization Schedule</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schedule.map((row) => (
                                    <tr key={row.period} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.period}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.payment)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.principal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.interest)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.balance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
