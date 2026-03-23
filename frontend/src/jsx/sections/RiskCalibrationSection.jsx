import { RiskCalibrationDashboard } from '../../v5/features/neural/RiskCalibrationDashboard';
import { useSupabase } from '../hooks/useSupabase';

export default function RiskCalibrationSection() {
  const { supabase } = useSupabase();
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <RiskCalibrationDashboard supabase={supabase} />
    </div>
  );
}
