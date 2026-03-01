import { useLS } from "../../hooks/useLS";
import { Card, Badge, Button } from "../../components/ui/components";
import { Tabs } from "../../components/ui/layout";

export function Connectors() {
    const [list] = useLS("axiom_connectors", [
        { id: 1, name: "CoStar API", type: "API", status: "Connected", key: "cs_••••••••", endpoint: "https://api.costar.com/v1" },
        { id: 2, name: "Regrid Parcels", type: "API", status: "Connected", key: "rg_••••••••", endpoint: "https://app.regrid.com/api" },
        { id: 3, name: "FEMA Flood API", type: "API", status: "Idle", key: "", endpoint: "https://msc.fema.gov" },
        { id: 4, name: "Google Maps", type: "API", status: "Connected", key: "gm_••••••••", endpoint: "https://maps.googleapis.com" },
        { id: 5, name: "ATTOM Data", type: "API", status: "Idle", key: "", endpoint: "https://api.attomdata.com" },
        { id: 6, name: "SketchUp MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3001" },
        { id: 7, name: "GIS Data MCP", type: "MCP", status: "Offline", key: "", endpoint: "ws://localhost:3002" },
        { id: 8, name: "Salesforce CRM", type: "App", status: "Connected", key: "", endpoint: "" },
        { id: 9, name: "Procore", type: "App", status: "Idle", key: "", endpoint: "" },
        { id: 10, name: "DocuSign", type: "App", status: "Idle", key: "", endpoint: "" },
    ]);

    const SC: Record<string, string> = {
        Connected: "var(--c-green)",
        Idle: "var(--c-amber)",
        Offline: "var(--c-dim)"
    };

    const mcpServers = [
        { name: "SketchUp Live Model Server", desc: "3D model streaming and updates", port: 3001 },
        { name: "GIS / Parcel Data MCP", desc: "Live parcel, zoning, and GIS data", port: 3002 },
        { name: "Municipal Records MCP", desc: "Permit history, zoning codes", port: 3003 },
        { name: "Environmental Data MCP", desc: "FEMA, wetlands, species databases", port: 3004 },
        { name: "Market Data MCP", desc: "Live comp sales and pricing", port: 3005 },
        { name: "Construction Cost MCP", desc: "RSMeans and local bid data", port: 3006 },
    ];

    return (
        <Tabs tabs={["Connections", "MCP Servers", "Webhooks"]}>
            <div>
                <Card title="Active Connectors" action={<Badge label={list.filter(c => c.status === "Connected").length + " Active"} color="var(--c-green)" />}>
                    <div className="axiom-table-container">
                        <table className="axiom-table">
                            <thead>
                                <tr className="axiom-th-left-10-dim-p10-bb">
                                    <th className="axiom-th-left-10-dim-p10-bb">Name</th>
                                    <th className="axiom-th-left-10-dim-p10-bb">Type</th>
                                    <th className="axiom-th-left-10-dim-p10-bb">Endpoint</th>
                                    <th className="axiom-th-left-10-dim-p10-bb">Status</th>
                                    <th className="axiom-th-left-10-dim-p10-bb">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map(c => (
                                    <tr key={c.id} className="axiom-tr-bb">
                                        <td className="axiom-td-13-p10">{c.name}</td>
                                        <td className="axiom-td-p10"><Badge label={c.type} color={c.type === "MCP" ? "var(--c-purple)" : c.type === "App" ? "var(--c-teal)" : "var(--c-blue)"} /></td>
                                        <td className="axiom-td-11-dim-p10">{c.endpoint || "— "}</td>
                                        <td className="axiom-td-p10"><Badge label={c.status} color={SC[c.status] || "var(--c-dim)"} /></td>
                                        <td className="axiom-td-p10">
                                            <Button label={c.status === "Connected" ? "Disconnect" : "Connect"} onClick={() => { }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div>
                <Card title="MCP - Model Context Protocol Servers">
                    <div className="axiom-text-12-dim" style={{ marginBottom: 16 }}>
                        These local servers extend Axiom AI capabilities with offline datasets and live model streaming.
                    </div>
                    <div className="axiom-grid-1-1fr" style={{ gap: 14 }}>
                        {mcpServers.map((s, i) => (
                            <div key={i} className="axiom-card-inner-14">
                                <div className="axiom-flex-sb" style={{ marginBottom: 8 }}>
                                    <div className="axiom-text-13-bold">{s.name}</div>
                                    <Badge label="OFFLINE" color="var(--c-dim)" />
                                </div>
                                <div className="axiom-text-10-dim" style={{ marginBottom: 10 }}>{s.desc}</div>
                                <div className="axiom-flex-sb-center">
                                    <div className="axiom-text-11-gold-mono">localhost:{s.port}</div>
                                    <Button label="Start" onClick={() => { }} variant="gold" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div>
                <Card title="Incoming Webhooks">
                    <div className="axiom-widget-placeholder">
                        <div className="axiom-text-14-dim" style={{ marginBottom: 10 }}>No webhooks configured</div>
                        <Button label="Add Webhook Endpoint" onClick={() => { }} />
                    </div>
                </Card>
            </div>
        </Tabs>
    );
}
