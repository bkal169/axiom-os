import React, { useState, useEffect, useCallback } from 'react';
import { type Deal, STAGE_LABELS } from '../../types/deals';
import { X, Calendar, MapPin, Database, Sparkles, Plus, Users, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { DeckBuilder } from './DeckBuilder';
import type { Contact, DealContact } from '../../types/crm';
import type { Lease } from '../../types/tenants';
import type { ProjectionResults } from '../../types/finance';

interface DealDrawerProps {
    deal: Deal;
    onClose: () => void;
    onUpdate: (updatedDeal: Deal) => void;
}

export const DealDrawer: React.FC<DealDrawerProps> = ({ deal, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'financials' | 'leasing' | 'debt' | 'intel' | 'team'>('details');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showDeckBuilder, setShowDeckBuilder] = useState(false);

    // Leasing State
    const [leases, setLeases] = useState<Lease[]>([]);

    // Team State
    const [linkedContacts, setLinkedContacts] = useState<DealContact[]>([]);
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('Investor');
    const [isLinking, setIsLinking] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);

    // Sandbox State
    const [scenarioPrice, setScenarioPrice] = useState(deal.acquisition_price);
    const [projections, setProjections] = useState<ProjectionResults | null>(null);
    const [loadingProjections, setLoadingProjections] = useState(false);

    const fetchProjections = useCallback(async () => {
        setLoadingProjections(true);
        try {
            // Estimate inputs based on deal data and sandbox
            const inputs = {
                purchase_price: scenarioPrice,
                loan_amount: scenarioPrice * 0.7, // Assume 70% LTC
                equity: scenarioPrice * 0.3,
                interest_rate: 0.08, // Generic assumption for now
                amort_years: 30,
                hold_years: 5,
                noi_year1: deal.projected_value * 0.06, // Estimate 6% Cap Rate entry NOI if missing
                noi_growth: 0.02,
                exit_cap_rate: 0.06,
                sale_cost_pct: 0.03
            };
            const results = await api.getProjections(inputs);
            setProjections(results);
        } catch (e) {
            console.error('Failed to fetch projections:', e);
        } finally {
            setLoadingProjections(false);
        }
    }, [scenarioPrice, deal.projected_value]);

    // Reset scenario when deal changes
    useEffect(() => {
        setScenarioPrice(deal.acquisition_price);
    }, [deal.id, deal.acquisition_price]);

    useEffect(() => {
        if (activeTab === 'financials') {
            fetchProjections();
        }
    }, [activeTab, fetchProjections]);

    const fetchTeam = useCallback(async () => {
        setLoadingTeam(true);
        try {
            const { data, error } = await supabase
                .from('deal_contacts')
                .select(`
                    *,
                    contact:contacts(*)
                `)
                .eq('deal_id', deal.id);

            if (error) throw error;
            setLinkedContacts(data || []);
        } catch (e) {
            console.error('Error fetching team:', e);
        } finally {
            setLoadingTeam(false);
        }
    }, [deal.id]);

    const fetchAllContacts = async () => {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('last_name', { ascending: true });

        if (!error && data) {
            setAllContacts(data);
        }
    };

    const fetchLeases = useCallback(async () => {
        try {
            const data = await api.getLeases(deal.id);
            setLeases(data);
        } catch (error) {
            console.error('Error fetching leases:', error);
        }
    }, [deal.id]);

    useEffect(() => {
        if (activeTab === 'team') {
            fetchTeam();
            fetchAllContacts();
        }
        if (activeTab === 'leasing') {
            fetchLeases();
        }
    }, [activeTab, fetchTeam, fetchLeases]);

    const handleLinkContact = async () => {
        if (!selectedContactId) return;
        setIsLinking(true);
        try {
            const { error } = await supabase
                .from('deal_contacts')
                .insert({
                    deal_id: deal.id,
                    contact_id: selectedContactId,
                    role: selectedRole
                });

            if (error) throw error;
            setSelectedContactId('');
            fetchTeam();
        } catch (e) {
            console.error('Error linking contact:', e);
            alert('Failed to link contact.');
        } finally {
            setIsLinking(false);
        }
    };

    const handleUnlinkContact = async (linkId: string) => {
        if (!confirm('Remove this contact from the deal team?')) return;
        try {
            const { error } = await supabase
                .from('deal_contacts')
                .delete()
                .eq('id', linkId);

            if (error) throw error;
            fetchTeam();
        } catch (e) {
            console.error('Error unlinking contact:', e);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const analysis = await api.analyzeDeal(deal);
            const timestamp = new Date().toLocaleString();
            const newNotes = (deal.notes ? deal.notes + '\n\n' : '') +
                `--- AI Analysis (${timestamp}) ---\n${analysis}`;

            // Save to DB
            const { error } = await supabase
                .from('deals')
                .update({ notes: newNotes })
                .eq('id', deal.id);

            if (error) throw error;

            // Update local state
            onUpdate({ ...deal, notes: newNotes });
            alert('Analysis added to Notes!');
        } catch (e) {
            console.error(e);
            alert('Analysis failed. Ensure backend is running.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start bg-slate-50">
                    <div>
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded uppercase font-bold tracking-wider">
                                {STAGE_LABELS[deal.stage]}
                            </span>
                            {deal.internal_only && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded uppercase font-bold tracking-wider border border-amber-200">
                                    Internal
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{deal.project_name}</h2>
                        <div className="flex items-center text-slate-500 text-sm mt-1">
                            <MapPin size={14} className="mr-1" />
                            {deal.location}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <Sparkles size={16} className="mr-1.5" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Close Drawer">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-200 flex space-x-6 overflow-x-auto">
                    {[
                        { id: 'details', label: 'Details' },
                        { id: 'financials', label: 'Financials' },
                        { id: 'leasing', label: 'Leasing' },
                        { id: 'debt', label: 'Debt (C.M.)' },
                        { id: 'intel', label: 'Linked Intel' },
                        { id: 'team', label: 'Team' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'details' | 'financials' | 'intel' | 'team')}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Asset Type</label>
                                    <p className="text-slate-800">{deal.asset_type}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Created</label>
                                    <p className="text-slate-800 flex items-center">
                                        <Calendar size={14} className="mr-1 text-slate-400" />
                                        {new Date(deal.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Notes</label>
                                <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 min-h-[100px] whitespace-pre-wrap">
                                    {deal.notes || "No notes added."}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {deal.tags && deal.tags.length > 0 ? (
                                        deal.tags.map(tag => (
                                            <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic text-sm">No tags</span>
                                    )}
                                </div>
                            </div>

                            {/* Zoning Capacity (Simulated for Demo) */}
                            {deal.tags?.some(t => ["T6-8", "MU-3", "RM-1", "CG", "IL"].includes(t.toUpperCase())) && (
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                    <h4 className="text-xs font-extrabold text-indigo-900 uppercase mb-3 flex items-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                                        Zoning Capacity
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] text-indigo-400 uppercase font-bold">Max Density</span>
                                            <div className="text-lg font-mono font-bold text-indigo-900">
                                                {deal.tags.includes('T6-8') ? '150 u/ac' : deal.tags.includes('MU-3') ? '80 u/ac' : '25 u/ac'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-indigo-400 uppercase font-bold">Max FAR</span>
                                            <div className="text-lg font-mono font-bold text-indigo-900">
                                                {deal.tags.includes('T6-8') ? '5.0' : deal.tags.includes('MU-3') ? '3.0' : '1.5'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-6">
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-3">Property Photos</label>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {deal.image_urls?.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square bg-slate-100 rounded overflow-hidden group border border-slate-200 shadow-sm">
                                            <img src={url} alt={`Property ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                            <button
                                                onClick={() => {
                                                    if (confirm("Remove this photo?")) {
                                                        const newUrls = deal.image_urls.filter((_, i) => i !== idx);
                                                        api.updateDeal(deal.id, { image_urls: newUrls }).then(() => onUpdate({ ...deal, image_urls: newUrls }));
                                                    }
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                                title="Remove Photo"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const url = prompt("Enter institutional image URL (JPEG/PNG):");
                                            if (url && url.startsWith('http')) {
                                                const newUrls = [...(deal.image_urls || []), url];
                                                api.updateDeal(deal.id, { image_urls: newUrls }).then(() => onUpdate({ ...deal, image_urls: newUrls }));
                                            }
                                        }}
                                        className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group"
                                    >
                                        <Plus size={24} className="mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'leasing' && (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Current Rent Roll</h3>
                                    <button
                                        onClick={() => alert('Add Lease feature coming soon!')}
                                        className="text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-800"
                                    >
                                        Add Lease
                                    </button>
                                </div>
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white text-slate-400 uppercase font-bold border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-3">Tenant</th>
                                            <th className="px-4 py-3">Sqft</th>
                                            <th className="px-4 py-3">Rent (Y)</th>
                                            <th className="px-4 py-3">Expiry</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leases.filter(l => l.status === 'active').length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No active leases found.</td>
                                            </tr>
                                        ) : (
                                            leases.filter(l => l.status === 'active').map(lease => (
                                                <tr key={lease.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{lease.tenant?.name || 'Unknown'}</td>
                                                    <td className="px-4 py-3 font-mono">{lease.sqft?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 font-mono text-emerald-600">${lease.annual_rent?.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-slate-500">{lease.end_date || 'N/A'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4 flex items-center">
                                    <Sparkles size={16} className="mr-2 text-indigo-500" />
                                    Leasing Pipeline
                                </h3>
                                <div className="space-y-3">
                                    {leases.filter(l => l.status === 'pipeline').length === 0 ? (
                                        <div className="text-center py-4 text-indigo-400 text-xs italic">No pipeline tenants.</div>
                                    ) : (
                                        leases.filter(l => l.status === 'pipeline').map(lease => (
                                            <div key={lease.id} className="bg-white p-3 rounded border border-indigo-200 shadow-sm flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{lease.tenant?.name}</p>
                                                    <p className="text-[10px] text-slate-500">Proposed: {lease.sqft?.toLocaleString()} sqft @ ${lease.annual_rent?.toLocaleString()}/yr</p>
                                                </div>
                                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">LOI Stage</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'debt' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Estimated Debt Capacity</h3>
                                    <div className="text-3xl font-mono font-bold">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(deal.acquisition_price * 0.75)}
                                    </div>
                                    <p className="text-slate-400 text-xs mt-2">Based on target 75% LTV Senior Debt</p>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Database size={120} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                                    <Users size={16} className="mr-2 text-indigo-500" />
                                    Institutional Lender Matches
                                </h3>

                                <div className="grid gap-3">
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Summit Capital Partners</h4>
                                                <p className="text-xs text-slate-500">Focus: {deal.asset_type} | Max LTV: 75%</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Strong Match</span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Senior Debt</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Fixed Rate</span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Beacon Bridge Lending</h4>
                                                <p className="text-xs text-slate-500">Focus: Value-Add | Max LTV: 80%</p>
                                            </div>
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Bridge Option</span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Bridge Loan</span>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Floating</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Acquisition Price</label>
                                    <p className="text-xl font-mono text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.acquisition_price)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Renovation Cost</label>
                                    <p className="text-xl font-mono text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.renovation_cost)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded border border-slate-100">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Total Cost (Approx)</label>
                                    <p className="text-xl font-mono text-slate-900">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.acquisition_price + deal.renovation_cost)}
                                    </p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded border border-emerald-100">
                                    <label className="text-xs font-bold text-emerald-600 uppercase">Projected Value</label>
                                    <p className="text-xl font-mono text-emerald-800">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.projected_value)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-bold text-slate-800 mb-4">Capital Stack</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Capital Raised</span>
                                            <span className="font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(deal.capital_raised)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="h-full bg-indigo-600 rounded-full progress-fill" style={{ '--progress-width': `${Math.min(100, (deal.capital_raised / (deal.capital_required || 1)) * 100)}%` } as React.CSSProperties} />
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                                            <span>Target: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(deal.capital_required)}</span>
                                            <span>{Math.round((deal.capital_raised / (deal.capital_required || 1)) * 100)}% Funded</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Deal Sandbox */}
                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center">
                                        <Sparkles size={16} className="mr-2 text-indigo-500" />
                                        Deal Sandbox
                                    </h3>
                                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">Changes are local only</span>
                                </div>
                                <div className="space-y-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <label htmlFor="scenario-price">Scenario Price</label>
                                            <span className="font-mono text-indigo-600">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(scenarioPrice)}
                                            </span>
                                        </div>
                                        <input
                                            id="scenario-price"
                                            type="range"
                                            min={Math.max(0, deal.acquisition_price * 0.5)}
                                            max={deal.acquisition_price * 1.5}
                                            step={1000}
                                            value={scenarioPrice}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                            onChange={(e) => setScenarioPrice(parseInt(e.target.value))}
                                        />
                                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                                            <span>-50%</span>
                                            <span>+50%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Unlevered IRR</span>
                                            <div className="text-lg font-mono font-bold text-emerald-600 mt-1">
                                                {loadingProjections ? '...' : (projections?.irr_unlevered ? `${(projections.irr_unlevered * 100).toFixed(1)}%` : '--')}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Cash on Cash</span>
                                            <div className="text-lg font-mono font-bold text-indigo-600 mt-1">
                                                {loadingProjections ? '...' : (projections?.coc_year1 ? `${(projections.coc_year1 * 100).toFixed(1)}%` : '--')}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-400 uppercase font-bold">DSCR (Y1)</span>
                                            <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                                                {loadingProjections ? '...' : (projections?.dscr_year1 ? projections.dscr_year1.toFixed(2) : '--')}
                                            </div>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                            <span className="text-xs text-slate-400 uppercase font-bold">Levered IRR</span>
                                            <div className="text-lg font-mono font-bold text-emerald-600 mt-1">
                                                {loadingProjections ? '...' : (projections?.irr_levered ? `${(projections.irr_levered * 100).toFixed(1)}%` : '--')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'intel' && (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                                <Database size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">Linked Intel</h3>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">
                                Connect market data, zoning records, and rent comps to this deal.
                            </p>
                            <button className="mt-6 px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                Link Data Record
                            </button>
                        </div>
                    )}

                    {activeTab === 'team' && (
                        <div className="space-y-6">
                            {/* Link Form */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                    <Plus size={16} className="mr-2" />
                                    Add Team Member
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                                        title="Select Contact"
                                        value={selectedContactId}
                                        onChange={(e) => setSelectedContactId(e.target.value)}
                                    >
                                        <option value="">Select Contact...</option>
                                        {allContacts
                                            .filter(c => !linkedContacts.some(lc => lc.contact_id === c.id))
                                            .map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.first_name} {c.last_name} ({c.type})
                                                </option>
                                            ))}
                                    </select>
                                    <select
                                        className="border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                                        title="Select Role"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="Investor">Investor</option>
                                        <option value="Lead Investor">Lead Investor</option>
                                        <option value="Broker">Broker</option>
                                        <option value="Attorney">Attorney</option>
                                        <option value="Architect">Architect</option>
                                        <option value="Contractor">Contractor</option>
                                    </select>
                                </div>
                                <button
                                    onClick={handleLinkContact}
                                    disabled={!selectedContactId || isLinking}
                                    className="w-full bg-slate-900 text-white rounded py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {isLinking ? 'Linking...' : 'Link to Deal'}
                                </button>
                            </div>

                            {/* Current Team */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-700 flex items-center">
                                    <Users size={16} className="mr-2" />
                                    Current Team ({linkedContacts.length})
                                </h3>

                                {loadingTeam ? (
                                    <div className="text-center py-8 text-slate-400">Loading team...</div>
                                ) : linkedContacts.length === 0 ? (
                                    <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded text-slate-400 text-sm">
                                        No team members linked yet.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {linkedContacts.map(lc => (
                                            <div key={lc.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded shadow-sm">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-3">
                                                        {lc.contact?.first_name?.[0]}{lc.contact?.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {lc.contact?.first_name} {lc.contact?.last_name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{lc.role}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnlinkContact(lc.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-slate-50 flex justify-between space-x-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowDeckBuilder(true)}
                            className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-100"
                        >
                            Export PDF
                        </button>
                        <button className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 text-sm hover:bg-slate-100">
                            Copy Summary
                        </button>
                    </div>
                    <button className="px-6 py-2 bg-slate-900 text-white rounded font-medium text-sm hover:bg-slate-800">
                        Save Changes
                    </button>
                </div>
                {/* Deck Builder Modal */}
                {showDeckBuilder && (
                    <DeckBuilder deal={deal} leases={leases} onClose={() => setShowDeckBuilder(false)} />
                )}
            </div>
        </div>
    );
};
