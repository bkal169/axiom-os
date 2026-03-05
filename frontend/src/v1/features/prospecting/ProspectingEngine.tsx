import { useState } from "react";
import { Card, Button, Badge, AxiomTable } from "../../components/ui/components";

export function ProspectingEngine() {
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const runSearch = () => {
        setSearching(true);
        setTimeout(() => {
            setResults([
                { id: 1, owner: "James Wilson", address: "123 Pine St, Orlando FL", size: "2.4 AC", zoning: "R-3", value: "$450,000" },
                { id: 2, owner: "Sarah Miller", address: "455 Oak Ave, Orlando FL", size: "0.8 AC", zoning: "C-1", value: "$1.2M" },
                { id: 3, owner: "Linden Group LLC", address: "900 Industrial Way, Orlando FL", size: "12.5 AC", zoning: "I-2", value: "$3.8M" },
                { id: 4, owner: "Robert Chen", address: "12 Maple Rd, Orlando FL", size: "1.1 AC", zoning: "R-3", value: "$290,000" },
            ]);
            setSearching(false);
        }, 1500);
    };

    return (
        <div className="axiom-stack-24">
            <div className="axiom-top-bar">
                <div className="axiom-flex-col">
                    <div className="axiom-breadcrumb">Intelligence / Acquisition</div>
                    <div className="axiom-page-title">Prospecting Engine</div>
                </div>
                <div className="axiom-flex-row-gap-8">
                    <Button label="New Search" onClick={() => { setResults([]); setSearching(false); }} />
                    <Button variant="gold" label={searching ? "Searching..." : "Run Engine"} onClick={runSearch} disabled={searching} />
                </div>
            </div>

            <Card title="Search Parameters">
                <div className="axiom-grid-4">
                    <div>
                        <div className="axiom-label axiom-mb-8">LOCATION RADIUS</div>
                        <input className="axiom-input-field axiom-w-full" defaultValue="Orlando, FL (10mi)" title="Location Radius" />
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">MIN ACREAGE</div>
                        <input className="axiom-input-field axiom-w-full" type="number" defaultValue="0.5" title="Min Acreage" />
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">ZONING FILTER</div>
                        <select className="axiom-select-field axiom-w-full" title="Zoning Filter">
                            <option>Multi-Family (R-3)</option>
                            <option>Commercial (C-1/C-2)</option>
                            <option>Industrial (I-1)</option>
                        </select>
                    </div>
                    <div>
                        <div className="axiom-label axiom-mb-8">OWNERSHIP TYPE</div>
                        <select className="axiom-select-field axiom-w-full" title="Ownership Type">
                            <option>Individual</option>
                            <option>Corporate / LLC</option>
                            <option>Trust</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card title="Discovery Results" action={<Badge label={`${results.length} Found`} color="var(--c-gold)" />}>
                {searching ? (
                    <div className="axiom-flex-center-col axiom-py-60 axiom-gap-16">
                        <div className="axiom-loading-spinner" />
                        <div className="axiom-text-12-gold-ls2-caps">Processing Satellite & Tax Records...</div>
                    </div>
                ) : (
                    <AxiomTable headers={["OWNER", "ADDRESS", "SIZE", "ZONING", "EST. VALUE", ""]}>
                        {results.map(r => (
                            <tr key={r.id}>
                                <td className="axiom-td axiom-text-gold">{r.owner}</td>
                                <td className="axiom-td">{r.address}</td>
                                <td className="axiom-td">{r.size}</td>
                                <td className="axiom-td"><Badge label={r.zoning} color="var(--c-blue)" /></td>
                                <td className="axiom-td">{r.value}</td>
                                <td className="axiom-td axiom-text-right">
                                    <Button label="Model Deal" variant="ghost" className="axiom-py-4" />
                                </td>
                            </tr>
                        ))}
                    </AxiomTable>
                )}
            </Card>
        </div>
    );
}
