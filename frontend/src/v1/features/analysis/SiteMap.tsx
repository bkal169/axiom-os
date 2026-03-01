import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, Badge } from "../../components/ui/components";
import { useProjectState } from "../../hooks/useProjectState";
import { DEFAULT_SITE } from "../../lib/defaults";

// Fix leaflet default icon issue in bundled React apps
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Props { projectId: string; }

export function SiteMap({ projectId }: Props) {
    const { project } = useProjectState(projectId);
    const comps: any[] = project.comps ?? [];
    const site = project.site ?? DEFAULT_SITE;

    // Default center (LA). Will be replaced by geocoded position once a Maps API is wired.
    const [position] = useState<[number, number]>([34.0522, -118.2437]);

    return (
        <Card
            title="Subject Property & Context Map"
            action={<Badge label="GIS Active" color="var(--c-green)" />}
            className="axiom-animate-slide-up"
        >
            <div style={{ height: 400, width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid var(--c-border)" }}>
                <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* Subject property */}
                    <Marker position={position}>
                        <Popup>
                            <strong>{project.name || "Subject Property"}</strong><br />
                            {site.address || "Proposed Development Site"}
                        </Popup>
                    </Marker>

                    {/* Comparables — offset coordinates relative to center */}
                    {comps.map((c, i) => {
                        const lat = position[0] + (i % 2 === 0 ? 0.015 : -0.01) * Math.ceil((i + 1) / 2);
                        const lng = position[1] + (i % 3 === 0 ? -0.02 : 0.015) * Math.ceil((i + 1) / 2);
                        return (
                            <Marker key={c.id || i} position={[lat, lng]}>
                                <Popup>
                                    <strong>{c.name}</strong><br />
                                    {c.status} — {c.lots} Lots<br />
                                    <span style={{ color: "var(--c-gold)" }}>${c.pricePerLot?.toLocaleString()}/lot</span>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
            <div className="axiom-text-11-dim" style={{ marginTop: 12 }}>
                Displaying location for <strong>{project.name || "the current project"}</strong> and {comps.length} comparable{comps.length !== 1 ? "s" : ""}. Interactive mapping provides spatial context for diligence items.
            </div>
        </Card>
    );
}
