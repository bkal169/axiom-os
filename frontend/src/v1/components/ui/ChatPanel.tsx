/**
 * ChatPanel — Axiom OS Phase 2.1
 * Supabase Realtime group chat with @Axiom AI moderator agent.
 * Organized by Deal channel. Slides in from the right as a drawer.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLS } from "../../hooks/useLS";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    channelId: string;
    sender: string;
    body: string;
    type: "user" | "agent" | "system";
    ts: number;
}

interface Channel {
    id: string;
    name: string;
    dealId?: string;
    unread: number;
}

// ─── Default channels ────────────────────────────────────────────────────────
const DEFAULT_CHANNELS: Channel[] = [
    { id: "general", name: "# general", unread: 0 },
    { id: "deals", name: "# deal-flow", unread: 2 },
    { id: "sunset", name: "# sunset-ridge", dealId: "1", unread: 1 },
    { id: "hawk", name: "# hawk-valley", dealId: "2", unread: 0 },
    { id: "meadowbrook", name: "# meadowbrook-pud", dealId: "3", unread: 0 },
];

// ─── @Axiom AI moderator ─────────────────────────────────────────────────────
const AXIOM_RESPONSES: Record<string, string> = {
    summarize: "**Meeting Summary (AI)**\n\nKey discussion points captured:\n1. Site feasibility confirmed pending geotech\n2. LOI target: $9.25M — committee approval required\n3. Next step: Phase I ESA review by Thursday\n\n_Action items auto-extracted — check Tasks._",
    find: "Searching Axiom records...\n\nFound **3 matching records**:\n- 📄 Sunset Ridge — Phase I ESA Draft (Notes)\n- 📁 Site Map Parcel #4521-34B (Site Map)\n- 📋 Risk #7: Geotech Uncertainty (Risk Command)\n\n_Click any to navigate directly._",
    moderate: "✅ **Axiom Moderation Active**\nI'll keep this channel focused on the Sunset Ridge deal. Off-topic threads will be flagged.",
    record: "🎙 **Meeting recording started.** I'm capturing key points. Say `@Axiom stop` when finished.",
    stop: "⏹ **Recording stopped.** Summary is being generated...\n\n---\n**Meeting Brief — Auto-Generated**\n- 3 attendees, 14 minutes\n- Key decision: Proceed to LOI stage\n- Action: David to submit LOI draft by EOD Friday\n\n_Saved to Notes. Tasks created._",
    help: "**@Axiom Commands:**\n```\n@Axiom summarize        → summarize last 20 messages\n@Axiom find [keyword]   → search Axiom records\n@Axiom record           → start meeting notes\n@Axiom stop             → end recording + summary\n@Axiom moderate         → activate moderation\n```",
};

function getAxiomReply(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes("summarize")) return AXIOM_RESPONSES.summarize;
    if (lower.includes("find ") || lower.includes("search")) return AXIOM_RESPONSES.find;
    if (lower.includes("record")) return AXIOM_RESPONSES.record;
    if (lower.includes("stop")) return AXIOM_RESPONSES.stop;
    if (lower.includes("moderate")) return AXIOM_RESPONSES.moderate;
    if (lower.includes("help")) return AXIOM_RESPONSES.help;
    return `Processing your request: "${msg.replace("@Axiom", "").trim()}"...\n\n_Axiom is analyzing your message and Axiom records. Response in a moment._`;
}

// ─── Timestamp helper ────────────────────────────────────────────────────────
function fmtTime(ts: number): string {
    return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ───────────────────────────────────────────────────────────────
interface ChatPanelProps {
    open: boolean;
    onClose: () => void;
    userName?: string;
}

export function ChatPanel({ open, onClose, userName = "You" }: ChatPanelProps) {
    const [channels] = useLS<Channel[]>("axiom_channels", DEFAULT_CHANNELS);
    const [messages, setMessages] = useLS<Message[]>("axiom_messages", [
        { id: "1", channelId: "general", sender: "Sarah Chen", body: "Good morning team — weekly pipeline call at 10am.", type: "user", ts: Date.now() - 3600000 },
        { id: "2", channelId: "deals", sender: "Mike Rodriguez", body: "Hawk Valley inspection is tomorrow. Anyone available?", type: "user", ts: Date.now() - 2400000 },
        { id: "3", channelId: "sunset", sender: "David Thompson", body: "Phase I ESA came back clean! Moving to geotech next.", type: "user", ts: Date.now() - 1800000 },
        { id: "4", channelId: "sunset", sender: "⬡ Axiom", body: "Noted. I've updated the Risk Registry — Geotech status set to In Progress.", type: "agent", ts: Date.now() - 1750000 },
    ]);

    const [activeChannel, setActiveChannel] = useState("general");
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const channelMsgs = messages.filter(m => m.channelId === activeChannel);

    // Auto-scroll on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [channelMsgs.length, activeChannel]);

    // Focus input when panel opens
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 200);
    }, [open]);

    const sendMessage = useCallback(() => {
        const body = input.trim();
        if (!body) return;

        const userMsg: Message = {
            id: crypto.randomUUID(),
            channelId: activeChannel,
            sender: userName,
            body,
            type: "user",
            ts: Date.now(),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // If @Axiom is mentioned, trigger agent response
        if (body.toLowerCase().includes("@axiom")) {
            setIsTyping(true);
            setTimeout(() => {
                const agentMsg: Message = {
                    id: crypto.randomUUID(),
                    channelId: activeChannel,
                    sender: "⬡ Axiom",
                    body: getAxiomReply(body),
                    type: "agent",
                    ts: Date.now(),
                };
                setMessages(prev => [...prev, agentMsg]);
                setIsTyping(false);
            }, 1200);
        }
    }, [input, activeChannel, userName, setMessages]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop (subtle) */}
            <div className="axiom-chat-backdrop" onClick={onClose} />

            {/* Panel */}
            <div className="axiom-chat-panel">
                {/* Header */}
                <div className="axiom-chat-header">
                    <div>
                        <div className="axiom-chat-title">Team Chat</div>
                        <div className="axiom-chat-subtitle">Type @Axiom to summon your AI assistant</div>
                    </div>
                    <button className="axiom-chat-close" onClick={onClose}>✕</button>
                </div>

                <div className="axiom-chat-body">
                    {/* Sidebar channel list */}
                    <div className="axiom-chat-sidebar">
                        <div className="axiom-chat-sidebar-label">CHANNELS</div>
                        {channels.map(ch => (
                            <div
                                key={ch.id}
                                className={`axiom-chat-channel${activeChannel === ch.id ? " axiom-chat-channel--active" : ""}`}
                                onClick={() => setActiveChannel(ch.id)}
                            >
                                <span className="axiom-chat-channel-name">{ch.name}</span>
                                {ch.unread > 0 && <span className="axiom-chat-badge">{ch.unread}</span>}
                            </div>
                        ))}
                        <div className="axiom-chat-sidebar-label" style={{ marginTop: 16 }}>DIRECT</div>
                        {["Sarah Chen", "Mike Rodriguez", "David Thompson"].map(n => (
                            <div key={n} className="axiom-chat-channel">
                                <span className="axiom-chat-dm-dot" />
                                <span className="axiom-chat-channel-name" style={{ fontSize: 11 }}>{n}</span>
                            </div>
                        ))}
                    </div>

                    {/* Messages area */}
                    <div className="axiom-chat-messages-col">
                        <div className="axiom-chat-messages-area">
                            {channelMsgs.length === 0 && (
                                <div className="axiom-chat-empty">No messages yet. Be the first to say something — or type <strong>@Axiom help</strong>.</div>
                            )}
                            {channelMsgs.map(msg => (
                                <div key={msg.id} className={`axiom-chat-msg${msg.type === "agent" ? " axiom-chat-msg--agent" : msg.type === "system" ? " axiom-chat-msg--system" : ""}`}>
                                    <div className="axiom-chat-msg-meta">
                                        <span className={`axiom-chat-msg-sender${msg.type === "agent" ? " axiom-chat-msg-sender--agent" : ""}`}>
                                            {msg.sender}
                                        </span>
                                        <span className="axiom-chat-msg-time">{fmtTime(msg.ts)}</span>
                                    </div>
                                    <div className="axiom-chat-msg-body"
                                        dangerouslySetInnerHTML={{ __html: msg.body.replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                                    />
                                </div>
                            ))}
                            {isTyping && (
                                <div className="axiom-chat-msg axiom-chat-msg--agent">
                                    <div className="axiom-chat-msg-meta">
                                        <span className="axiom-chat-msg-sender axiom-chat-msg-sender--agent">⬡ Axiom</span>
                                    </div>
                                    <div className="axiom-chat-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="axiom-chat-input-row">
                            <input
                                ref={inputRef}
                                className="axiom-chat-input"
                                placeholder={`Message ${channels.find(c => c.id === activeChannel)?.name ?? "channel"}...`}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                className="axiom-chat-send"
                                onClick={sendMessage}
                                disabled={!input.trim()}
                            >
                                ↑
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
