import { useState } from "react";
import { useProjectState } from "../../hooks/useProjectState";
import { Field, Button } from "../../components/ui/components";

interface Props {
    projectId: string;
    onClose: () => void;
}

export function ProjectMetaEditor({ projectId, onClose }: Props) {
    const { project, updateProject } = useProjectState(projectId);
    const [meta, setMeta] = useState({
        name: project.name || "",
        location: project.location || "",
        status: project.status || "In Review",
        type: project.type || "Multifamily",
        units: project.units || 0,
        sf: project.sf || 0,
        jurisdiction: project.jurisdiction || "",
        apn: project.apn || "",
    });

    const save = () => {
        updateProject(meta);
        onClose();
    };

    return (
        <div className="axiom-modal-overlay" onClick={onClose}>
            <div className="axiom-modal-content axiom-w-600 axiom-animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="axiom-modal-header">
                    <div>
                        <div className="axiom-text-11-gold-ls2-caps">EDIT PROJECT METADATA</div>
                        <div className="axiom-text-18-gold-bold axiom-mt-4">{meta.name || "Untitled Project"}</div>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="axiom-p4-8">×</Button>
                </div>

                <div className="axiom-py-20">
                    <div className="axiom-grid-2 axiom-gap-20 axiom-mb-20">
                        <Field label="Project Name">
                            <input
                                className="axiom-input-field"
                                value={meta.name}
                                onChange={e => setMeta({ ...meta, name: e.target.value })}
                                title="Project Name"
                            />
                        </Field>
                        <Field label="Jurisdiction">
                            <input
                                className="axiom-input-field"
                                value={meta.jurisdiction}
                                onChange={e => setMeta({ ...meta, jurisdiction: e.target.value })}
                                title="Jurisdiction"
                            />
                        </Field>
                    </div>

                    <div className="axiom-grid-2 axiom-gap-20 axiom-mb-20">
                        <Field label="Location / Address">
                            <input
                                className="axiom-input-field"
                                value={meta.location}
                                onChange={e => setMeta({ ...meta, location: e.target.value })}
                                title="Project Location"
                            />
                        </Field>
                        <Field label="APN / Parcel ID">
                            <input
                                className="axiom-input-field"
                                value={meta.apn}
                                onChange={e => setMeta({ ...meta, apn: e.target.value })}
                                title="Parcel ID"
                            />
                        </Field>
                    </div>

                    <div className="axiom-grid-4 axiom-gap-15 axiom-mb-20">
                        <Field label="Type">
                            <select
                                className="axiom-select-field"
                                value={meta.type}
                                onChange={e => setMeta({ ...meta, type: e.target.value })}
                                title="Project Type"
                            >
                                <option>Multifamily</option>
                                <option>Mixed-Use</option>
                                <option>Commercial</option>
                                <option>Industrial</option>
                                <option>Subdivision</option>
                            </select>
                        </Field>
                        <Field label="Status">
                            <select
                                className="axiom-select-field"
                                value={meta.status}
                                onChange={e => setMeta({ ...meta, status: e.target.value })}
                                title="Current Status"
                            >
                                <option>Due Diligence</option>
                                <option>In Review</option>
                                <option>Pre-Construction</option>
                                <option>Construction</option>
                                <option>Stabilization</option>
                            </select>
                        </Field>
                        <Field label="Units">
                            <input
                                className="axiom-input-field"
                                type="number"
                                value={meta.units}
                                onChange={e => setMeta({ ...meta, units: +e.target.value })}
                                title="Number of Units"
                            />
                        </Field>
                        <Field label="SF">
                            <input
                                className="axiom-input-field"
                                type="number"
                                value={meta.sf}
                                onChange={e => setMeta({ ...meta, sf: +e.target.value })}
                                title="Square Footage"
                            />
                        </Field>
                    </div>
                </div>

                <div className="axiom-flex-end axiom-gap-10">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="gold" onClick={save}>Update Project Intelligence</Button>
                </div>
            </div>
        </div>
    );
}
