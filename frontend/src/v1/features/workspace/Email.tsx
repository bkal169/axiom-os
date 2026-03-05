import { useState, useRef, useEffect } from "react";
import { Card, Field, Badge, Button } from "../../components/ui/components";
import { useLS } from "../../hooks/useLS";

interface Email {
    id: number;
    from: string;
    to: string;
    subject: string;
    body: string;
    date: string;
    read: boolean;
    folder: string;
    deal: string;
}

const SEED_EMAILS: Email[] = [
    { id: 1, from: "Sarah Chen <sarah@pacificrealty.com>", to: "me", subject: "RE: Sunset Ridge LOI - Counter Offer", body: "Hi,\n\nThe seller came back with a counter at $3.15M. They're firm on the 45-day DD period but willing to extend closing to 60 days.\n\nKey changes:\n- Price: $3.15M (vs our $3.0M)\n- DD Period: 45 days (unchanged)\n- Earnest money: $100K (vs our $75K)\n\nI think there's room to meet in the middle around $3.08M.\n\nBest,\nSarah", date: "2025-02-20 09:15", read: true, folder: "inbox", deal: "Sunset Ridge" },
    { id: 2, from: "City Planning <planning@cityofsac.gov>", to: "me", subject: "Notice of Application Completeness - TTM-2025-0234", body: "Dear Applicant,\n\nYour Tentative Tract Map application TTM-2025-0234 for the property at 456 Ridge Rd has been deemed complete as of February 18, 2025.\n\nAssigned to Senior Planner Jennifer Martinez. Expect initial comments within 30 business days.\n\nCity of Sacramento Planning Department", date: "2025-02-18 14:30", read: false, folder: "inbox", deal: "Sunset Ridge" },
    { id: 3, from: "me", to: "mike@fnb.com", subject: "Construction Loan Term Sheet Request - Hawk Valley", body: "Mike,\n\nFollowing up on our call. Here are the project details:\n\n- Project: Hawk Valley Subdivision\n- Lots: 28 SFR\n- Land Cost: $1.8M (under contract)\n- Total development budget: $5.6M\n- LTC requested: 65%\n- Term: 24 months with 6mo extension\n\nCan you have a preliminary term sheet by March 1?\n\nThanks,\nBrett", date: "2025-02-17 11:00", read: true, folder: "sent", deal: "Hawk Valley" },
];

const FOLDERS = [
    { id: "inbox", label: "Inbox" },
    { id: "sent", label: "Sent" },
    { id: "drafts", label: "Drafts" },
    { id: "templates", label: "Templates" },
];

