
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Deal } from '../../types/deals';
import { computeMetrics, generateAlerts, type DashboardMetrics, type DashboardAlert } from '../../lib/dashboard';
import { KPICards } from './KPICards';
import { AlertsPanel } from './AlertsPanel';
import { StageDistribution } from './StageDistribution';
import { Plus, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DealDrawer } from '../Deals/DealDrawer';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
    const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('deals')
                .select('*');

            if (error) {
                console.error('Error loading dashboard data:', error);
            } else if (data) {
                const dealData = data as Deal[];
                setDeals(dealData);
                setMetrics(computeMetrics(dealData));
                setAlerts(generateAlerts(dealData));
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectedDeal = deals.find(d => d.id === selectedDealId);

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-8 h-full bg-gray-50 overflow-y-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mission Control</h1>
                    <p className="text-slate-500 text-sm">Welcome back. Here is your portfolio at a glance.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => navigate('/deals')}
                        className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 flex items-center"
                    >
                        View Pipeline
                        <ChevronRight size={16} className="ml-1" />
                    </button>
                    <button
                        onClick={() => navigate('/deals')}
                        className="px-4 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 flex items-center"
                    >
                        <Plus size={16} className="mr-2" />
                        New Deal
                    </button>
                </div>
            </header>

            {metrics && <KPICards metrics={metrics} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                    <AlertsPanel alerts={alerts} onOpenDeal={setSelectedDealId} />

                    {/* Recent Activity / Pipeline Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-semibold text-slate-800">Top Opportunities</h3>
                        </div>
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Project</th>
                                    <th className="px-6 py-3">Stage</th>
                                    <th className="px-6 py-3 text-right">Value</th>
                                    <th className="px-6 py-3 text-right">Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals
                                    .filter(d => d.stage !== 'dead' && d.stage !== 'sold')
                                    .sort((a, b) => (b.projected_profit || 0) - (a.projected_profit || 0))
                                    .slice(0, 5)
                                    .map(deal => (
                                        <tr
                                            key={deal.id}
                                            className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setSelectedDealId(deal.id)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{deal.project_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {deal.stage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(deal.projected_value)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(deal.projected_profit || 0)}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <StageDistribution deals={deals} />

                    <div className="mt-6 bg-slate-900 rounded-lg p-6 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Pro Analytics</h3>
                            <p className="text-slate-400 text-sm mb-4">Unlock deeper market insights and advanced reporting.</p>
                            <button onClick={() => navigate('/pricing')} className="bg-white text-slate-900 px-4 py-2 rounded text-sm font-bold w-full hover:bg-slate-100">
                                Upgrade Plan
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500 rounded-full opacity-20 blur-xl"></div>
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
                    </div>
                </div>
            </div>

            {selectedDeal && (
                <DealDrawer
                    deal={selectedDeal}
                    onClose={() => setSelectedDealId(null)}
                    onUpdate={() => fetchData()}
                />
            )}
        </div>
    );
};
export default DashboardPage;
