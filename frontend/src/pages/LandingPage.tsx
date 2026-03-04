import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    // user/auth is not used here yet

    const features = [
        {
            title: "Command Center",
            desc: "Unified mission control for your entire portfolio.",
            icon: "⬡"
        },
        {
            title: "Deal Analyzer",
            desc: "Investor-grade analytics and pro-forma modeling.",
            icon: "📈"
        },
        {
            title: "Site Intelligence",
            desc: "Instant entitlements, zoning, and GIS data mapping.",
            icon: "🗺️"
        },
        {
            title: "Neural Engine",
            desc: "AI-driven insights for strategic decision making.",
            icon: "🧠"
        }
    ];

    return (
        <div className="min-h-screen bg-[#0D0F13] text-[#F8FAFC] overflow-hidden selection:bg-[#D4A843] selection:text-[#0D0F13]">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#D4A843] opacity-[0.03] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#3B82F6] opacity-[0.03] blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-bottom border-[#1E2330] backdrop-blur-md bg-[#0D0F13]/50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tighter text-[#D4A843]">AXIOM</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 border border-[#D4A843] rounded text-[#D4A843] uppercase tracking-widest mt-1">OS</span>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm font-medium hover:text-[#D4A843] transition-colors"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => navigate('/axiom')}
                        className="px-5 py-2 text-sm font-bold bg-[#D4A843] text-[#0D0F13] rounded hover:bg-[#E8C76A] transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#D4A843]/10"
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4A843]/20 bg-[#D4A843]/5 text-[#D4A843] text-[10px] uppercase tracking-[0.2em] font-bold mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A843] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A843]"></span>
                    </span>
                    Now in Premiere Release
                </div>

                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-[#F8FAFC] to-[#94A3B8]">
                    The Operating System<br />
                    <span className="text-[#D4A843]">For Real Estate.</span>
                </h1>

                <p className="max-w-2xl text-lg md:text-xl text-[#94A3B8] mb-12 leading-relaxed">
                    Axiom OS is the next-generation platform for real estate investment,
                    development, and management. Powered by neural intelligence and
                    investor-grade analytics.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <button
                        onClick={() => navigate('/axiom')}
                        className="px-8 py-4 text-lg font-bold bg-[#D4A843] text-[#0D0F13] rounded hover:bg-[#E8C76A] transition-all transform hover:scale-105 shadow-xl shadow-[#D4A843]/20"
                    >
                        Enter the Workspace
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 text-lg font-bold border border-[#1E2330] bg-[#111318]/50 text-[#F8FAFC] rounded hover:bg-[#1A1E2A] transition-all backdrop-blur-sm"
                    >
                        Sign Up for Free
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full px-4">
                    {features.map((f, i) => (
                        <div key={i} className="p-8 rounded-xl border border-[#1E2330] bg-[#111318]/40 backdrop-blur-sm hover:border-[#D4A843]/30 transition-all group text-left">
                            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{f.icon}</div>
                            <h3 className="text-lg font-bold mb-2 text-[#D4A843]">{f.title}</h3>
                            <p className="text-sm text-[#94A3B8] leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-8 border-t border-[#1E2330] mt-20 flex flex-col md:flex-row items-center justify-between gap-6 text-[#94A3B8] text-sm">
                <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tighter text-[#F8FAFC]">AXIOM OS</span>
                    <span>© 2026 Juniper Rose Systems</span>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="hover:text-[#D4A843] transition-colors">Documentation</a>
                    <a href="#" className="hover:text-[#D4A843] transition-colors">API Reference</a>
                    <a href="#" className="hover:text-[#D4A843] transition-colors">Contact Support</a>
                </div>
            </footer>
        </div>
    );
};
