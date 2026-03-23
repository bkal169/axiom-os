import { TaxIntelPanel } from '../../v5/features/tax/TaxIntelPanel';

export default function TaxIntelSection({ dealId }) {
  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <TaxIntelPanel dealId={dealId} />
    </div>
  );
}
