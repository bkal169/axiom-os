import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { type IntelRecord, type IntelType, INTEL_LABELS } from '../../types/intel';
import { IntelCard } from './IntelCard';
import { Search, Filter, Lock, Database, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Gating } from '../../lib/gating';
import { api, type MarketIntel } from '../../lib/api';
import { Activity, Wifi, WifiOff } from 'lucide-react';

const LiveMarketSection: React.FC = () => {
    const [stats, setStats] = useState<MarketIntel | null>(null);
    const [connected, setConnected] = useState(false);

    const checkConnection = async () => {
        const isHealthy = await api.getHealth();
        setConnected(isHealthy);
        if (isHealthy) {
            const data = await api.getMarketIntel();
            setStats(data);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    if (!connected) {
        return (
            <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                    <WifiOff className="text-orange-500 mr-3" size={20} />
                    <div>
                        <h3 className="font-bold text-orange-800">Engine Disconnected</h3>
                        <p className="text-sm text-orange-600">Ensure the Python backend is running on port 8001.</p>
                    </div>
                </div>
                <button onClick={checkConnection} className="px-3 py-1 bg-white border border-orange-300 rounded text-sm font-medium text-orange-700 hover:bg-orange-100">
                    Retry
                </button>
            </div>
        );
    }

    if (!stats) return <div className="mb-8 p-4 bg-slate-100 rounded-lg animate-pulse h-24"></div>;

    return (
        <div className="mb-8">
            <div className="flex items-center mb-4">
                <Wifi className="text-emerald-500 mr-2" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Live Market Pulse</h2>
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm relative overflow-hidden">
                    <label className="text-xs font-bold text-slate-400 uppercase">10yr Treasury</label>
                    <div className="flex items-end mt-1">
                        <span className="text-2xl font-bold text-slate-900">{stats.rates.treasury_10yr}%</span>
                        <div className="ml-2 flex flex-col justify-end pb-1">
                            <span className="text-[10px] text-slate-400 leading-none mb-0.5">{stats.rates.date}</span>
                            {stats.rates.source === 'fred' && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded font-bold w-fit">FRED API</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase">Pop. Growth</label>
                    <div className="flex items-center text-emerald-600 mt-1">
                        <Activity size={16} className="mr-1" />
                        <span className="text-2xl font-bold">+{stats.census.population_growth}%</span>
                    </div>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase">Median Income</label>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(stats.census.median_income)}
                    </span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <label className="text-xs font-bold text-slate-400 uppercase">Unemployment</label>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.census.unemployment}%</span>
                </div>
            </div>
        </div>
    );
};

export const DataPage: React.FC = () => {
    const { profile, user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<IntelType | 'ALL'>('ALL');
    const [selectedState, setSelectedState] = useState<string>('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [records, setRecords] = useState<IntelRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [seeding, setSeeding] = useState(false);

    // Gating check
    const canAccess = Gating.canUseDataLayer(profile);

    const fetchRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('intel_records')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching intel:', error);
        } else {
            setRecords(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (canAccess) {
            fetchRecords();
        }
    }, [canAccess]);

    const seedDemoData = async () => {
        if (!user) return;
        setSeeding(true);
        const demoData = [
            {
                user_id: user.id, record_type: 'ZONING', title: 'Miami-Dade T6-8-O Zoning', state: 'FL', county: 'Miami-Dade', city: 'Miami', zipcode: '33127',
                metrics: { max_height: 8, density: "150 du/acre", far: 5.0 },
                source: 'Miami 21 Code', notes: 'High density urban core zoning allowing mixed use.',
                geo_tags: ['Urban Core', 'T6-8'], internal_only: false
            },
            {
                user_id: user.id, record_type: 'MARKET', title: 'Q4 2025 Multifamily Report - Orlando', state: 'FL', county: 'Orange', city: 'Orlando', zipcode: '32801',
                metrics: { cap_rate_avg: 5.2, rent_growth_yoy: 3.5, vacancy_rate: 4.8 },
                source: 'Costar', notes: 'Orlando market stabilizing after unparalleled growth.',
                geo_tags: ['Multifamily', 'Market Report'], internal_only: false
            },
            {
                user_id: user.id, record_type: 'RENT_COMP', title: 'Wynwood 25 - 1BR', state: 'FL', county: 'Miami-Dade', city: 'Miami', zipcode: '33127',
                metrics: { sqft: 750, rent: 2850, psf: 3.80, year_built: 2019 },
                source: 'Apartments.com', notes: 'Comparable generic luxury comp.',
                geo_tags: ['Wynwood', 'Luxury'], internal_only: false
            },
            {
                user_id: user.id, record_type: 'DEMOGRAPHICS', title: 'Tampa Bay Migration Trends', state: 'FL', county: 'Hillsborough', city: 'Tampa', zipcode: '33602',
                metrics: { population_growth: 2.1, median_income: 65000, unemployment: 2.9 },
                source: 'US Census Bureau', notes: 'Strong net migration from Northeast.',
                geo_tags: ['Migration', 'Census'], internal_only: false
            }
        ];

        const { error } = await supabase.from('intel_records').insert(demoData);
        if (error) {
            alert('Error seeding data: ' + error.message);
        } else {
            alert('Demo data seeded successfully!');
            fetchRecords();
        }
        setSeeding(false);
    };

    const filteredRecords = records.filter(r => {
        const matchesSearch =
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.county.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.geo_tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = selectedType === 'ALL' || r.record_type === selectedType;
        const matchesState = selectedState === 'ALL' || r.state === selectedState;

        return matchesSearch && matchesType && matchesState;
    });

    const uniqueStates = Array.from(new Set(records.map(r => r.state))).sort();

    if (!canAccess) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-slate-100 p-6 rounded-full mb-6">
                    <Lock size={48} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Market Intelligence Locked</h2>
                <p className="text-slate-500 max-w-md mb-8">
                    Upgrade to the PRO plan to access our searchable database of zoning codes, rent comps, and market reports.
                </p>
                <a href="/pricing" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    Upgrade to PRO
                </a>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Market Intelligence</h1>
                        <p className="text-slate-500 text-sm">Search detailed records for off-market deal analysis.</p>
                    </div>
                    {records.length === 0 && !loading && (
                        <button
                            onClick={seedDemoData}
                            disabled={seeding}
                            className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                        >
                            <Database size={16} className="mr-2" />
                            {seeding ? 'Seeding...' : 'Seed Demo Data'}
                        </button>
                    )}
                </div>

                <div className="mt-6 flex flex-col space-y-4">
                    <div className="flex space-x-4">
                        <div className="relative flex-1 max-w-2xl">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by city, county, keyword, or tag..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-gray-300 text-slate-700 hover:bg-gray-50'}`}
                        >
                            <Filter size={18} className="mr-2" />
                            Filters
                            {showFilters ? <X size={14} className="ml-2" /> : null}
                        </button>
                    </div>

                    {/* Filter Bar */}
                    {showFilters && (
                        <div className="flex space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Record Type</label>
                                <select
                                    aria-label="Filter by Record Type"
                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-slate-900 outline-none min-w-[150px]"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value as IntelType | 'ALL')}
                                >
                                    <option value="ALL">All Types</option>
                                    {Object.entries(INTEL_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State</label>
                                <select
                                    aria-label="Filter by State"
                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-slate-900 outline-none min-w-[100px]"
                                    value={selectedState}
                                    onChange={(e) => setSelectedState(e.target.value)}
                                >
                                    <option value="ALL">All States</option>
                                    {uniqueStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">

                {/* Live Data Section */}
                <LiveMarketSection />

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        Saved Intel Records
                        <span className="ml-2 text-sm font-normal text-slate-400">({filteredRecords.length})</span>
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading Intelligence...</div>
                ) : filteredRecords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRecords.map(record => (
                            <IntelCard
                                key={record.id}
                                record={record}
                                onClick={(r) => alert(`Opening record: ${r.title}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <Database size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No Records Found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">
                            Try adjusting your filters or search terms. If you're just getting started, try seeding some demo data.
                        </p>
                        {records.length === 0 && (
                            <button
                                onClick={seedDemoData}
                                disabled={seeding}
                                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {seeding ? 'Seeding...' : 'Seed Demo Data'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default DataPage;
