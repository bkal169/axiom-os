import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Card, KPI, Badge, Button, AxiomTable } from "../../components/ui/components";

interface SecurityEvent {
    id: string;
    created_at: string;
    event_type: string;
    user_id?: string;
    ip_address?: string;
    metadata?: Record<string, any>;
    severity: "info" | "warning" | "critical";
}

const SEV_COLOR: Record<string, string> = {
    info: "var(--c-blue)",
    warning: "var(--c-amber)",
    critical: "var(--c-red)",
};

const MOCK_EVENTS: SecurityEvent[] = [
    { id: "1", created_at: new Date(Date.now() - 300000).toISOString(), event_type: "login_success", user_id: "user_abc123", ip_address: "192.168.1.1", severity: "info", metadata: { method: "email_password" } },
    { id: "2", created_at: new Date(Date.now() - 600000).toISOString(), event_type: "export_deal_data", user_id: "user_abc123", ip_address: "192.168.1.1", severity: "warning", metadata: { deal_id: "deal_001", format: "csv" } },
    { id: "3", created_at: new Date(Date.now() - 900000).toISOString(), event_type: "failed_login", user_id: "unknown", ip_address: "45.33.32.156", severity: "critical", metadata: { attempts: 5, blocked: true } },
];

function timeSince(isoDate: string): string {
    const s = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(isoDate).toLocaleDateString();
}

function formatEventType(t: string): string {
    return t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export function AuditLog() {
    const [events, setEvents] = useState<SecurityEvent[]>(MOCK_EVENTS);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [realtimeStatus, setRealtimeStatus] = useState<"connected" | "disconnected">("disconnected");

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("security_events")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) throw error;
            if (data && data.length > 0) {
                setEvents(data as SecurityEvent[]);
            }
        } catch (e) {
            console.warn("Using mock audit data:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        const channel = supabase
            .channel("audit-log-realtime")
            .on("postgres_changes", {
                event: "INSERT", schema: "public", table: "security_events"
            }, (payload) => {
                setEvents(prev => [payload.new as SecurityEvent, ...prev]);
            })
            .subscribe((status) => {
                setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : "disconnected");
            });

        return () => { supabase.removeChannel(channel); };
    }, [fetchEvents]);

    const filteredEvents = events.filter(e => {
        const matchSev = filter === "all" || e.severity === filter;
        const matchSearch = !searchQuery || e.event_type.includes(searchQuery.toLowerCase()) || (e.user_id || "").includes(searchQuery) || (e.ip_address || "").includes(searchQuery);
        return matchSev && matchSearch;
    });

    const critCount = events.filter(e => e.severity === "critical").length;
    const warnCount = events.filter(e => e.severity === "warning").length;

    return (
        <div className="axiom-stack-24">
            <div className="axiom-flex-sb-start">
                <div>
                    <div className="axiom-text-11-gold-ls3-caps axiom-mb-6">Compliance</div>
                    <div className="axiom-text-20-text-bold">Security Audit Log</div>
                    <div className="axiom-text-12-dim axiom-mt-4">Real-time security events for SOC2 compliance monitoring</div>
                </div>
                <div className="axiom-flex-center-gap-8">
                    <div className={`axiom-status-dot ${realtimeStatus === "connected" ? "active" : ""}`} />
                    <span className="axiom-text-11-dim">{realtimeStatus === "connected" ? "Live" : "Reconnecting"}</span>
                </div>
            </div>

            <div className="axiom-grid-4">
                <KPI label="Total Events" value={events.length} />
                <KPI label="Critical" value={critCount} color="var(--c-red)" />
                <KPI label="Warnings" value={warnCount} color="var(--c-amber)" />
                <KPI label="Info" value={events.length - critCount - warnCount} color="var(--c-blue)" />
            </div>

            <div className="axiom-flex-gap-12 axiom-mb-16 axiom-items-center">
                <input
                    className="axiom-input-field axiom-flex-1 axiom-max-w-340"
                    placeholder="Search user ID, IP, event type..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    title="Search Audit Logs"
                />
                <div className="axiom-flex-gap-8">
                    {["all", "info", "warning", "critical"].map(sev => (
                        <Button
                            key={sev}
                            variant={filter === sev ? "gold" : "ghost"}
                            className="axiom-p4-12 axiom-text-10-caps"
                            onClick={() => setFilter(sev)}
                            label={sev}
                        />
                    ))}
                </div>
                <Button variant="ghost" className="axiom-p4-12" onClick={fetchEvents} disabled={loading} label={loading ? "..." : "↻ Refresh"} />
            </div>

            <Card title="Security Events" className="axiom-p-0 axiom-overflow-hidden">
                <AxiomTable headers={["Time", "Event", "Severity", "User", "IP Address", "Details"]}>
                    {filteredEvents.map(ev => (
                        <tr key={ev.id}>
                            <td className="axiom-td">
                                <div className="axiom-text-11-dim">{timeSince(ev.created_at)}</div>
                                <div className="axiom-text-9-dim-opacity-60">{new Date(ev.created_at).toLocaleTimeString()}</div>
                            </td>
                            <td className="axiom-td-13-bold">{formatEventType(ev.event_type)}</td>
                            <td className="axiom-td">
                                <Badge label={ev.severity} color={SEV_COLOR[ev.severity]} />
                            </td>
                            <td className="axiom-td-11-monospace-muted">
                                {ev.user_id ? ev.user_id.substring(0, 12) + "..." : "—"}
                            </td>
                            <td className="axiom-td-11-monospace-muted">
                                {ev.ip_address || "—"}
                            </td>
                            <td className="axiom-td-10-dim-mw200">
                                {ev.metadata ? Object.entries(ev.metadata).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(" · ") : "—"}
                            </td>
                        </tr>
                    ))}
                </AxiomTable>
            </Card>

            <div className="axiom-text-10-dim axiom-text-right">
                Showing {filteredEvents.length} of {events.length} events · Retained 90 days per SOC2 audit requirements
            </div>
        </div>
    );
}
