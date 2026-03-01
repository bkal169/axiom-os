
import React from 'react';
import type { Deal } from '../../types/deals';
import { MapPin, Lock } from 'lucide-react';
// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';

interface DealCardProps {
    deal: Deal;
    onClick: (deal: Deal) => void;
    onMove: (deal: Deal, direction: 'next' | 'prev') => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onClick, onMove }) => {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer relative group"
            onClick={() => onClick(deal)}
        >
            {deal.internal_only && (
                <div className="absolute top-2 right-2 text-amber-600 bg-amber-50 px-2 py-0.5 text-xs rounded-full flex items-center border border-amber-200">
                    <Lock size={10} className="mr-1" /> Internal
                </div>
            )}

            <div className="mb-2">
                <h3 className="font-semibold text-slate-800 truncate pr-16">{deal.project_name}</h3>
                <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{deal.location}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-slate-50 p-1.5 rounded text-center">
                    <span className="block text-xs text-slate-400">Value</span>
                    <span className="font-medium text-slate-700">{formatMoney(deal.projected_value)}</span>
                </div>
                <div className="bg-slate-50 p-1.5 rounded text-center">
                    <span className="block text-xs text-slate-400">Cost</span>
                    <span className="font-medium text-slate-700">{formatMoney(deal.acquisition_price + deal.renovation_cost)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <button
                    className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 hover:bg-slate-50 rounded"
                    onClick={(e) => { e.stopPropagation(); onMove(deal, 'prev'); }}
                    disabled={deal.stage === 'sourcing'}
                >
                    ← Prev
                </button>
                <span className="text-xs text-slate-300 font-mono">
                    {new Date(deal.updated_at).toLocaleDateString()}
                </span>
                <button
                    className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 hover:bg-slate-50 rounded"
                    onClick={(e) => { e.stopPropagation(); onMove(deal, 'next'); }}
                    disabled={deal.stage === 'sold' || deal.stage === 'dead'}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};
