import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, Trello, Calculator, Database, LogOut, CreditCard, User, Brain } from 'lucide-react';
import { Gating } from '../../lib/gating';
import { CopilotWidget } from '../Copilot/CopilotWidget';

export const AppLayout: React.FC = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const canUseData = Gating.canUseDataLayer(profile);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-wider">AXIOM</h1>
                    <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{profile?.role.replace('_', ' ')}</div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <LayoutDashboard size={20} className="mr-3" />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/deals"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <Trello size={20} className="mr-3" />
                        Deals
                    </NavLink>

                    <NavLink
                        to="/calculators"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <Calculator size={20} className="mr-3" />
                        Calculators
                    </NavLink>

                    <NavLink
                        to="/contacts"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <User size={20} className="mr-3" />
                        Contacts
                    </NavLink>

                    <NavLink
                        to="/data"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            } ${!canUseData ? 'opacity-50' : ''}`
                        }
                    >
                        <Database size={20} className="mr-3" />
                        Data Layer
                        {!canUseData && <span className="ml-auto text-xs bg-slate-700 px-1 rounded">PRO</span>}
                    </NavLink>

                    <NavLink
                        to="/axiom"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
                        }
                    >
                        <Brain size={20} className="mr-3" />
                        Dev Intelligence
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-1">
                    <NavLink
                        to="/pricing"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded-md transition-colors text-sm ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <CreditCard size={16} className="mr-3" />
                        Billing
                    </NavLink>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white rounded-md transition-colors"
                    >
                        <LogOut size={16} className="mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
            <CopilotWidget />
        </div>
    );
};
