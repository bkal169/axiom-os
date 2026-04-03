import React, { useState } from 'react';
import { C, S } from '../../constants';
import { fmt } from '../../utils';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';

export default function ROICalculator() {
    const [analysts, setAnalysts] = useState(5);
    const [hoursPerDeal, setHoursPerDeal] = useState(12);
    const [dealsPerYear, setDealsPerYear] = useState(24);
    const [hourlyRate, setHourlyRate] = useState(150);

    const currentHours = hoursPerDeal * dealsPerYear * analysts;
    const axiomHours = (hoursPerDeal * 0.1) * dealsPerYear * analysts; // 90% faster
    const savedHours = currentHours - axiomHours;
    const savedDollars = savedHours * hourlyRate;

    return (
        <Card title="Axiom ROI Calculator" action={<Badge label="Efficiency Gain" color={C.green} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={S.lbl}>Underwriting Team Size</label>
                        <input
                            type="range" min="1" max="50" value={analysts}
                            onChange={e => setAnalysts(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: C.gold }}
                        />
                        <div style={{ fontSize: 13, color: C.text, textAlign: 'right' }}>{analysts} Analysts</div>
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={S.lbl}>Hours per Underwrite (Manual)</label>
                        <input
                            type="number" style={S.inp} value={hoursPerDeal}
                            onChange={e => setHoursPerDeal(parseInt(e.target.value))}
                        />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <label style={S.lbl}>Deals per Year</label>
                        <input
                            type="number" style={S.inp} value={dealsPerYear}
                            onChange={e => setDealsPerYear(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                <div style={{ background: C.bg4, borderRadius: 8, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Annual Savings</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: C.green, marginBottom: 5 }}>{fmt.usd(savedDollars)}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{fmt.num(savedHours)} Analysts hours recovered</div>
                    <div style={{ marginTop: 20, padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 4, fontSize: 11, color: C.green, border: `1px solid ${C.green}33` }}>
                        ~91% reduction in underwriting overhead
                    </div>
                </div>
            </div>
            <div style={{ marginTop: 24, textAlign: 'center', paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
                <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: '#D4A843', textDecoration: 'none', fontSize: 15, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    See these savings in your portfolio → Apply for Access
                </a>
            </div>
        </Card>
    );
}
