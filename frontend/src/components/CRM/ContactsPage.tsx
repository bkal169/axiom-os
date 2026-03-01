import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { Contact, ContactType } from '../../types/crm';
import { Search, Plus, User, Mail, Phone } from 'lucide-react';
import { ContactDrawer } from './ContactDrawer';

export const ContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | undefined>(undefined);

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('contacts').select('*').order('created_at', { ascending: false });

        if (typeFilter !== 'all') {
            query = query.eq('type', typeFilter);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching contacts:', error);
        } else {
            setContacts(data || []);
        }
        setLoading(false);
    }, [typeFilter]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const filtered = contacts.filter(c =>
        c.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddContact = () => {
        setSelectedContact(undefined);
        setIsDrawerOpen(true);
    };

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDrawerOpen(true);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
                        <p className="text-slate-500 text-sm">Manage your investors, clients, and network.</p>
                    </div>
                    <button
                        onClick={handleAddContact}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Contact
                    </button>
                </div>

                <div className="flex space-x-4">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
                        title="Filter by Contact Type"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as ContactType | 'all')}
                    >
                        <option value="all">All Types</option>
                        <option value="investor">Investors</option>
                        <option value="client">Clients</option>
                        <option value="vendor">Vendors</option>
                        <option value="lead">Leads</option>
                        <option value="broker">Brokers</option>
                    </select>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading directory...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                        <User size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>No contacts found.</p>
                        {typeFilter === 'all' && <p className="text-sm mt-2">Run the SQL migration to create the table first!</p>}
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Contact Info</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(contact => (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-slate-50 cursor-pointer"
                                        onClick={() => handleEditContact(contact)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
                                                    {contact.first_name[0]}{contact.last_name[0]}
                                                </div>
                                                <span className="font-medium text-slate-900">{contact.first_name} {contact.last_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase
                                                ${contact.type === 'investor' ? 'bg-purple-100 text-purple-700' :
                                                    contact.type === 'client' ? 'bg-blue-100 text-blue-700' :
                                                        contact.type === 'lead' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'}`
                                            }>
                                                {contact.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1 text-sm text-slate-500">
                                                {contact.email && (
                                                    <div className="flex items-center">
                                                        <Mail size={14} className="mr-2" />
                                                        {contact.email}
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center">
                                                        <Phone size={14} className="mr-2" />
                                                        {contact.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium
                                                ${contact.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`
                                            }>
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-1">
                                                {contact.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {(contact.tags?.length || 0) > 2 && (
                                                    <span className="text-[10px] text-gray-400">+{contact.tags!.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Drawer */}
            {isDrawerOpen && (
                <ContactDrawer
                    contact={selectedContact}
                    onClose={() => setIsDrawerOpen(false)}
                    onUpdate={fetchContacts}
                />
            )}
        </div>
    );
};
