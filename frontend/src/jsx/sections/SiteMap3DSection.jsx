import { SiteMap3D } from '../../v5/features/gis/SiteMap3D';

export default function SiteMap3DSection({ lat, lng, projectId }) {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#eceaf5', marginBottom: 24 }}>3D Site Map</h2>
      <SiteMap3D lat={lat} lng={lng} projectId={projectId} />
    </div>
  );
}
