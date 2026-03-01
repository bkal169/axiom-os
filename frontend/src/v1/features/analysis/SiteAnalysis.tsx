import { Tabs } from "../../components/ui/layout";
import { SiteMap } from "./SiteMap";
import { Entitlements } from "./Entitlements";
import { Infrastructure } from "./Infrastructure";
import { ConceptDesign } from "./ConceptDesign";
import { MarketIntel } from "./MarketIntel";

interface Props { projectId: string; }

export function SiteAnalysis({ projectId }: Props) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SiteMap projectId={projectId} />
            <Tabs tabs={["Entitlements", "Infrastructure", "Concept Design", "Market Intelligence"]}>
                <div key="entitlements">
                    <Entitlements projectId={projectId} />
                </div>
                <div key="infrastructure">
                    <Infrastructure projectId={projectId} />
                </div>
                <div key="concept">
                    <ConceptDesign projectId={projectId} />
                </div>
                <div key="market">
                    <MarketIntel projectId={projectId} />
                </div>
            </Tabs>
        </div>
    );
}
