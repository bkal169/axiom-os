import { Card, KPI, Badge, AxiomTable } from "../../components/ui/components";
import { useProject } from "../../context/ProjectContext";

export function PortfolioDashboard() {
    const ctx = useProject();
    const allProjects = ctx?.allProjects ?? [];

    const totalProjects = allProjects.length;
    const activeCount = allProjects.filter((p: any) => p.stage !== "completed" && p.stage !== "disposed").length;

    return (
        <Card title="Portfolio Overview">
            <div className="axiom-grid-4 axiom-mb-24">
                <KPI label="Total Projects" value={totalProjects} />
                <KPI label="Active" value={activeCount} color="var(--c-green)" />
                <KPI label="Pipeline Value" value="--" color="var(--c-blue)" sub="Aggregated" />
                <KPI label="Avg. Risk Score" value="--" color="var(--c-amber)" sub="Weighted" />
            </div>
            <AxiomTable headers={["Project", "Stage", "Revenue", "Profit", "Risk Count", "Status"]} emptyMessage="No projects in portfolio. Create a project to get started.">
                {allProjects.map((proj: any, i: number) => (
                    <tr key={proj.id ?? i} className="premium-hover">
                        <td className="axiom-td axiom-text-sub axiom-text-bold">{proj.name ?? proj.project_name ?? `Project ${i + 1}`}</td>
                        <td className="axiom-td">
                            <Badge label={proj.stage ?? "N/A"} color={proj.stage === "active" ? "var(--c-green)" : proj.stage === "closing" ? "var(--c-gold)" : "var(--c-blue)"} />
                        </td>
                        <td className="axiom-td axiom-text-gold">{proj.financials?.revenue ? `$${Number(proj.financials.revenue).toLocaleString()}` : "--"}</td>
                        <td className="axiom-td axiom-text-green">{proj.financials?.profit ? `$${Number(proj.financials.profit).toLocaleString()}` : "--"}</td>
                        <td className="axiom-td">{proj.risks?.length ?? 0}</td>
                        <td className="axiom-td">
                            <Badge label={proj.status ?? "Active"} color="var(--c-green)" />
                        </td>
                    </tr>
                ))}
            </AxiomTable>
        </Card>
    );
}
