
import React, { useState } from 'react';
import { DollarSign, Percent, Building, ShieldCheck, Hammer } from 'lucide-react';
import { MortgageCalc } from './MortgageCalc';
import { ROICalc } from './ROICalc';
import { DevProfitCalc } from './DevProfitCalc';
import { InsuranceCalc } from './InsuranceCalc';
import { ConstructionCalc } from './ConstructionCalc';

export const CalculatorHub: React.FC = () => {
    const [activeCalc, setActiveCalc] = useState<'mortgage' | 'roi' | 'dev' | 'insurance' | 'construction'>('mortgage');

    return (
        <div className="p-8 h-full bg-slate-50 overflow-y-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Financial Tools</h1>
                <p className="text-slate-500 text-sm">Underwriting and analysis calculators for your deals.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveCalc('mortgage')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeCalc === 'mortgage' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <DollarSign size={18} className="mr-3 text-emerald-500" />
                        <span className="font-medium text-sm">Mortgage Calculator</span>
                    </button>
                    <button
                        onClick={() => setActiveCalc('roi')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeCalc === 'roi' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Percent size={18} className="mr-3 text-blue-500" />
                        <span className="font-medium text-sm">Flip ROI Analysis</span>
                    </button>
                    <button
                        onClick={() => setActiveCalc('dev')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeCalc === 'dev' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Building size={18} className="mr-3 text-purple-500" />
                        <span className="font-medium text-sm">Dev Profit (New Build)</span>
                    </button>
                    <button
                        onClick={() => setActiveCalc('insurance')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeCalc === 'insurance' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <ShieldCheck size={18} className="mr-3 text-sky-500" />
                        <span className="font-medium text-sm">Insurance Estimator</span>
                    </button>
                    <button
                        onClick={() => setActiveCalc('construction')}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeCalc === 'construction' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        <Hammer size={18} className="mr-3 text-amber-500" />
                        <span className="font-medium text-sm">Construction Estimator</span>
                    </button>
                </div>

                {/* Calculator Area */}
                <div className="lg:col-span-3">
                    {activeCalc === 'mortgage' && <MortgageCalc />}
                    {activeCalc === 'roi' && <ROICalc />}
                    {activeCalc === 'dev' && <DevProfitCalc />}
                    {activeCalc === 'insurance' && <InsuranceCalc />}
                    {activeCalc === 'construction' && <ConstructionCalc />}
                </div>
            </div>
        </div>
    );
};
