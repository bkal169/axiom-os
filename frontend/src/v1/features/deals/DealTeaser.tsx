import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

interface Deal {
    id: string | number;
    name: string;
    address: string;
    stage: string;
    value: number;
    profit: number;
    lots: number;
    type: string;
    notes: string;
    [key: string]: any;
}

interface DealTeaserProps {
    deal: Deal;
}

export function DealTeaser({ deal }: DealTeaserProps) {
    const [loading, setLoading] = useState(false);
    const [teaser, setTeaser] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generate = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fnError } = await supabase.functions.invoke("deal-teaser", {
                body: deal
            });
            if (fnError) throw fnError;
            if (data?.error) throw new Error(data.error);
            setTeaser(data.teaser);
        } catch (err: any) {
            setError(err.message || "Failed to generate teaser.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (teaser) {
            navigator.clipboard.writeText(teaser);
        }
    };

    const downloadMarkdown = () => {
        if (!teaser) return;
        const blob = new Blob([teaser], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${deal.name.replace(/\s+/g, "_")}_Teaser.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ marginTop: 24 }}>
            {!teaser && (
                <div style={{ textAlign: "center", padding: 24, background: "var(--c-bg2)", border: "1px solid var(--c-border)", borderRadius: 8 }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }}>📝</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>
                        Generate Investment Teaser
                    </div>
                    <div style={{ fontSize: 12, color: "var(--c-dim)", marginBottom: 16, maxWidth: 400, margin: "0 auto 16px auto" }}>
                        Claude will write a professional 1-page investment teaser for <strong style={{ color: "var(--c-gold)" }}>{deal.name}</strong> that you can send directly to LPs or lenders.
                    </div>
                    {error && (
                        <div style={{ fontSize: 12, color: "var(--c-red, #ff6b6b)", marginBottom: 12 }}>⚠ {error}</div>
                    )}
                    <button
                        onClick={generate}
                        disabled={loading}
                        style={{
                            padding: "10px 24px",
                            background: loading ? "var(--c-bg3)" : "linear-gradient(135deg, var(--c-gold), #a07830)",
                            color: loading ? "var(--c-dim)" : "#000",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            margin: "0 auto"
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid var(--c-dim)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                                Generating... (10-15s)
                            </>
                        ) : "✨ Generate 1-Page Teaser"}
                    </button>
                </div>
            )}

            {teaser && (
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-gold)", letterSpacing: 1, textTransform: "uppercase" }}>
                            Investment Teaser — {deal.name}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={copyToClipboard} style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 4, color: "var(--c-muted)", cursor: "pointer" }}>
                                📋 Copy
                            </button>
                            <button onClick={downloadMarkdown} style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 4, color: "var(--c-muted)", cursor: "pointer" }}>
                                ⬇ Download .md
                            </button>
                            <button onClick={() => setTeaser(null)} style={{ padding: "4px 12px", fontSize: 11, background: "transparent", border: "1px solid var(--c-border)", borderRadius: 4, color: "var(--c-dim)", cursor: "pointer" }}>
                                ✕ Reset
                            </button>
                        </div>
                    </div>
                    <div style={{
                        background: "var(--c-bg2)",
                        border: "1px solid var(--c-border)",
                        borderRadius: 8,
                        padding: 24,
                        fontFamily: "monospace",
                        fontSize: 12,
                        lineHeight: 1.8,
                        color: "var(--c-muted)",
                        whiteSpace: "pre-wrap",
                        maxHeight: 500,
                        overflowY: "auto"
                    }}>
                        {teaser}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            ` }} />
        </div>
    );
}
