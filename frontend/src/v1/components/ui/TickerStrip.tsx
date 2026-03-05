/**
 * TickerStrip — Axiom OS Phase 2.5
 * A scrolling market data ticker that anchors to the bottom of the layout.
 * Tracks REITs, Homebuilders, Indices, and Macro indicators.
 * Uses simulated live data (connects to Polygon.io if API key is set in Connectors).
 */

import { useState, useEffect, useRef } from "react";

// ─── Ticker Definitions ────────────────────────────────────────────────────────
interface TickerItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    pct: number;
    category: string;
}

const BASE_TICKERS: Omit<TickerItem, "change" | "pct">[] = [
    // Indices
    { symbol: "SPX", name: "S&P 500", price: 5423.50, category: "Index" },
    { symbol: "DJI", name: "Dow Jones", price: 39842.30, category: "Index" },
    { symbol: "NDX", name: "Nasdaq 100", price: 18721.40, category: "Index" },
    { symbol: "RUT", name: "Russell 2000", price: 2089.20, category: "Index" },
    // REITs
    { symbol: "VNQ", name: "Vanguard REIT", price: 87.43, category: "REIT" },
    { symbol: "PLD", name: "Prologis", price: 112.85, category: "REIT" },
    { symbol: "AMT", name: "Amer. Tower", price: 188.62, category: "REIT" },
    { symbol: "CCI", name: "Crown Castle", price: 97.14, category: "REIT" },
    // Homebuilders
    { symbol: "DHI", name: "D.R. Horton", price: 142.30, category: "Builder" },
    { symbol: "LEN", name: "Lennar", price: 138.75, category: "Builder" },
    { symbol: "PHM", name: "PulteGroup", price: 118.40, category: "Builder" },
    { symbol: "NVR", name: "NVR Inc.", price: 7824.00, category: "Builder" },
    // Macro
    { symbol: "TNX", name: "10-yr Yield", price: 4.28, category: "Macro" },
    { symbol: "MBB", name: "30-yr Mtg", price: 6.82, category: "Macro" },
    { symbol: "DXY", name: "USD Index", price: 104.32, category: "Macro" },
    // Commodities
    { symbol: "LB", name: "Lumber", price: 514.20, category: "Commodity" },
    { symbol: "HG", name: "Copper", price: 4.18, category: "Commodity" },
];

// ─── Initial Tickers ───────────────────────────────────────────────────────
const INITIAL_TICKERS: TickerItem[] = BASE_TICKERS.map(t => ({
    ...t,
    change: (Math.random() - 0.45) * t.price * 0.012,
    pct: (Math.random() - 0.45) * 1.8,
}));

// ─── Category colors ────────────────────────────────────────────────────────
const CAT_COLOR: Record<string, string> = {
    Index: "var(--c-blue)",
    REIT: "var(--c-purple)",
    Builder: "var(--c-gold)",
    Macro: "var(--c-amber)",
    Commodity: "var(--c-teal)",
};

// ─── Format helpers ─────────────────────────────────────────────────────────
function fmtPrice(p: number): string {
    if (p >= 1000) return p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return p.toFixed(2);
}

// ─── WebSocket Market Data — Phase 8 Production Connectivity ──────────────
const FINNHUB_KEY = 'csgpe5pr01qmbmrvm170csgpe5pr01qmbmrvm17g'; // Demonstration key
const WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_KEY}`;

// ─── Component ──────────────────────────────────────────────────────────────
interface TickerStripProps {
    visible: boolean;
}

export function TickerStrip({ visible }: TickerStripProps) {
    const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
    const [paused, setPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!visible) return;

        socket.current = new WebSocket(WS_URL);

        socket.current.onopen = () => {
            console.log('Ticker WebSocket Connected');
            // Subscribe to major indices/tickers
            const symbols = tickers.map(t => t.symbol);
            symbols.forEach(s => {
                socket.current?.send(JSON.stringify({ 'type': 'subscribe', 'symbol': s }));
            });
        };

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'trade') {
                const update = data.data[0];
                setTickers(prev => prev.map(t => {
                    if (t.symbol === update.s) {
                        const newPrice = update.p;
                        const delta = newPrice - t.price;
                        return {
                            ...t,
                            price: newPrice,
                            change: delta,
                            pct: (delta / t.price) * 100
                        };
                    }
                    return t;
                }));
            }
        };

        socket.current.onerror = (err) => console.error('Ticker WS Error:', err);

        return () => {
            socket.current?.close();
        };
    }, [visible]);

    // CSS scroll animation — duplicate ticker items for seamless loop
    const items = [...tickers, ...tickers];

    if (!visible) return null;

    return (
        <div className="axiom-ticker-strip">
            <div className="axiom-ticker-label">MARKETS</div>
            <div
                ref={scrollRef}
                className={`axiom-ticker-scroll${paused ? " axiom-ticker-scroll--paused" : ""}`}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div className="axiom-ticker-track">
                    {items.map((t, i) => (
                        <div key={`${t.symbol}-${i}`} className="axiom-ticker-item">
                            <span className="axiom-ticker-symbol" style={{ color: CAT_COLOR[t.category] }}>
                                {t.symbol}
                            </span>
                            <span className="axiom-ticker-price">{fmtPrice(t.price)}</span>
                            <span className={`axiom-ticker-change${t.change >= 0 ? "--up" : "--down"}`}>
                                {t.change >= 0 ? "▲" : "▼"} {Math.abs(t.pct).toFixed(2)}%
                            </span>
                            <span className="axiom-ticker-sep">·</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="axiom-ticker-tag">LIVE</div>
        </div>
    );
}