export function Email() {
    const [emails, setEmails] = useLS<Email[]>("axiom_emails", SEED_EMAILS);
    const [folder, setFolder] = useState("inbox");
    const [selEmail, setSelEmail] = useState<Email | null>(null);
    const [composing, setComposing] = useState(false);
    const [draft, setDraft] = useState({ to: "", subject: "", body: "", deal: "" });

    // AI Agent State
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiMode, setAiMode] = useState<"none" | "summarize" | "draft">("none");
    const [summary, setSummary] = useState("");
    const [draftPrompt, setDraftPrompt] = useState("");

    const filtered = (emails as Email[]).filter(e => e.folder === folder);
    const unread = (emails as Email[]).filter(e => !e.read && e.folder === "inbox").length;
    const scrollRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll AI generation
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [summary, draft.body]);

    const sendEmail = () => {
        if (!draft.to || !draft.subject) return;
        const sent: Email = { id: Date.now(), from: "me", to: draft.to, subject: draft.subject, body: draft.body, date: new Date().toISOString().replace("T", " ").substring(0, 16), read: true, folder: "sent", deal: draft.deal };
        setEmails([...(emails as Email[]), sent]);
        setDraft({ to: "", subject: "", body: "", deal: "" });
        setComposing(false);
        setAiMode("none");
    };

    const markRead = (id: number) => setEmails((emails as Email[]).map(e => e.id === id ? { ...e, read: true } : e));

    const handleSummarize = async () => {
        if (!selEmail) return;
        setAiMode("summarize");
        setAiProcessing(true);
        setSummary("");

        // Simulate AI streaming a summary
        const text = "Axiom Analysis:\nThe seller countered at $3.15M (up from $3.0M) and requested $100K earnest money. They agreed to the 45-day DD and offered a 60-day closing. Agent suggests countering at $3.08M.\n\nRequired Actions:\n1. Review counter-offer financials.\n2. Draft response to Sarah Chen.";
        let current = "";
        for (let i = 0; i < text.length; i++) {
            await new Promise(r => setTimeout(r, 15));
            current += text[i];
            setSummary(current);
        }
        setAiProcessing(false);
    };

    const handleAIGenerateDraft = async () => {
        if (!draftPrompt) return;
        setAiProcessing(true);

        // Simulate AI generating a draft
        const text = `Hi ${selEmail ? selEmail.from.split(' ')[0] : 'there'},\n\nThanks for the update. Let's counter at $3.08M with the $100K earnest money and 60-day close. Please draft the addendum and send it over for review.\n\nBest,\nBrett`;

        setDraft(d => ({ ...d, body: "" }));
        let current = "";
        for (let i = 0; i < text.length; i++) {
            await new Promise(r => setTimeout(r, 10));
            current += text[i];
            setDraft(d => ({ ...d, body: current }));
        }
        setAiProcessing(false);
        setDraftPrompt("");
    };

    return (
        <div className="axiom-flex-gap-14 axiom-h-full">
            {/* Sidebar */}
            <div className="axiom-w-160 axiom-shrink-0">
                <Button variant="gold" label="+ Compose" className="axiom-full-width" onClick={() => { setComposing(true); setSelEmail(null); setAiMode("none"); }} />
                <div className="axiom-mt-12">
                    {FOLDERS.map(f => (
                        <div key={f.id} className={`axiom-flex-sb-center axiom-p-8-10 axiom-cursor-pointer axiom-mb-2 ${folder === f.id ? "axiom-bg-3" : ""}`} style={{ borderLeft: `2px solid ${folder === f.id ? "var(--c-gold)" : "transparent"}`, transition: "0.15s" }} onClick={() => { setFolder(f.id); setSelEmail(null); }}>
                            <span className={`axiom-text-12 ${folder === f.id ? "axiom-text-sub axiom-text-bold" : "color-sub"}`}>{f.label}</span>
                            <span className="axiom-text-10-dim">{(emails as Email[]).filter(e => e.folder === f.id).length}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 24, padding: "0 4px" }}>
                    <div className="axiom-text-10-dim" style={{ letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Connected</div>
                    {[["Gmail", "var(--c-green)"], ["Outlook", "var(--c-dim)"], ["SMTP", "var(--c-dim)"]].map(([name, color]) => (
                        <div key={name} className="axiom-flex-row" style={{ gap: 8, padding: "4px 0", cursor: "pointer" }}>
                            <div style={{ width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0, boxShadow: color !== "var(--c-dim)" ? `0 0 8px ${color}` : "none" }} />
                            <span style={{ fontSize: 11, color: "var(--c-sub)", transition: "0.15s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--c-text)"} onMouseLeave={e => e.currentTarget.style.color = "var(--c-sub)"}>{name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main area */}
            <div className="axiom-flex-col axiom-flex-gap-14 axiom-flex-1 axiom-h-full">
                {composing ? (
                    <Card title="Compose Email" className="axiom-animate-fade-in axiom-flex-col axiom-flex-1">

                        {/* AI Drafting Assistant Bar */}
                        <div style={{ background: "color-mix(in srgb, var(--c-gold) 10%, var(--c-bg2))", border: "1px solid color-mix(in srgb, var(--c-gold) 30%, transparent)", borderRadius: 4, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 10, background: "var(--c-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--c-bg)", flexShrink: 0, boxShadow: "0 0 10px var(--c-gold)" }}>⬡</div>
                            <input
                                className="axiom-input"
                                style={{ flex: 1, background: "transparent", border: "none", fontSize: 12, outline: "none", color: "var(--c-text)", padding: 0 }}
                                placeholder="Tell Axiom to draft a reply, schedule a meeting, or attach files..."
                                value={draftPrompt}
                                onChange={e => setDraftPrompt(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAIGenerateDraft()}
                                disabled={aiProcessing}
                            />
                            {aiProcessing ? (
                                <span className="axiom-text-10-dim" style={{ color: "var(--c-gold)" }}>Generating...</span>
                            ) : (
                                <button style={{ background: draftPrompt ? "var(--c-gold)" : "var(--c-bg3)", border: "none", color: draftPrompt ? "var(--c-bg)" : "var(--c-dim)", padding: "4px 10px", borderRadius: 3, fontSize: 10, cursor: draftPrompt ? "pointer" : "not-allowed", fontWeight: 700, transition: "0.2s" }} onClick={handleAIGenerateDraft}>
                                    Generate
                                </button>
                            )}
                        </div>

                        <div className="axiom-grid-2 axiom-mb-12">
                            <Field label="To"><input className="axiom-input" value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))} placeholder="recipient@email.com" title="To" /></Field>
                            <Field label="Linked Deal"><input className="axiom-input" value={draft.deal} onChange={e => setDraft(d => ({ ...d, deal: e.target.value }))} placeholder="Optional" title="Linked Deal" /></Field>
                        </div>
                        <Field label="Subject"><input className="axiom-input" value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} title="Subject" /></Field>
                        <Field label="Body" className="axiom-flex-col axiom-flex-1">
                            <textarea ref={scrollRef} className="axiom-textarea axiom-flex-1 axiom-mono-13" style={{ minHeight: 200, resize: "none" }} value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))} title="Email Body" />
                        </Field>
                        <div className="axiom-flex-gap-8 axiom-mt-12">
                            <Button variant="gold" label="Send" onClick={sendEmail} />
                            <Button label="Cancel" onClick={() => setComposing(false)} />
                        </div>
                    </Card>
                ) : selEmail ? (
                    <Card title={selEmail.subject} action={<Button label="← Back" onClick={() => setSelEmail(null)} />} className="axiom-animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

                        <div className="axiom-flex-sb-center axiom-mb-16 axiom-py-8" style={{ borderBottom: "1px solid var(--c-border)" }}>
                            <div className="axiom-flex-gap-16 axiom-text-10-dim">
                                <span className="axiom-text-12 axiom-text-sub"><span className="axiom-text-dim">From:</span> {selEmail.from}</span>
                                <span><span className="axiom-text-dim">To:</span> {selEmail.to}</span>
                                <span>{selEmail.date}</span>
                                {selEmail.deal && <Badge label={selEmail.deal} color="var(--c-gold)" />}
                            </div>

                            {/* AI Action Buttons */}
                            <div className="axiom-flex-row" style={{ gap: 8 }}>
                                <button
                                    style={{ background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-gold)", fontSize: 10, padding: "4px 8px", borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "0.15s" }}
                                    onClick={handleSummarize}
                                    onMouseEnter={e => e.currentTarget.style.background = "var(--c-bg3)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    disabled={aiProcessing}
                                >
                                    <div style={{ width: 12, height: 12, borderRadius: 6, background: "var(--c-gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "var(--c-bg)", fontWeight: 800 }}>⬡</div>
                                    Summarize
                                </button>
                            </div>
                        </div>

                        {/* AI Summary Block */}
                        {aiMode === "summarize" && (
                            <div className="axiom-animate-slide-up" style={{ background: "color-mix(in srgb, var(--c-gold) 8%, var(--c-bg2))", borderLeft: "2px solid var(--c-gold)", padding: "12px 16px", marginBottom: 20, borderRadius: "0 4px 4px 0" }}>
                                <div style={{ fontSize: 9, color: "var(--c-gold)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>Axiom Intelligence</div>
                                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--c-text)", lineHeight: 1.6 }}>{summary}{aiProcessing ? " █" : ""}</pre>
                            </div>
                        )}

                        <div className="axiom-flex-1 axiom-overflow-y">
                            <pre className="axiom-m-0 axiom-mono-13 color-sub" style={{ whiteSpace: "pre-wrap" }}>{selEmail.body}</pre>
                        </div>

                        <div className="axiom-flex-gap-8 axiom-mt-20 axiom-pt-16" style={{ borderTop: "1px solid var(--c-border)" }}>
                            <Button variant="gold" label="Reply" onClick={() => {
                                setComposing(true);
                                setAiMode("draft");
                                setDraft({ to: selEmail.from.includes("<") ? selEmail.from.split("<")[1].replace(">", "") : selEmail.from, subject: "RE: " + selEmail.subject, body: "", deal: selEmail.deal });
                            }} />
                            <Button label="Forward" onClick={() => { }} />
                        </div>
                    </Card>
                ) : (
                    <Card title={`${folder.charAt(0).toUpperCase() + folder.slice(1)} (${filtered.length})`} action={unread > 0 && folder === "inbox" ? <Badge label={`${unread} unread`} color="var(--c-gold)" /> : undefined} className="axiom-animate-fade-in" style={{ flex: 1 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {filtered.map(e => (
                                <div key={e.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: e.read ? "transparent" : "var(--c-bg3)", borderRadius: 4, cursor: "pointer", opacity: e.read ? 0.8 : 1, transition: "0.15s" }}
                                    onClick={() => { setSelEmail(e); markRead(e.id); setAiMode("none"); }}
                                    onMouseEnter={ev => ev.currentTarget.style.background = "var(--c-bg4)"}
                                    onMouseLeave={ev => ev.currentTarget.style.background = e.read ? "transparent" : "var(--c-bg3)"}
                                >
                                    <div style={{ width: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {!e.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--c-gold)", boxShadow: "0 0 6px var(--c-gold)" }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="axiom-flex-between" style={{ marginBottom: 4 }}>
                                            <span style={{ fontSize: 13, color: "var(--c-text)", fontWeight: e.read ? 400 : 600 }}>{e.from === "me" ? "To: " + e.to : e.from.split("<")[0].trim()}</span>
                                            <span className="axiom-text-10-dim">{e.date}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: e.read ? "var(--c-sub)" : "var(--c-text)", fontWeight: e.read ? 400 : 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.subject}</div>
                                        <div className="axiom-text-10-dim" style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.body.replace(/\n/g, " ").substring(0, 120)}...</div>
                                    </div>
                                    {e.deal && (
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Badge label={e.deal} color="var(--c-gold)" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!filtered.length && (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.2 }}>📭</div>
                                    <div className="axiom-text-12-dim">No messages in {folder}.</div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
