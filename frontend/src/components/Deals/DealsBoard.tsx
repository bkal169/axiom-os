import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Deal, DealStage } from '../../types/deals';
import { StageColumn } from './StageColumn';
import { DealDrawer } from './DealDrawer';
import { Plus, Download } from 'lucide-react';
import { exportToCSV } from '../../lib/exports';
import { DealForm } from './DealForm';

const STAGES: DealStage[] = ['sourcing', 'screening', 'due_diligence', 'committee', 'closing', 'asset_mgmt'];

export const DealsBoard: React.FC = () => {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching deals:', error);
        } else {
            setDeals(data as Deal[]);
        }
        setLoading(false);
    };

    const moveDeal = async (deal: Deal, direction: 'next' | 'prev') => {
        const currentIndex = STAGES.indexOf(deal.stage);
        if (currentIndex === -1) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= STAGES.length) return;

        const newStage = STAGES[newIndex];

        // Optimistic update
        setDeals(deals.map(d => d.id === deal.id ? { ...d, stage: newStage } : d));

        const { error } = await supabase
            .from('deals')
            .update({ stage: newStage })
            .eq('id', deal.id);

        if (error) {
            console.error('Failed to move deal:', error);
            fetchDeals(); // Revert
        }
    };

    if (loading) return <div className="p-8">Loading Pipeline...</div>;

    return (
        <div className="flex flex-col h-full bg-white">
            <header className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Deal Pipeline</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => exportToCSV(deals)}
                        className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md flex items-center text-sm font-medium hover:bg-slate-50"
                    >
                        <Download size={16} className="mr-2" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium hover:bg-slate-800"
                    >
                        <Plus size={16} className="mr-2" />
                        Add Deal
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex space-x-4 h-full min-w-max">
                    {STAGES.map(stage => (
                        <StageColumn
                            key={stage}
                            stage={stage}
                            deals={deals.filter(d => d.stage === stage)}
                            onDealClick={setSelectedDeal}
                            onDealMove={moveDeal}
                        />
                    ))}
                </div>
            </div>

            {selectedDeal && (
                <DealDrawer
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={(updated) => {
                        setDeals(deals.map(d => d.id === updated.id ? updated : d));
                        setSelectedDeal(updated);
                    }}
                />
            )}

            {isCreating && (
                <DealForm
                    onClose={() => setIsCreating(false)}
                    onSuccess={fetchDeals}
                    currentCount={deals.length}
                />
            )}
        </div>
    );
};
