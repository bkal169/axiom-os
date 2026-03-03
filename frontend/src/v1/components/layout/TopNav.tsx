import { useState, useEffect } from "react";
import { useAuth, useTier } from "../../context/AuthContext";
import { useProject } from "../../context/ProjectContext";
import { useLS } from "../../hooks/useLS";

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
                    background: "var(--c-bg3)", display: "flex", alignItems: "center", gap: 4
                }}
                onClick={() => setOpen(!open)}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? "var(--c-gold)" : "var(--c-dim)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

export function TopNav({ title, setView }: { title: string, setView: (v: string) => void }) {
    const { user, logout } = useAuth() as any;
    const tierCtx = useTier() as any;
    const tier = tierCtx?.tier || "FREE";
    const { project, setProject, allProjects, activeProjectId, switchProject, createProject } = useProject() as any;

    const [lightMode, setLightMode] = useState(false);

    useEffect(() => {
        if (lightMode) {
            document.body.classList.add("light-mode");
        } else {
            document.body.classList.remove("light-mode");
        }
    }, [lightMode]);

    return (
        <div style={{
            display: "flex", alignItems: "center", padding: "16px 32px",
            borderBottom: "1px solid var(--c-border)", background: "var(--c-bg2)", zIndex: 10,
            justifyContent: "space-between"
        }}>
            <div style={{ fontSize: 14, color: "var(--c-gold)", letterSpacing: 2, flex: 1, fontWeight: 600 }}>{title}</div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    style={{ background: "var(--c-bg3)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "4px 8px", fontSize: 10, borderRadius: 3, cursor: "pointer" }}
                    onClick={() => setLightMode(!lightMode)}
                    title="Toggle Theme"
                >
                    {lightMode ? "🌙 Dark" : "☀️ Light"}
                </button>

                {user && <span style={{ fontSize: 9, color: "var(--c-green)", background: "color-mix(in srgb, var(--c-green) 12%, transparent)", padding: "3px 8px", borderRadius: 4 }}>● Synced</span>}

                {tier && tier.toUpperCase() !== "FREE" && (
                    <span style={{ fontSize: 9, color: "var(--c-gold)", background: "color-mix(in srgb, var(--c-gold) 12%, transparent)", padding: "3px 8px", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>
                        {tier}
                    </span>
                )}

                {/* Multi-project switcher */}
                {user && allProjects.length > 0 ? (
                    <select
                        style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-gold)", padding: "4px 6px", fontSize: 10, borderRadius: 3, maxWidth: 160 }}
                        value={activeProjectId || ""}
                        onChange={e => {
                            if (e.target.value === "__new__") {
                                const n = prompt("New project name:");
                                if (n) createProject(n, project.state || "FL", "");
                            } else if (e.target.value) {
                                switchProject(e.target.value);
                            }
                        }}
                        title="Switch Project"
                    >
                        {allProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name || "Untitled"}</option>)}
                        <option value="__new__">+ New Project</option>
                    </select>
                ) : (
                    <input
                        style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "4px 8px", fontSize: 10, borderRadius: 3, width: 160 }}
                        value={project.name}
                        onChange={e => setProject({ ...project, name: e.target.value })}
                        placeholder="Project Name"
                    />
                )}
                <input
                    style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "4px 8px", fontSize: 10, borderRadius: 3, width: 160 }}
                    value={project.address}
                    onChange={e => setProject({ ...project, address: e.target.value })}
                    placeholder="Address / APN"
                />
                <select
                    style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", color: project.state ? "var(--c-gold)" : "var(--c-dim)", padding: "4px 6px", fontSize: 10, borderRadius: 3, width: 90 }}
                    value={project.state}
                    onChange={e => setProject({ ...project, state: e.target.value })}
                >
                    {"AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY".split(",").map(s => <option key={s} value={s}>{s || "State"}</option>)}
                </select>
                <input
                    style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", color: "var(--c-text)", padding: "4px 8px", fontSize: 10, borderRadius: 3, width: 130 }}
                    value={project.municipality}
                    onChange={e => setProject({ ...project, municipality: e.target.value })}
                    placeholder="City / County"
                />

                {user && (
                    <button
                        style={{ background: "transparent", border: "none", color: "var(--c-dim)", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}
                        onClick={logout}
                        title="Logout"
                    >
                        ⏻
                    </button>
                )}

                <NotifBell setView={setView} />
            </div>
        </div>
    );
}
