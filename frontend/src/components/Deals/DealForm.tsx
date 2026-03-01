import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
// import { useAuth } from '../../lib/auth'; // Not used yet but available
import { Gating } from '../../lib/gating';
import { isInternalAdmin } from '../../lib/rbac';
import { useAuth } from '../../hooks/useAuth'; // Actually needed for user_id

interface DealFormProps {
    onClose: () => void;
    onSuccess: () => void;
    currentCount?: number;
}

export const DealForm: React.FC<DealFormProps> = ({ onClose, onSuccess, currentCount = 0 }) => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        project_name: '',
        location: '',
        asset_type: 'Multifamily',
        acquisition_price: 0,
        renovation_cost: 0,
        projected_value: 0,
        internal_only: false
    });

    const canCreate = Gating.canCreateDeal(profile, currentCount);
    const showInternal = isInternalAdmin(profile);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        // Simple calculation for capital required (Acq + Reno)
        const capital_required = Number(formData.acquisition_price) + Number(formData.renovation_cost);

        const { error } = await supabase
            .from('deals')
            .insert({
                user_id: user.id,
                project_name: formData.project_name,
                location: formData.location,
                asset_type: formData.asset_type,
                acquisition_price: formData.acquisition_price,
                renovation_cost: formData.renovation_cost,
                projected_value: formData.projected_value,
                capital_required,
                internal_only: formData.internal_only,
                stage: 'sourcing'
            });

        if (error) {
            alert('Error creating deal: ' + error.message);
        } else {
            onSuccess();
            onClose();
        }
        setLoading(false);
    };

    if (!canCreate) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
                    <h3 className="text-lg font-bold mb-2">Deal Limit Reached</h3>
                    <p className="text-gray-600 mb-4">Upgrade your plan to create more deals.</p>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
                    <a href="/pricing" className="block mt-2 bg-slate-900 text-white py-2 rounded">View Plans</a>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-800">New Deal</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            value={formData.project_name}
                            onChange={e => setFormData({ ...formData, project_name: e.target.value })}
                            placeholder="e.g. Sunset Apartments"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                            required
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="City, State"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                        <select
                            title="Select Asset Type"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                            value={formData.asset_type}
                            onChange={e => setFormData({ ...formData, asset_type: e.target.value })}
                        >
                            <option>Multifamily</option>
                            <option>Single Family</option>
                            <option>Commercial</option>
                            <option>Mixed Use</option>
                            <option>Land</option>
                            <option>Industrial</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Acquisition Price</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    title="Acquisition Price"
                                    className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={formData.acquisition_price}
                                    onChange={e => setFormData({ ...formData, acquisition_price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reno Cost</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    title="Renovation Cost"
                                    className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={formData.renovation_cost}
                                    onChange={e => setFormData({ ...formData, renovation_cost: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Projected Value (ARV)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-400">$</span>
                            <input
                                type="number"
                                title="Projected Value"
                                className="w-full border border-gray-300 rounded pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 outline-none"
                                value={formData.projected_value}
                                onChange={e => setFormData({ ...formData, projected_value: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {showInternal && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="internal_only"
                                className="mr-2"
                                checked={formData.internal_only}
                                onChange={e => setFormData({ ...formData, internal_only: e.target.checked })}
                            />
                            <label htmlFor="internal_only" className="text-sm font-medium text-amber-700 flex items-center">
                                Internal / Private Deal <span className="ml-1 text-xs bg-amber-100 px-1 rounded border border-amber-200">ADMIN</span>
                            </label>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-slate-900 text-white rounded hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Deal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
