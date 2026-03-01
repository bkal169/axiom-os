import { Tabs } from "../../components/ui/layout";
import { ProForma } from "./ProForma";
import { DealAnalyzer } from "./DealAnalyzer";
import { CalcHub } from "./CalcHub";

export function Financials() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Tabs tabs={[
                "Pro Forma",
                "Deal Analyzer",
                "Calculator Hub",
            ]}>
                <div key="proforma">
                    <ProForma />
                </div>
                <div key="analyzer">
                    <DealAnalyzer />
                </div>
                <div key="calcs">
                    <CalcHub />
                </div>
            </Tabs>
        </div>
    );
}
