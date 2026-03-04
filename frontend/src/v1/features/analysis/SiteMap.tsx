import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, Badge } from "../../components/ui/components";
import { useProjectState } from "../../hooks/useProjectState";
import { DEFAULT_SITE } from "../../lib/defaults";

// Fix leaflet default icon in bundled React apps
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Comp marker — smaller gold dot
const CompIcon = L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;background:#D4A017;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

interface LatLng { lat: number; lng: number; }

interface Comp {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    lots?: number;
    price_per_lot?: number;
    price?: number;
    sale_date?: string;
    status: string;
    lat?: number;
    lng?: number;
    source?: string;
}

interface Props { projectId: string; }

async function geocode(query: string): Promise<LatLng | null> {
    try {
        const encoded = encodeURIComponent(query);
        const r = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
            { headers: { "Accept-Language": "en", "User-Agent": "AxiomOS/1.0" } }
        );
        const data = await r.json();
        if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch { /* silent */ }
    return null;
}

export function SiteMap({ projectId }: Props) {
    const { project } = useProjectState(projectId);
    const site = project.site ?? DEFAULT_SITE;

    // Default center — LA fallback
    const [position, setPosition] = useState<LatLng>({ lat: 34.0522, lng: -118.2437 });
    const [geocoded, setGeocoded] = useState(false);
    const [geocoding, setGeocoding] = useState(false);

    // Comps from comps-fetch Edge Function (with real lat/lng for map pins)
    const [comps, setComps] = useState<Comp[]>([]);
    const [compsLoading, setCompsLoading] = useState(false);
    const [compsSource, setCompsSource] = useState<string>("");

    // Auto-geocode when site address changes
    const doGeocode = useCallback(async () => {
        const address = site?.address || project.municipality;
        if (!address) return;
        setGeocoding(true);
        const query = [site?.address, project.municipality, project.state].filter(Boolean).join(", ");
        const result = await geocode(query);
        if (result) { setPosition(result); setGeocoded(true); }
        setGeocoding(false);
    }, [site?.address, project.municipality, project.state]);

    useEffect(() => { doGeocode(); }, [doGeocode]);

    // Fetch comparables from comps-fetch Edge Function
    const fetchComps = useCallback(async () => {
        setCompsLoading(true);
        try {
            const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
            const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const r = await fetch(`${SUPA_URL}/functions/v1/comps-fetch`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SUPA_KEY}`,
                    "apikey": SUPA_KEY,
                },
                body: JSON.stringify({
                    address: site?.address ?? "",
                    city: project.municipality ?? "",
                    state: project.state ?? "",
                    lat: geocoded ? position.lat : undefined,
                    lng: geocoded ? position.lng : undefined,
                    radius_miles: 5,
                    asset_type: project.assetType ?? "Land",
                    limit: 8,
                }),
            });
            const d = await r.json();
            if (d.comps?.length) {
                setComps(d.comps);
                setCompsSource(d.provider);
            }
        } catch { /* silent */ }
        setCompsLoading(false);
    }, [position, geocoded, site, project]);

    // Assign map positions to comps without real lat/lng (radial scatter around site)
    const compsWithPos = comps.map((c, i) => {
        if (c.lat && c.lng) return { ...c, mapLat: c.lat, mapLng: c.lng };
        const angle = (i / comps.length) * 2 * Math.PI;
        const radius = 0.02 + (i % 3) * 0.008;
        return { ...c, mapLat: position.lat + Math.sin(angle) * radius, mapLng: position.lng + Math.cos(angle) * radius };
    });

    const fmt = (n?: number) => n ? "$" + n.toLocaleString() : "—";

    return (
        <Card
            title="Subject Property & Context Map"
            action={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {geocoding && <span style={{ fontSize: 10, color: "var(--c-dim)" }}>Locating...</span>}
                    {geocoded && <Badge label="GPS Located" color="var(--c-green)" />}
                    <button
                        className="axiom-btn"
                        onClick={fetchComps}
                        disabled={compsLoading}
                        style={{ padding: "4px 10px", fontSize: 11 }}
                    >
                        {compsLoading ? "..." : `⬇ Load Comps`}
                    </button>
                    {compsSource && <Badge label={compsSource} color={compsSource === "mock" ? "var(--c-dim)" : "var(--c-gold)"} />}
                </div>
            }
            className="axiom-animate-slide-up"
        >
            <div style={{ height: 420, width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid var(--c-border)" }}>
                <MapContainer
                    center={[position.lat, position.lng]}
                    key={`${position.lat},${position.lng}`}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                >
                    <TileLayer
                        attribution='© <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* 5-mile search radius ring */}
                    {geocoded && (
                        <Circle
                            center={[position.lat, position.lng]}
                            radius={8047}
                            pathOptions={{ color: "#D4A017", fillColor: "#D4A017", fillOpacity: 0.04, weight: 1, dashArray: "4 4" }}
                        />
                    )}

                    {/* Subject property */}
                    <Marker position={[position.lat, position.lng]}>
                        <Popup>
                            <strong>{project.name || "Subject Property"}</strong><br />
                            {site?.address || "Site address not set"}<br />
                            {geocoded
                                ? <span style={{ color: "#27ae60", fontSize: 11 }}>✓ GPS Located</span>
                                : <span style={{ color: "#e67e22", fontSize: 11 }}>Default location (set address in Project Setup)</span>
                            }
                        </Popup>
                    </Marker>

                    {/* Comparable sales */}
                    {compsWithPos.map((c) => (
                        <Marker key={c.id} position={[c.mapLat, c.mapLng]} icon={CompIcon}>
                            <Popup>
                                <strong>{c.name}</strong><br />
                                {c.address}<br />
                                {c.lots && <span>{c.lots} lots · </span>}
                                <span style={{ color: "#D4A017", fontWeight: 600 }}>{fmt(c.price_per_lot)}/lot</span><br />
                                {c.sale_date && <span style={{ fontSize: 10, color: "#666" }}>{c.sale_date} · {c.status}</span>}<br />
                                <span style={{ fontSize: 9, color: "#999" }}>Source: {c.source}</span>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Comps summary strip */}
            {comps.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {comps.slice(0, 4).map(c => (
                        <div key={c.id} style={{ flex: "1 1 200px", padding: "8px 10px", background: "var(--c-panel)", borderRadius: 6, border: "1px solid var(--c-border)" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--c-text)", marginBottom: 2 }}>{c.name}</div>
                            <div style={{ fontSize: 10, color: "var(--c-dim)" }}>{c.city}, {c.state}</div>
                            {c.lots && <div style={{ fontSize: 10, color: "var(--c-sub)" }}>{c.lots} lots</div>}
                            <div style={{ fontSize: 12, color: "var(--c-gold)", fontWeight: 700, marginTop: 2 }}>{fmt(c.price_per_lot)}/lot</div>
                            {c.sale_date && <div style={{ fontSize: 9, color: "var(--c-dim)" }}>{c.sale_date}</div>}
                        </div>
                    ))}
                </div>
            )}

            <div className="axiom-text-11-dim" style={{ marginTop: 8 }}>
                {geocoded
                    ? `📍 Located: ${site?.address ?? project.municipality}${comps.length ? " · " + comps.length + " comps from " + compsSource : " · Click Load Comps to fetch comparables"}`
                    : "Set a project address in Project Setup to pin the exact location."
                }
            </div>
        </Card>
    );
}
