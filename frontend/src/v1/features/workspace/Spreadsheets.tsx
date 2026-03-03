import { useState } from "react";
import { Card, Button } from "../../components/ui/components";
import { Agent } from "../agents/Agent";
import { useLS } from "../../hooks/useLS";

interface Sheet {
    id: number;
    name: string;
    rows: number;
    cols: number;
    type: string;
    modified: string;
    data: string[][];
}

const SEED_SHEETS: Sheet[] = [
    {
        id: 1, name: "Dev Pro Forma - Sunset Ridge", rows: 8, cols: 6, type: "Pro Forma", modified: "2025-02-20",
        data: [
            ["Item", "Units", "$/Unit", "Subtotal", "% of Total", "Notes"],
            ["Land Acquisition", "1", "3,000,000", "$3,000,000", "27.8%", "Under contract"],
            ["Hard Costs", "42", "38,500", "$1,617,000", "24.1%", "Grading + utilities + roads"],
            ["Soft Costs", "1", "485,460", "$485,460", "7.2%", "18% of hard"],
            ["Impact Fees", "42", "8,500", "$357,000", "5.3%", "City + school + park"],
            ["Contingency", "1", "", "$369,186", "5.5%", "10% of hard+soft"],
            ["TOTAL COST", "", "", "$6,713,046", "100%", ""],
            ["NET PROFIT", "", "", "$1,056,954", "13.6%", "Margin on revenue"],
        ]
    },
    {
        id: 2, name: "Comp Analysis Grid", rows: 5, cols: 5, type: "Analysis", modified: "2025-02-18",
        data: [
            ["Comp", "Address", "Lots", "Price/Lot", "DOM"],
            ["1", "100 Oak Valley", "45", "$178,000", "62"],
            ["2", "250 Sierra Way", "38", "$192,000", "45"],
            ["AVG", "", "41", "$185,000", "54"],
            ["SUBJECT", "456 Ridge Rd", "42", "$185,000", "—"],
        ]
    },
];

function downloadCSV(headers: string[], rows: string[][], filename: string) {
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export function Spreadsheets() {
    const [sheets, setSheets] = useLS<Sheet[]>("axiom_sheets", SEED_SHEETS);
    const [active, setActive] = useState(SEED_SHEETS[0].id);
    const [editCell, setEditCell] = useState<[number, number] | null>(null);
    const sheet = (sheets as Sheet[]).find(s => s.id === active);

    const updCell = (r: number, c: number, val: string) => {
        if (!sheet) return;
        const nd = sheet.data.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? val : cell));
        setSheets((sheets as Sheet[]).map(s => s.id === active ? { ...s, data: nd, modified: new Date().toISOString().split("T")[0] } : s));
    };
    const addSheet = () => {
        const ns: Sheet = { id: Date.now(), name: "New Sheet", rows: 5, cols: 5, type: "Custom", modified: new Date().toISOString().split("T")[0], data: Array.from({ length: 5 }, () => Array(5).fill("")) };
        setSheets([...(sheets as Sheet[]), ns]); setActive(ns.id);
    };
    const addRow = () => { if (!sheet) return; setSheets((sheets as Sheet[]).map(s => s.id === active ? { ...s, data: [...s.data, Array(s.data[0]?.length || 5).fill("")], rows: s.rows + 1 } : s)); };
    const addCol = () => { if (!sheet) return; setSheets((sheets as Sheet[]).map(s => s.id === active ? { ...s, data: s.data.map(r => [...r, ""]), cols: s.cols + 1 } : s)); };

    return (
        <div>
            <div className="axiom-flex-row" style={{ gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {(sheets as Sheet[]).map(s => (
                    <div key={s.id} style={{ padding: "4px 10px", cursor: "pointer", borderRadius: 3, background: active === s.id ? "var(--c-bg3)" : "var(--c-bg2)", borderBottom: `2px solid ${active === s.id ? "var(--c-gold)" : "transparent"}`, fontSize: 12, color: active === s.id ? "var(--c-text)" : "var(--c-dim)" }} onClick={() => setActive(s.id)}>
                        {s.name}
                    </div>
                ))}
                <Button label="+ New" onClick={addSheet} />
                <div style={{ flex: 1 }} />
                <Button label="+ Row" onClick={addRow} />
                <Button label="+ Col" onClick={addCol} />
                <Button variant="gold" label="Export CSV" onClick={() => sheet && downloadCSV(sheet.data[0] || [], sheet.data.slice(1), `${sheet.name.replace(/\s+/g, "_")}.csv`)} />
            </div>
            {sheet && (
                <div style={{ overflowX: "auto", border: "1px solid var(--c-border)", borderRadius: 3, marginBottom: 14 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            {sheet.data.map((row, ri) => (
                                <tr key={ri}>
                                    <td style={{ width: 30, textAlign: "center", background: "var(--c-bg2)", color: "var(--c-dim)", fontSize: 9, padding: "4px 6px", borderBottom: "1px solid var(--c-border)" }}>{ri + 1}</td>
                                    {row.map((cell, ci) => {
                                        const isHdr = ri === 0;
                                        const isEdit = editCell?.[0] === ri && editCell?.[1] === ci;
                                        return (
                                            <td key={ci} style={{ background: isHdr ? "var(--c-bg2)" : "var(--c-bg3)", color: isHdr ? "var(--c-gold)" : "var(--c-sub)", fontWeight: isHdr ? 700 : 400, fontSize: isHdr ? 9 : 11, minWidth: 100, padding: isEdit ? 0 : "4px 8px", cursor: "text", borderBottom: "1px solid var(--c-border)", borderRight: "1px solid var(--c-border)" }} onClick={() => setEditCell([ri, ci])}>
                                                {isEdit
                                                    ? <input className="axiom-input" style={{ width: "100%", margin: 0, padding: "3px 5px", fontSize: 12, border: "none", background: "var(--c-bg)" }} autoFocus value={cell} onChange={e => updCell(ri, ci, e.target.value)} onBlur={() => setEditCell(null)} onKeyDown={e => e.key === "Enter" && setEditCell(null)} />
                                                    : cell}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Card title="Sheet AI Assistant">
                <Agent id="SheetAI" system={`You are a spreadsheet and financial modeling assistant for real estate development. Current sheet: ${sheet?.name || "none"} with ${sheet?.rows || 0} rows.`} placeholder="Ask about formulas, calculations, or financial analysis..." />
            </Card>
        </div>
    );
}
