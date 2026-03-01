import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Building, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

export const CopilotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.findAndRunCopilot(query);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                >
                    <Bot size={28} />
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-h-[600px] flex flex-col border border-indigo-100 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Sparkles size={20} className="text-indigo-200" />
                            <h3 className="font-semibold text-lg">Axiom Copilot</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-indigo-200 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 min-h-[300px]">
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full text-indigo-500 space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                <p className="text-sm font-medium animate-pulse">Analyzing properties and running models...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm">
                                {error}
                            </div>
                        )}

                        {result && result.deal && (
                            <div className="space-y-4">
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                                    <p className="text-sm text-indigo-900">
                                        I found a matching property and ran your requested scenario.
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center text-slate-700 font-semibold">
                                            <Building size={16} className="mr-2 text-slate-400" />
                                            {result.deal.project_name}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Purchase Price:</span>
                                            <span className="font-medium text-slate-900">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.deal.purchase_price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Assumed Interest:</span>
                                            <span className="font-medium text-slate-900">
                                                {result.deal.model_inputs?.interest_rate ? (result.deal.model_inputs.interest_rate * 100).toFixed(2) : '0.00'}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                                            <span className="text-slate-700 font-medium flex items-center">
                                                <TrendingUp size={14} className="mr-1 text-emerald-500" />
                                                Projected Profit:
                                            </span>
                                            <span className="font-bold text-emerald-600">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(result.deal.projected_profit || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Exit Multiple:</span>
                                            <span className="font-medium text-slate-900">
                                                {result.deal.model_outputs?.equity_multiple ? result.deal.model_outputs.equity_multiple.toFixed(2) : '0.00'}x
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            // Soft refresh to show it in the Deals/Dashboard tables
                                            window.location.reload();
                                        }}
                                        className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors"
                                    >
                                        View in Pipeline
                                    </button>
                                </div>
                            </div>
                        )}

                        {!loading && !result && !error && (
                            <div className="text-center text-slate-400 text-sm mt-8 space-y-4 p-4">
                                <Bot size={48} className="mx-auto text-slate-300 opacity-50" />
                                <p>Ask me to find properties and underwrite them instantly.</p>
                                <div className="text-xs bg-white p-3 rounded border border-slate-200 text-left space-y-2">
                                    <span className="font-semibold text-slate-600 block">Try saying:</span>
                                    <p className="italic text-slate-500">"Find a multifamily property around $5M and model a deal with an exit cap rate of 5.5% and an 80% LTC."</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="What would you like to model?"
                            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors outline-none"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
