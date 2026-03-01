import React, { useState } from 'react';
import type { Contact, ContactType, ContactStatus } from '../../types/crm';
import { X, Mail, Phone, Tag, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ContactDrawerProps {
    contact?: Contact; // If null, we are creating
    onClose: () => void;
    onUpdate: () => void; // Trigger refresh
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({ contact, onClose, onUpdate }) => {
    const { profile } = useAuth();
    // Form State
    const [firstName, setFirstName] = useState(contact?.first_name || '');
    const [lastName, setLastName] = useState(contact?.last_name || '');
    const [email, setEmail] = useState(contact?.email || '');
    const [phone, setPhone] = useState(contact?.phone || '');
    const [type, setType] = useState<ContactType>(contact?.type || 'lead');
    const [status, setStatus] = useState<ContactStatus>(contact?.status || 'prospect');
    const [tags, setTags] = useState<string>(contact?.tags?.join(', ') || '');
    const [notes, setNotes] = useState(contact?.notes || '');
    const [minCheckSize, setMinCheckSize] = useState(contact?.min_check_size || 0);
    const [maxCheckSize, setMaxCheckSize] = useState(contact?.max_check_size || 0);
    const [preferredGeographies, setPreferredGeographies] = useState<string>(contact?.preferred_geographies?.join(', ') || '');
    const [maxLtv, setMaxLtv] = useState(contact?.max_ltv || 0);
    const [minLoanSize, setMinLoanSize] = useState(contact?.min_loan_size || 0);
    const [maxLoanSize, setMaxLoanSize] = useState(contact?.max_loan_size || 0);
    const [debtTypes, setDebtTypes] = useState<string>(contact?.debt_types?.join(', ') || '');

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
        const geoArray = preferredGeographies.split(',').map(g => g.trim()).filter(g => g);

        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: email || null,
            phone: phone || null,
            type,
            status,
            tags: tagArray,
            notes: notes || null,
            min_check_size: Number(minCheckSize),
            max_check_size: Number(maxCheckSize),
            preferred_geographies: geoArray,
            max_ltv: Number(maxLtv),
            min_loan_size: Number(minLoanSize),
            max_loan_size: Number(maxLoanSize),
            debt_types: debtTypes.split(',').map(d => d.trim()).filter(d => d),
            organization_id: profile?.org_id || null, // Ensure org context is passed
            updated_at: new Date().toISOString()
        };

        let error;
        if (contact?.id) {
            // Update
            const res = await supabase.from('contacts').update(payload).eq('id', contact.id);
            error = res.error;
        } else {
            // Create
            const res = await supabase.from('contacts').insert([payload]);
            error = res.error;
        }

        if (error) {
            console.error('Insert error:', error);
            // Log this to see exactly what org_id was sent vs what the policy expects
            console.log('Attempted org_id:', profile?.org_id);
            const { data: { session } } = await supabase.auth.getSession();
            console.log('Session user:', session?.user?.id);
            alert('Error saving contact: ' + error.message);
        } else {
            onUpdate();
            onClose();
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
            <div
                className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">
                        {contact ? 'Edit Contact' : 'New Contact'}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500" title="Close Drawer">
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="Jane"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                            <input
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Segmentation */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                            <select
                                title="Contact Type"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={type}
                                onChange={e => setType(e.target.value as ContactType)}
                            >
                                <option value="investor">Investor</option>
                                <option value="lender">Lender</option>
                                <option value="client">Client</option>
                                <option value="vendor">Vendor</option>
                                <option value="lead">Lead</option>
                                <option value="broker">Broker</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                            <select
                                title="Status"
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none bg-white"
                                value={status}
                                onChange={e => setStatus(e.target.value as ContactStatus)}
                            >
                                <option value="prospect">Prospect</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tags (comma separated)</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-2.5 text-slate-400" />
                            <input
                                className="w-full border border-gray-300 rounded pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="accredited, fl-resident, vip"
                            />
                        </div>
                    </div>

                    {/* Specialized Fields */}
                    {type === 'investor' && (
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-700">Investor Parameters</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Check Size ($)</label>
                                    <input
                                        type="number"
                                        title="Min Check Size"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={minCheckSize}
                                        onChange={e => setMinCheckSize(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Check Size ($)</label>
                                    <input
                                        type="number"
                                        title="Max Check Size"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={maxCheckSize}
                                        onChange={e => setMaxCheckSize(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preferred Geographies</label>
                                <input
                                    title="Preferred Geographies"
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                    value={preferredGeographies}
                                    onChange={e => setPreferredGeographies(e.target.value)}
                                    placeholder="Texas, Florida, New York"
                                />
                            </div>
                        </div>
                    )}

                    {type === 'lender' && (
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <h3 className="text-sm font-bold text-slate-700">Lending Parameters</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max LTV (%)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        title="Max LTV"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={maxLtv}
                                        onChange={e => setMaxLtv(Number(e.target.value))}
                                        placeholder="0.75"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Debt Types</label>
                                    <input
                                        title="Debt Types"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={debtTypes}
                                        onChange={e => setDebtTypes(e.target.value)}
                                        placeholder="Senior, Mezz, Bridge"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Min Loan Size ($)</label>
                                    <input
                                        type="number"
                                        title="Min Loan Size"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={minLoanSize}
                                        onChange={e => setMinLoanSize(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Max Loan Size ($)</label>
                                    <input
                                        type="number"
                                        title="Max Loan Size"
                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                                        value={maxLoanSize}
                                        onChange={e => setMaxLoanSize(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes</label>
                        <textarea
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none h-24"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Met at conference..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-slate-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-6 py-2 bg-slate-900 text-white rounded font-medium text-sm hover:bg-slate-800 disabled:opacity-50"
                    >
                        <Save size={16} className="mr-2" />
                        {saving ? 'Saving...' : 'Save Contact'}
                    </button>
                </div>
            </div>
        </div>
    );
};
