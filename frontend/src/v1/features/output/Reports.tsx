import { useState } from "react";
import { useProject, type ProjectContextType } from "../../context/ProjectContext";
import { Card, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";
import { fmt, downloadText, downloadCSV } from "../../lib/utils";

export function Reports() {
    const { project } = useProject() as ProjectContextType;

    const sections = [
        "1. Executive Summary", "2. Site & Property Description", "3. Entitlement & Zoning Analysis",
        "4. Physical & Environmental Due Diligence", "5. Infrastructure & Utilities Report",
        "6. Concept Yield & Design Summary", "7. Market Analysis & Comparables",
        "8. Financial Pro Forma & Analysis", "9. Risk Assessment & Mitigation Plan",
        "10. Permit & Approval Schedule", "11. Investment Summary & Conclusion",
    ];

    return (
        <Tabs tabs={["IC Memo Generator", "Binder Contents", "Export Options"]}>
            <div>
                <Card title="Investment Committee Memo Generator" action={<Badge label="AI-Powered" color="var(--c-gold)" />}>
                    <div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        Generate institutional-quality IC memos, lender packages, and risk assessments directly from your project data.
                    </div>
                    <ICMemoGenerator />
                </Card>
            </div>
            <div>
                <Card title="Development Feasibility Binder" action={<Badge label={project?.name || "Unnamed Project"} color="var(--c-gold)" />}>
                    <div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        Complete investor and lender ready development package.
                    </div>
                    <div className="axiom-stack-8">
                        {sections.map((s, i) => (
                            <div key={i} className="axiom-flex-sb-center" style={{ padding: "8px 12px", background: "var(--c-bg2)", borderRadius: 6, border: "1px solid var(--c-border)" }}>
                                <div className="axiom-flex-gap-8-center">
                                    <input type="checkbox" defaultChecked className="axiom-checkbox" title={`Include ${s}`} />
                                    <span className="axiom-text-13">{s}</span>
                                </div>
                                <Badge label="Ready" color="var(--c-green)" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <div>
                <Card title="Export & Distribution">
                    {[
                        { fmt: "PDF - Investor Package", desc: "Full binder with all sections, charts, and maps", ext: ".pdf", type: "text" },
                        { fmt: "PDF - Lender Package", desc: "Financial highlights, pro forma, collateral summary", ext: ".pdf", type: "text" },
                        { fmt: "Excel - Pro Forma Workbook", desc: "Interactive financial model with sensitivity analysis", ext: ".xlsx", type: "csv" },
                        { fmt: "PowerPoint - Investor Deck", desc: "10-slide investment summary presentation", ext: ".pptx", type: "text" },
                        { fmt: "Word - DD Summary", desc: "Due diligence checklist and findings memo", ext: ".docx", type: "text" },
                        { fmt: "CSV - Data Export", desc: "Raw data export for external analysis", ext: ".csv", type: "csv" },
                    ].map((e, i) => (
                        <div key={i} className="axiom-list-item-sb" style={{ padding: "12px 0" }}>
                            <div style={{ flex: 1 }}>
                                <div className="axiom-text-13">{e.fmt}</div>
                                <div className="axiom-text-11-dim" style={{ marginTop: 2 }}>{e.desc}</div>
                            </div>
                            <Button label="Export" onClick={() => {
                                if (e.type === "csv") {
                                    downloadCSV(["Section", "Data"], sections.map(s => [s, "Feasibility Data"]), `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
                                } else {
                                    downloadText(`AXIOM OS - ${e.fmt}\nProject: ${project?.name || "Unnamed"}\n\nGenerated: ${new Date().toLocaleString()}`, `axiom_${e.fmt.split(" ")[0].toLowerCase()}${e.ext}`);
                                }
                            }} variant="gold" />
                        </div>
                    ))}
                </Card>
            </div>
        </Tabs>
    );
}

function ICMemoGenerator() {
    const { fin, project, comps, risks, permits, loan, equity } = useProject() as ProjectContextType;
    const [generating, setGenerating] = useState(false);
    const [memo, setMemo] = useState("");
    const [memoType, setMemoType] = useState("ic_memo");
    const keys = JSON.parse(localStorage.getItem("axiom_api_keys") || "{}");

    const hard = (fin.totalLots || 0) * (fin.hardCostPerLot || 0);
    const soft = hard * (fin.softCostPct || 0) / 100;
    const fees = (fin.planningFees || 0) + ((fin.permitFeePerLot || 0) + (fin.schoolFee || 0) + (fin.impactFeePerLot || 0)) * (fin.totalLots || 0);
    const cont = (hard + soft) * (fin.contingencyPct || 0) / 100;
    const totalCost = (fin.landCost || 0) + (fin.closingCosts || 0) + hard + soft + cont + fees;
    const revenue = (fin.totalLots || 0) * (fin.salesPricePerLot || 0);
    const profit = revenue * 0.97 - totalCost * 1.05;
    const margin = revenue > 0 ? profit / revenue * 100 : 0;
    const roi = totalCost > 0 ? profit / totalCost * 100 : 0;

    const ctxStr = `
Project Name: ${project?.name || 'Unnamed Project'}
Address: ${project?.address || 'TBD'}, ${project?.municipality || 'TBD'}, ${project?.state || 'TBD'}
Target Lots: ${fin.totalLots}
Land Cost: $${fin.landCost?.toLocaleString()}
Total Hard & Soft Costs: $${(hard + soft + cont + fees).toLocaleString()}
Total Capital Required: $${totalCost.toLocaleString()}
Projected Revenue: $${revenue.toLocaleString()}
Target Margin: ${margin.toFixed(1)}%
Target ROI: ${roi.toFixed(1)}%

Financing & Equity:
Target LTC: ${loan?.ltc}% at ${loan?.rate}% Interest
GP Equity: ${equity?.gpPct}% / LP Equity: ${equity?.lpPct}%
Target Deal IRR: ${equity?.irrTarget}% / Equity Multiple: ${equity?.equityMultipleTarget}x

Market Comparables:
${comps?.length ? comps.map((c: any) => `- ${c.name} (${c.lots} lots): $${c.pricePerLot?.toLocaleString()}/lot (${c.status})`).join('\n') : 'No comparables provided.'}

Key Risks & Mitigations:
${risks?.length ? risks.filter((r: any) => r.severity === 'High' || r.severity === 'Critical').map((r: any) => `- [${r.severity}] ${r.cat}: ${r.risk}. Mitigation: ${r.mitigation}`).join('\n') : 'No high risks identified.'}

Key Pending Permits:
${permits?.length ? permits.filter((p: any) => p.status !== 'Approved' && p.req).map((p: any) => `- ${p.name} (${p.agency}): Est. ${p.duration}, ${p.cost}`).join('\n') : 'No pending permits.'}
    `.trim();

    const MEMO_PROMPTS: Record<string, string> = {
        ic_memo: `Generate a highly detailed, professional Investment Committee Memorandum for the following real estate development project. Use this data:\n\n${ctxStr}\n\nFormat the memo with clear markdown headings for: Executive Summary, Deal Merits & Return Profile, Market & Comps Analysis, Risk Analysis & Mitigations, and Recommendation. Maintain an institutional, precise, data-driven tone.`,
        lender_pkg: `Generate a Lender Package Summary for a construction/development loan request based on the following project data. Focus heavily on costs, margins, loan metrics, and risk mitigation. Use this data:\n\n${ctxStr}\n\nInclude sections for: Loan Request Summary, Project Description, Financial Highlights (Sources & Uses implied by LTC and Equities), Collateral Summary, and Sponsor Overview.`,
        exec_summary: `Generate a crisp, compelling 1-page Executive Summary for the following real estate development project, highlighting the return profile, total capitalization, and deal merits for prospective LP investors:\n\n${ctxStr}`,
        risk_memo: `Generate an exhaustive Risk Assessment Memorandum focusing on the highest severity risks for the following project. Provide an expanded analysis of the provided mitigations and suggest further defensive strategies a developer should take. Use this project data:\n\n${ctxStr}`,
    };

    const generate = async () => {
        if (!keys.proxyUrl) { alert("Configure your LLM proxy in Settings first."); return; }
        setGenerating(true); setMemo("");
        try {
            const resp = await fetch(keys.proxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${keys.anthropic || "x"}` },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet", max_tokens: 3000,
                    messages: [{ role: "user", content: MEMO_PROMPTS[memoType] || "Generate project summary" }],
                    system: "You are a senior real estate investment analyst. Write precise, data-driven investment memos."
                })
            });
            const data = await resp.json();
            setMemo(data.content?.[0]?.text || data.choices?.[0]?.message?.content || "Demo mode: AI response simulated. (Configure proxy for live output)");
        } catch (e: any) { setMemo("Error: " + e.message); }
        setGenerating(false);
    };

    const MEMO_TYPES = [
        { id: "ic_memo", label: "IC Memo", desc: "Full Investment Committee Memo", icon: "📄" },
        { id: "lender_pkg", label: "Lender Package", desc: "Construction loan presentation", icon: "🏛️" },
        { id: "exec_summary", label: "Exec Summary", desc: "1-page deal overview", icon: "⚡" },
        { id: "risk_memo", label: "Risk Memo", desc: "Risk assessment matrix", icon: "⚠️" },
    ];

    return (
        <div>
            <div className="axiom-grid-4" style={{ marginBottom: 20, gap: 12 }}>
                {MEMO_TYPES.map(mt => (
                    <div key={mt.id} onClick={() => setMemoType(mt.id)} className={`axiom-memo-card ${memoType === mt.id ? "active" : ""}`} style={{ cursor: "pointer", padding: 12, border: "1px solid var(--c-border)", borderRadius: 8, transition: "0.2s" }}>
                        <div style={{ fontSize: 20, marginBottom: 8 }}>{mt.icon}</div>
                        <div className="axiom-text-12-bold">{mt.label}</div>
                        <div className="axiom-text-10-dim" style={{ marginTop: 2 }}>{mt.desc}</div>
                    </div>
                ))}
            </div>

            <div className="axiom-snapshot">
                <div className="axiom-label" style={{ marginBottom: 12 }}>DEAL SNAPSHOT — {project?.name || "No Active Project"}</div>
                <div className="axiom-grid-3">
                    {[["Lots", fin.totalLots || "—"], ["Total Cost", fmt.M(totalCost)], ["Revenue", fmt.M(revenue)], ["Profit", fmt.M(profit)], ["Margin", margin.toFixed(1) + "%"], ["ROI", roi.toFixed(1) + "%"]].map(([l, v]) => (
                        <div key={l} style={{ textAlign: "center" }}>
                            <div className="axiom-text-9-dim-caps">{l}</div>
                            <div className="axiom-text-14-bold" style={{ marginTop: 4 }}>{v}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                label={generating ? "⟳ Generating AI Memo..." : `✦ Generate ${MEMO_TYPES.find(m => m.id === memoType)?.label}`}
                onClick={generate}
                variant="gold"
                className="axiom-button-full-13"
                disabled={generating}
            />

            {memo && (
                <div className="axiom-stack-15" style={{ marginTop: 20 }}>
                    <div className="axiom-flex-sb-center" style={{ marginBottom: 10 }}>
                        <div className="axiom-text-11-green-bold">✓ Document Generated</div>
                        <div className="axiom-flex-gap-8">
                            <Button label="Copy" onClick={() => navigator.clipboard.writeText(memo)} />
                            <Button label="Download" onClick={() => downloadText(memo, `axiom_${memoType}.txt`)} />
                        </div>
                    </div>
                    <div className="axiom-memo-output">
                        {memo}
                    </div>
                </div>
            )}
        </div>
    );
}
