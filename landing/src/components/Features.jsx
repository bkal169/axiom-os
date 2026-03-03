import React from 'react';
import { Database, FileText, Bot, Map } from 'lucide-react';

const Features = () => {
    const feats = [
        {
            icon: <Bot size={24} className="text-gradient-accent" />,
            title: "Local Jurisdiction Agents",
            desc: "Instantly query zoning codes, setback regulations, and density limits for any parcel. Our trained local agents read municipal code so you don't have to."
        },
        {
            icon: <FileText size={24} className="text-gradient-accent" />,
            title: "Automated Output Binders",
            desc: "Generate production-ready Investment Committee Memos and Lender Packages with a single click. Axiom OS automatically writes the narrative based on your dynamic financial models."
        },
        {
            icon: <Map size={24} className="text-gradient-accent" />,
            title: "Real-time Comps Mapping",
            desc: "Live GIS integration overlaying verified sales comparables directly onto your subject property. Adjust valuation caps dynamically on the map."
        },
        {
            icon: <Database size={24} className="text-gradient-accent" />,
            title: "Enterprise Deal Pipeline",
            desc: "Track every asset from LOI to Stabilization. Drag-and-drop due diligence checklists linked directly to your cloud storage providers."
        }
    ];

    return (
        <section id="features" style={{ padding: '100px 0', position: 'relative' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
                        Built for <span className="text-gradient">Execution.</span>
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Axiom OS replaces disjointed spreadsheets, maps, and word processors with a unified, AI-native intelligence layer.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {feats.map((f, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '32px', transition: 'transform 0.2s', cursor: 'default' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', marginBottom: '20px'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>{f.title}</h3>
                            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;
