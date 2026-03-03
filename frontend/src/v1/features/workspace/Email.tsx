import { useState } from "react";
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

    const filtered = (emails as Email[]).filter(e => e.folder === folder);
    const unread = (emails as Email[]).filter(e => !e.read && e.folder === "inbox").length;

    const sendEmail = () => {
        if (!draft.to || !draft.subject) return;
        const sent: Email = { id: Date.now(), from: "me", to: draft.to, subject: draft.subject, body: draft.body, date: new Date().toISOString().replace("T", " ").substring(0, 16), read: true, folder: "sent", deal: draft.deal };
        setEmails([...(emails as Email[]), sent]);
        setDraft({ to: "", subject: "", body: "", deal: "" });
        setComposing(false);
    };

    const markRead = (id: number) => setEmails((emails as Email[]).map(e => e.id === id ? { ...e, read: true } : e));

    return (
        <div className="axiom-flex-row" style={{ gap: 14, alignItems: "flex-start" }}>
            {/* Sidebar */}
            <div style={{ width: 160, flexShrink: 0 }}>
                <Button variant="gold" label="+ Compose" className="axiom-full-width" onClick={() => { setComposing(true); setSelEmail(null); }} />
                <div style={{ marginTop: 12 }}>
                    {FOLDERS.map(f => (
                        <div key={f.id} className="axiom-flex-between" style={{ padding: "6px 8px", cursor: "pointer", borderRadius: 3, marginBottom: 2, background: folder === f.id ? "var(--c-bg3)" : "transparent", borderLeft: `2px solid ${folder === f.id ? "var(--c-gold)" : "transparent"}` }} onClick={() => { setFolder(f.id); setSelEmail(null); }}>
                            <span style={{ fontSize: 12, color: "var(--c-text)" }}>{f.label}</span>
                            <span className="axiom-text-10-dim">{(emails as Email[]).filter(e => e.folder === f.id).length}</span>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 16 }}>
                    <div className="axiom-text-10-dim" style={{ letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Connected</div>
                    {[["Gmail", "var(--c-green)"], ["Outlook", "var(--c-dim)"], ["SMTP", "var(--c-dim)"]].map(([name, color]) => (
                        <div key={name} className="axiom-flex-row" style={{ gap: 6, padding: "3px 0" }}>
                            <div style={{ width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: "var(--c-sub)" }}>{name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main area */}
            <div style={{ flex: 1 }}>
                {composing ? (
                    <Card title="Compose Email">
                        <div className="axiom-grid-2" style={{ marginBottom: 10 }}>
                            <Field label="To"><input className="axiom-input" value={draft.to} onChange={e => setDraft(d => ({ ...d, to: e.target.value }))} placeholder="recipient@email.com" /></Field>
                            <Field label="Linked Deal"><input className="axiom-input" value={draft.deal} onChange={e => setDraft(d => ({ ...d, deal: e.target.value }))} placeholder="Optional" /></Field>
                        </div>
                        <Field label="Subject"><input className="axiom-input" value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} /></Field>
                        <Field label="Body"><textarea className="axiom-textarea" style={{ height: 200 }} value={draft.body} onChange={e => setDraft(d => ({ ...d, body: e.target.value }))} /></Field>
                        <div className="axiom-flex-row" style={{ gap: 8 }}>
                            <Button variant="gold" label="Send" onClick={sendEmail} />
                            <Button label="Cancel" onClick={() => setComposing(false)} />
                        </div>
                    </Card>
                ) : selEmail ? (
                    <Card title={selEmail.subject} action={<Button label="← Back" onClick={() => setSelEmail(null)} />}>
                        <div className="axiom-flex-row axiom-text-10-dim" style={{ gap: 12, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--c-border)" }}>
                            <span>From: {selEmail.from}</span>
                            <span>To: {selEmail.to}</span>
                            <span>{selEmail.date}</span>
                            {selEmail.deal && <Badge label={selEmail.deal} color="var(--c-gold)" />}
                        </div>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "'Courier New',monospace", fontSize: 13, color: "var(--c-sub)", lineHeight: 1.6 }}>{selEmail.body}</pre>
                        <div className="axiom-flex-row" style={{ gap: 8, marginTop: 14 }}>
                            <Button variant="gold" label="Reply" onClick={() => { setComposing(true); setSelEmail(null); setDraft({ to: selEmail.from === "me" ? selEmail.to : selEmail.from, subject: "RE: " + selEmail.subject, body: "", deal: selEmail.deal }); }} />
                            <Button label="Forward" onClick={() => { }} />
                        </div>
                    </Card>
                ) : (
                    <Card title={`${folder.charAt(0).toUpperCase() + folder.slice(1)} (${filtered.length})`} action={unread > 0 && folder === "inbox" ? <Badge label={`${unread} unread`} color="var(--c-gold)" /> : undefined}>
                        {filtered.map(e => (
                            <div key={e.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--c-border)", cursor: "pointer", opacity: e.read ? 0.85 : 1 }} onClick={() => { setSelEmail(e); markRead(e.id); }}>
                                {!e.read && <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--c-gold)", marginTop: 6, flexShrink: 0 }} />}
                                <div style={{ flex: 1 }}>
                                    <div className="axiom-flex-between">
                                        <span style={{ fontSize: 12, color: "var(--c-text)", fontWeight: e.read ? 400 : 700 }}>{e.from === "me" ? "To: " + e.to : e.from}</span>
                                        <span className="axiom-text-10-dim">{e.date}</span>
                                    </div>
                                    <div style={{ fontSize: 13, color: e.read ? "var(--c-sub)" : "var(--c-text)", fontWeight: e.read ? 400 : 600, marginTop: 2 }}>{e.subject}</div>
                                    <div className="axiom-text-10-dim" style={{ marginTop: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{e.body.substring(0, 100)}...</div>
                                </div>
                                {e.deal && <Badge label={e.deal} color="var(--c-gold)" />}
                            </div>
                        ))}
                        {!filtered.length && <div className="axiom-text-12-dim" style={{ textAlign: "center", padding: 20 }}>No messages in {folder}.</div>}
                    </Card>
                )}
            </div>
        </div>
    );
}
