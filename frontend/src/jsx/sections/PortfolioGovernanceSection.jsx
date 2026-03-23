import { PortfolioGovernance } from '../../v5/features/governance/PortfolioGovernance';
import { useSupabase } from '../hooks/useSupabase';

export default function PortfolioGovernanceSection() {
  const { supabase } = useSupabase();
  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <PortfolioGovernance supabase={supabase} orgId={null} />
    </div>
  );
}
