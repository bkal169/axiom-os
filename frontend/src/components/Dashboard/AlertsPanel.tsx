import React from 'react';
import type { DashboardAlert } from '../../lib/dashboard';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface AlertsPanelProps {
    alerts: DashboardAlert[];
    onOpenDeal: (id: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onOpenDeal }) => {
    if (alerts.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-full flex items-center justify-center text-center">
                <div>
                    <div className="bg-emerald-100 p-3 rounded-full inline-block mb-3">
                        <AlertCircle size={24} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-800">No active alerts</p>
                    <p className="text-xs text-slate-500">Your pipeline is looking healthy.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center">
                    <AlertCircle size={16} className="text-amber-500 mr-2" />
                    Operational Blockers
                </h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {alerts.length}
                </span>
            </div>
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
                {alerts.map(alert => (
                    <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                {alert.severity === 'high' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                {alert.severity === 'medium' && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{alert.type}</span>
                            </div>
                            <p className="text-sm font-medium text-slate-900 mb-0.5">{alert.message}</p>
                            <p className="text-xs text-slate-400">{alert.dealName}</p>
                        </div>
                        <button
                            onClick={() => onOpenDeal(alert.dealId)}
                            className="text-slate-300 group-hover:text-slate-600 p-1"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
