import React, { useState } from "react";
import "./theme.css";

// ─── TABS COMPONENT ─────────────────────────────
export function Tabs({ tabs, children }: { tabs: string[], children: React.ReactNode }) {
    const [active, setActive] = useState(0);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const kids = React.Children.toArray(children);

    React.useEffect(() => {
        if (contentRef.current) {
            const scroller = contentRef.current.closest('.axiom-main-content-area, .axiom-split-pane, [style*="overflow-y: auto"]');
            if (scroller) scroller.scrollTop = 0;
        }
    }, [active]);

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
            <div ref={contentRef} key={active} className="axiom-animate-fade">{kids[active]}</div>
        </div>
    );
}

// ─── ICONS & HELPERS ────────────────────────────
export function Dot({ color }: { color: string }) {
    return <span className="axiom-dot" style={{ background: color }}></span>;
}


