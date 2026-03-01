import React, { useState } from 'react';
import { X, FileText, Image, Layout, Download, Sparkles } from 'lucide-react';
import type { Deal } from '../../types/deals';
import { exportToPDF, type DeckOptions } from '../../lib/exports';
import { type Lease } from '../../types/tenants';

interface DeckBuilderProps {
    deal: Deal;
    leases?: Lease[];
    onClose: () => void;
}

export const DeckBuilder: React.FC<DeckBuilderProps> = ({ deal, leases = [], onClose }) => {
    const [options, setOptions] = useState<DeckOptions>({
        includeCover: true,
        includeFinancials: true,
        includeLeasing: true,
        includePhotos: true,
        includeMap: false,     // Not implemented yet
        includeAgentMemo: true
    });

    const handleExport = () => {
        exportToPDF(deal, options, leases);
        onClose();
    };

    const toggleOption = (key: keyof DeckOptions) => {
        setOptions((prev: DeckOptions) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Investor Deck Builder</h2>
                        <p className="text-slate-400 text-sm mt-1">Select slides to include in your PDF.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors" title="Close Builder">
                        <X size={24} />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 space-y-4">
                    <div
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${options.includeCover ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                        onClick={() => toggleOption('includeCover')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${options.includeCover ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Layout size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${options.includeCover ? 'text-indigo-900' : 'text-slate-700'}`}>Cover Page</h3>
                            <p className="text-xs text-slate-500">Professional title page with project details.</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${options.includeFinancials ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                        onClick={() => toggleOption('includeFinancials')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${options.includeFinancials ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${options.includeFinancials ? 'text-indigo-900' : 'text-slate-700'}`}>Executive Summary</h3>
                            <p className="text-xs text-slate-500">Key financials, capital stack, and investment notes.</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${options.includeAgentMemo ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                        onClick={() => toggleOption('includeAgentMemo')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${options.includeAgentMemo ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${options.includeAgentMemo ? 'text-indigo-900' : 'text-slate-700'}`}>Agent IC Memo</h3>
                            <p className="text-xs text-slate-500">Full multi-agent analysis parsed into slides.</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${options.includePhotos ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                        onClick={() => toggleOption('includePhotos')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${options.includePhotos ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Image size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${options.includePhotos ? 'text-indigo-900' : 'text-slate-700'}`}>Property Photos</h3>
                            <p className="text-xs text-slate-500">Image gallery grid of deal property.</p>
                        </div>
                    </div>

                    <div
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${options.includeLeasing ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                        onClick={() => toggleOption('includeLeasing')}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${options.includeLeasing ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className={`font-bold ${options.includeLeasing ? 'text-indigo-900' : 'text-slate-700'}`}>Leasing Summary</h3>
                            <p className="text-xs text-slate-500">Rent roll and pipeline integration.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleExport}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                    >
                        <Download size={20} className="mr-2" />
                        Generate Deck
                    </button>
                </div>
            </div>
        </div>
    );
};
