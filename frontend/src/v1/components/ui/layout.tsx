import React, { useState } from "react";
import "./theme.css";

// ─── TABS COMPONENT ─────────────────────────────
export function Tabs({ tabs, children }: { tabs: string[], children: React.ReactNode }) {
    const [active, setActive] = useState(0);
    const kids = React.Children.toArray(children);
    return (
        <div>
            <div className="axiom-tabs-nav">
                {tabs.map((t, i) => (
                    <div key={i}
                        onClick={() => setActive(i)}
                        className={`axiom-tab-item ${active === i ? "active" : ""}`}>
                        {t}
                    </div>
                ))}
            </div>
            <div key={active} className="axiom-animate-fade">{kids[active]}</div>
        </div>
    );
}

// ─── ICONS & HELPERS ────────────────────────────
export function Dot({ color }: { color: string }) {
    return <span className="axiom-dot" style={{ background: color }}></span>;
}


