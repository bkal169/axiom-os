import React from 'react';
import { type Deal, STAGE_LABELS } from '../../types/deals';

interface StageDistributionProps {
    deals: Deal[];
}

export const StageDistribution: React.FC<StageDistributionProps> = ({ deals }) => {
    const activeDeals = deals.filter(d => d.stage !== 'dead' && d.stage !== 'sold');
    const total = activeDeals.length;

    const counts = activeDeals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const stages = Object.keys(STAGE_LABELS).filter(s => s !== 'dead' && s !== 'sold');

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-4">Pipeline Distribution</h3>
            <div className="space-y-4">
                {stages.map(stage => {
                    const count = counts[stage] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={stage}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">{STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}</span>
                                <span className="text-slate-900 font-medium">{count}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="h-full bg-indigo-500 rounded-full progress-fill"
                                    style={{ '--progress-width': `${percentage}%` } as React.CSSProperties}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {total === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">No active deals</p>
            )}
        </div>
    );
};
