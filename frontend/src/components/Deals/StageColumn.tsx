import React from 'react';
import type { Deal, DealStage } from '../../types/deals';
import { STAGE_LABELS } from '../../types/deals';
import { DealCard } from './DealCard';

interface StageColumnProps {
    stage: DealStage;
    deals: Deal[];
    onDealClick: (deal: Deal) => void;
    onDealMove: (deal: Deal, direction: 'next' | 'prev') => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({ stage, deals, onDealClick, onDealMove }) => {
    const totalValue = deals.reduce((sum, d) => sum + (d.projected_value || 0), 0);

    return (
        <div className="flex-shrink-0 w-80 flex flex-col h-full">
            <div className="bg-slate-100 p-3 rounded-t-lg border-b border-white flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-700">{STAGE_LABELS[stage]}</h3>
                    <span className="text-xs text-slate-400">{deals.length} deals</span>
                </div>
                <div className="text-right">
                    <span className="block text-xs font-mono text-slate-500">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalValue)}
                    </span>
                </div>
            </div>

            <div className="bg-slate-50 flex-1 p-2 overflow-y-auto space-y-2 rounded-b-lg border border-slate-200">
                {deals.map(deal => (
                    <DealCard
                        key={deal.id}
                        deal={deal}
                        onClick={onDealClick}
                        onMove={onDealMove}
                    />
                ))}
                {deals.length === 0 && (
                    <div className="text-center py-8 text-slate-300 text-sm italic">
                        No deals
                    </div>
                )}
            </div>
        </div>
    );
};
