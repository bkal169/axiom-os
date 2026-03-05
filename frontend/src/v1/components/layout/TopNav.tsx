import { useState, useEffect } from "react";
import { useAuth, useTier } from "../../context/AuthContext";
import { useProject } from "../../context/ProjectContext";
import { useLS } from "../../hooks/useLS";
import { ProjectMetaEditor } from "../../features/management/ProjectMetaEditor";

function NotifBell({ setView }: { setView: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const [notifs, setNotifs] = useLS("axiom_notifs_list", [
        { id: 1, title: "Sunset Ridge LOI Due", body: "LOI deadline is in 5 days (Feb 28)", time: "2 hours ago", type: "deadline", read: false, section: "deals" },
        { id: 2, title: "New Listing Match", body: "4500 Hillside Dr matches 'Infill SFR' search", time: "4 hours ago", type: "listing", read: false, section: "mls" },
        { id: 3, title: "Pipeline Report Ready", body: "Weekly pipeline summary generated", time: "Yesterday", type: "report", read: true, section: "reports" },
        { id: 4, title: "Risk Score Alert", body: "Meadowbrook PUD risk score dropped to 42", time: "2 days ago", type: "risk", read: true, section: "risk" },
        { id: 5, title: "DD Item Complete", body: "Phase I ESA clean for Sunset Ridge", time: "3 days ago", type: "dd", read: true, section: "process" },
    ]);

    const unread = notifs.filter((n: any) => !n.read).length;
    const markRead = (id: number) => setNotifs(notifs.map((n: any) => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifs(notifs.map((n: any) => ({ ...n, read: true })));

    return (
        <div style={{ position: "relative" }}>
            <div
                style={{
                    cursor: "pointer", padding: "4px 8px", border: "1px solid var(--c-border)", borderRadius: 3,
                    background: "var(--c-bg3)", display: "flex", alignItems: "center", gap: 4, height: 28
                }}
                onClick={() => setOpen(!open)}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? "var(--c-gold)" : "var(--c-dim)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unread > 0 && <span style={{ background: "var(--c-red)", color: "#fff", fontSize: 8, padding: "1px 4px", borderRadius: 6, fontWeight: 700 }}>{unread}</span>}
            </div>
            {open && (
                <div style={{
                    position: "absolute", top: "100%", right: 0, marginTop: 6, width: 320,
                    background: "var(--c-bg3)", border: "1px solid var(--c-border)", borderRadius: 4, zIndex: 999,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
                }}>
                    <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--c-gold)", letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Notifications</span>
                        <button style={{ background: "transparent", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 9 }} onClick={markAllRead}>Mark all read</button>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                        {notifs.map((n: any) => (
                            <div key={n.id} style={{
                                padding: "8px 14px", borderBottom: "1px solid #0F1117", cursor: "pointer",
                                opacity: n.read ? 0.6 : 1, background: n.read ? "transparent" : "var(--c-bg)44",
                            }} onClick={() => { markRead(n.id); setView(n.section); setOpen(false); }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        {!n.read && <div style={{ width: 5, height: 5, borderRadius: 3, background: "var(--c-gold)" }} />}
                                        <span style={{ fontSize: 12, color: "var(--c-text)", fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                                    </div>
                                    <span style={{ fontSize: 8, color: "var(--c-dim)" }}>{n.time}</span>
                                </div>
                                <div style={{ fontSize: 10, color: "var(--c-dim)", marginTop: 2, marginLeft: n.read ? 0 : 11 }}>{n.body}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "8px 14px", borderTop: "1px solid var(--c-border)", textAlign: "center" }}>
                        <button style={{ background: "transparent", border: "none", color: "var(--c-gold)", cursor: "pointer", fontSize: 9 }} onClick={() => { setView("settings"); setOpen(false); }}>Notification Settings</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function TopNav({
    title, setView,
    tickerOpen, setTickerOpen,
    chatOpen, setChatOpen,
    meetingOpen, setMeetingOpen,
    isSplit, setIsSplit,
    splitView, setSplitView,
    onDetach
}: {
    title: string, setView: (v: string) => void,
    tickerOpen?: boolean, setTickerOpen?: (v: boolean) => void,
    chatOpen?: boolean, setChatOpen?: (v: boolean) => void,
    meetingOpen?: boolean, setMeetingOpen?: (v: boolean) => void,
    isSplit?: boolean, setIsSplit?: (v: boolean) => void,
    splitView?: string, setSplitView?: (v: string) => void,
    onDetach?: () => void
}) {
    const { user, logout } = useAuth() as any;
    const tierCtx = useTier() as any;
    const tier = tierCtx?.tier || "FREE";
    const { project, allProjects, activeProjectId, switchProject, createProject } = useProject() as any;

    const [lightMode, setLightMode] = useState(false);
    const [isEditingMeta, setIsEditingMeta] = useState(false);

    useEffect(() => {
        if (lightMode) {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }
    }, [lightMode]);

    return (
        <div style={{
            display: "flex", alignItems: "center", padding: "12px 32px",
            borderBottom: "1px solid var(--c-border)", background: "var(--c-bg2)", zIndex: 10,
            justifyContent: "space-between", minHeight: 64
        }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--c-gold)", letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>{title}</div>
                <div
                    onClick={() => setIsEditingMeta(true)}
                    style={{
                        fontSize: 10, color: "var(--c-dim)", marginTop: 2, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6
                    }}
                >
                    <span style={{ color: "var(--c-sub)" }}>{project.address || "Add Address"}</span>
                    <span>•</span>
                    <span>{project.municipality || "Add City"}, {project.state || "--"}</span>
                    <span style={{ fontSize: 8 }}>✎</span>
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Multi-project switcher - Premium Style */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--c-bg3)", border: "1px solid var(--c-border)", padding: "2px 8px", borderRadius: 4 }}>
                    <div style={{ fontSize: 8, color: "var(--c-dim)", letterSpacing: 1, fontWeight: 700 }}>ACTIVE PROJECT</div>
                    <select
                        style={{
                            background: "transparent", border: "none", color: "var(--c-gold)",
                            fontSize: 11, fontWeight: 600, padding: "4px 0", outline: "none", cursor: "pointer",
                            minWidth: 140
                        }}
                        value={activeProjectId || ""}
                        onChange={e => {
                            if (e.target.value === "__new__") {
                                const n = prompt("Enter project name:");
                                if (n) createProject(n, "FL", "");
                            } else if (e.target.value) {
                                switchProject(e.target.value);
                            }
                        }}
                    >
                        {allProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name || "Untitled"}</option>)}
                        <option value="__new__">+ NEW PROJECT</option>
                    </select>
                </div>

                <div style={{ width: 1, height: 24, background: "var(--c-border)", margin: "0 4px" }}></div>

                {setIsSplit && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                            style={{
                                background: isSplit ? "var(--c-bg4)" : "var(--c-bg3)",
                                border: "1px solid var(--c-border)",
                                color: isSplit ? "var(--c-gold)" : "var(--c-dim)",
                                width: 28, height: 28, borderRadius: 3, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, transition: "0.15s"
                            }}
                            onClick={() => setIsSplit(!isSplit)}
                            title="Toggle Split Screen"
                        >
                            ⧉
                        </button>
                        <button
                            style={{
                                background: "var(--c-bg3)",
                                border: "1px solid var(--c-border)",
                                color: "var(--c-gold)",
                                width: 28, height: 28, borderRadius: 3, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 13, transition: "0.15s"
                            }}
                            onClick={onDetach}
                            title="Detach view to floating panel"
                        >
                            ↗
                        </button>
                        {isSplit && setSplitView && (
                            <select
                                style={{
                                    background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-gold)",
                                    fontSize: 10, fontWeight: 600, padding: "4px 8px", outline: "none", cursor: "pointer",
                                    borderRadius: 3, minWidth: 100
                                }}
                                value={splitView}
                                onChange={e => setSplitView(e.target.value)}
                                title="Select view for split pane"
                            >
                                <option value="notes">NOTES</option>
                                <option value="copilot">COPILOT</option>
                                <option value="calendar">CALENDAR</option>
                                <option value="mls">MLS</option>
                                <option value="analyzer">ANALYZER</option>
                                <option value="dashboard">DASHBOARD</option>
                            </select>
                        )}
                    </div>
                )}

                <div style={{ width: 1, height: 24, background: "var(--c-border)", margin: "0 4px" }}></div>

                {setTickerOpen && (
                    <button
                        style={{ background: tickerOpen ? "var(--c-bg4)" : "var(--c-bg3)", border: "1px solid var(--c-border)", color: tickerOpen ? "var(--c-gold)" : "var(--c-dim)", colorScheme: "dark", width: 28, height: 28, borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "0.15s" }}
                        onClick={() => setTickerOpen(!tickerOpen)}
                        title="Toggle Market Ticker"
                    >
                        📈
                    </button>
                )}

                {setChatOpen && (
                    <button
                        style={{ background: chatOpen ? "var(--c-bg4)" : "var(--c-bg3)", border: "1px solid var(--c-border)", color: chatOpen ? "var(--c-gold)" : "var(--c-dim)", colorScheme: "dark", width: 28, height: 28, borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "0.15s" }}
                        onClick={() => setChatOpen(!chatOpen)}
                        title="Toggle Group Chat"
                    >
                        💬
                    </button>
                )}

                {setMeetingOpen && (
                    <button
                        style={{ background: meetingOpen ? "var(--c-bg4)" : "var(--c-bg3)", border: "1px solid var(--c-border)", color: meetingOpen ? "var(--c-gold)" : "var(--c-dim)", colorScheme: "dark", width: 28, height: 28, borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "0.15s" }}
                        onClick={() => setMeetingOpen(!meetingOpen)}
                        title="Toggle Meeting Recorder"
                    >
                        🎙️
                    </button>
                )}

                <button
                    style={{ background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-dim)", width: 28, height: 28, borderRadius: 3, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setLightMode(!lightMode)}
                    title="Toggle Theme"
                >
                    {lightMode ? "🌙" : "☀️"}
                </button>

                {tier && tier.toUpperCase() !== "FREE" && (
                    <span style={{ fontSize: 9, color: "var(--c-gold)", background: "color-mix(in srgb, var(--c-gold) 12%, transparent)", padding: "4px 10px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                        {tier}
                    </span>
                )}

                {user && (
                    <button
                        style={{ background: "transparent", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 16, padding: "2px 6px" }}
                        onClick={logout}
                        title="Logout"
                    >
                        ⏻
                    </button>
                )}

                <NotifBell setView={setView} />
            </div>

            {isEditingMeta && <ProjectMetaEditor projectId={activeProjectId} onClose={() => setIsEditingMeta(false)} />}
        </div>
    );
}
