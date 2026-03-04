import { useProject } from "../../context/ProjectContext";
import { Field, Button } from "../../components/ui/components";

export function ProjectMetaEditor({ onClose }: { onClose: () => void }) {
    const { project, setProject, activeProjectId, switchProject, allProjects, createProject } = useProject() as any;

    const handleChange = (key: string, value: any) => {
        setProject({ ...project, [key]: value });
    };

    const handleCreateNew = async () => {
        const name = prompt("Enter new project name:");
        if (name) {
            await createProject(name, "FL", "New Municipality");
            alert("New project initialized.");
        }
    };

    return (
        <div className="axiom-modal-overlay" onClick={onClose}>
            <div className="axiom-modal-content axiom-animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
                <div className="axiom-modal-header" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                        <div className="axiom-label">PROJECT INTELLIGENCE</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--c-gold)", marginTop: 4 }}>
                            Meta & Jurisdiction Data
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <select
                            className="axiom-select"
                            style={{ width: 180, fontSize: 11 }}
                            value={activeProjectId}
                            onChange={(e) => switchProject(e.target.value)}
                            title="Switch Active Project"
                        >
                            {allProjects.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name || p.id}</option>
                            ))}
                        </select>
                        <Button variant="gold" style={{ padding: "4px 8px" }} onClick={handleCreateNew}>+ NEW</Button>
                    </div>
                </div>

                <div className="axiom-grid-2">
                    <Field label="Project Name">
                        <input
                            className="axiom-input"
                            value={project.name || ""}
                            onChange={e => handleChange("name", e.target.value)}
                            placeholder="e.g. Sunset Ridge Estates"
                        />
                    </Field>
                    <Field label="Jurisdiction">
                        <input
                            className="axiom-input"
                            value={project.jurisdiction || ""}
                            onChange={e => handleChange("jurisdiction", e.target.value)}
                            placeholder="e.g. City of San Diego"
                        />
                    </Field>
                </div>

                <Field label="Property Address / APN">
                    <input
                        className="axiom-input"
                        value={project.address || ""}
                        onChange={e => handleChange("address", e.target.value)}
                        placeholder="123 Developer Way or 123-456-78"
                    />
                </Field>

                <div className="axiom-grid-3">
                    <Field label="Municipality">
                        <input
                            className="axiom-input"
                            value={project.municipality || ""}
                            onChange={e => handleChange("municipality", e.target.value)}
                            placeholder="City / County"
                        />
                    </Field>
                    <Field label="State">
                        <select
                            className="axiom-select"
                            value={project.state || ""}
                            onChange={e => handleChange("state", e.target.value)}
                        >
                            <option value="">Select State</option>
                            {"AL,AK,AZ,AR,CA,CO,CT,DE,FL,GA,HI,ID,IL,IN,IA,KS,KY,LA,ME,MD,MA,MI,MN,MS,MO,MT,NE,NV,NH,NJ,NM,NY,NC,ND,OH,OK,OR,PA,RI,SC,SD,TN,TX,UT,VT,VA,WA,WV,WI,WY".split(",").map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                    <Field label="Zip Code">
                        <input
                            className="axiom-input"
                            value={project.zip || ""}
                            onChange={e => handleChange("zip", e.target.value)}
                            placeholder="90210"
                        />
                    </Field>
                </div>

                <div className="axiom-stack-16" style={{ marginTop: 16 }}>
                    <Field label="Executive Summary / Notes">
                        <textarea
                            className="axiom-input"
                            style={{ minHeight: 100, resize: "vertical" }}
                            value={project.notes || ""}
                            onChange={e => handleChange("notes", e.target.value)}
                            placeholder="Enter project summary or internal notes..."
                        />
                    </Field>
                </div>

                <div className="axiom-grid-2" style={{ marginTop: 32 }}>
                    <Button variant="ghost" onClick={onClose}>Discard Changes</Button>
                    <Button variant="gold" onClick={onClose}>Save Project Intelligence</Button>
                </div>
            </div>
        </div>
    );
}
