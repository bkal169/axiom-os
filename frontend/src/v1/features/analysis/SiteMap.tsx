import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, Badge } from "../../components/ui/components";
import { useProjectState } from "../../hooks/useProjectState";

// Public token for demonstration - ideally should be in env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface Props { projectId: string; }

export function SiteMap({ projectId }: Props) {
    const { project } = useProjectState(projectId);

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [lng, _setLng] = useState(-118.2437);
    const [lat, _setLat] = useState(34.0522);
    const [zoom, _setZoom] = useState(13);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        if (!mapboxgl.accessToken) {
            setError("Mapbox Access Token Required");
            return;
        }

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                center: [lng, lat],
                zoom: zoom,
                pitch: 45,
                bearing: -17.6,
                antialias: true
            });

            map.current.on('style.load', () => {
                if (!map.current) return;

                // Add 3D terrain
                map.current.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

                // Add 3D buildings
                map.current.addLayer({
                    'id': 'add-3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#aaa',
                        'fill-extrusion-height': ['get', 'height'],
                        'fill-extrusion-base': ['get', 'min_height'],
                        'fill-extrusion-opacity': 0.6
                    }
                });
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        } catch (e) {
            console.error("Mapbox init error:", e);
            setError("Failed to initialize Mapbox Engine");
        }

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    return (
        <Card
            title="Spatial Intelligence & GIS Context"
            action={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge label="3D Terrain Active" color="var(--c-teal)" />
                    <Badge label="Satellite HD" color="var(--c-gold)" />
                </div>
            }
            className="axiom-animate-slide-up"
        >
            <div ref={mapContainer} style={{ height: 420, width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid var(--c-border)", background: "#0A0A0E", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                {error ? (
                    <div className="axiom-flex-col axiom-items-center axiom-gap-12">
                        <div className="axiom-text-gold" style={{ fontSize: 24 }}>🗺️</div>
                        <div className="axiom-text-13-text-b600">{error}</div>
                        <div className="axiom-text-10-dim" style={{ textAlign: "center", maxWidth: 280 }}>
                            Please add <code>VITE_MAPBOX_TOKEN</code> to your platform environment to enable 3D GIS rendering.
                        </div>
                    </div>
                ) : (
                    <div className="axiom-loading-spinner" />
                )}
            </div>

            <div className="axiom-text-11-dim" style={{ marginTop: 8 }}>
                📍 {error ? "Engine Standby" : "Mapbox Engine"}: Rendering 3D elevation and building extrusions for {project.municipality || "Site Context"}.
            </div>
        </Card>
    );
}
