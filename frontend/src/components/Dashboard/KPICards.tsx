import React from 'react';
import type { DashboardMetrics } from '../../lib/dashboard';
import { TrendingUp, DollarSign, PieChart, AlertCircle } from 'lucide-react';

interface KPICardsProps {
    metrics: DashboardMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
    const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Pipeline Value</span>
                    <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatMoney(metrics.pipelineValue)}</div>
                <div className="text-xs text-slate-500 mt-1">{metrics.activeDealsCount} active deals</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Projected Profit</span>
                    <DollarSign size={16} className="text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatMoney(metrics.projectedProfit)}</div>
                <div className="text-xs text-slate-500 mt-1">{metrics.weightedROI.toFixed(1)}% Wtd. ROI</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Capital Gap</span>
                    <PieChart size={16} className="text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatMoney(metrics.capitalGap)}</div>
                <div className="text-xs text-slate-500 mt-1">
                    Raised {formatMoney(metrics.capitalRaised)} of {formatMoney(metrics.capitalRequired)} ({(metrics.capitalRequired > 0 ? metrics.capitalRaised / metrics.capitalRequired * 100 : 0).toFixed(0)}%)
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Cost</span>
                    <AlertCircle size={16} className="text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formatMoney(metrics.totalCost)}</div>
                <div className="text-xs text-slate-500 mt-1">Acquisition + Reno</div>
            </div>
        </div>
    );
};
