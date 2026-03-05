import { useState, useEffect } from "react";
import { swarmEngine, type SwarmState, type SwarmTask } from "../../services/SwarmEngine";
import { Badge, Button } from "../../components/ui/components";

export function AgentHandoff() {
    const [state, setState] = useState<SwarmState | null>(null);

    useEffect(() => {
        return swarmEngine.subscribe(s => setState({ ...s }));
    }, []);

    if (!state) return (
        <div className="axiom-p-20 axiom-text-dim">
            No active swarm. Use Workflow Hub to trigger coordination.
        </div>
    );

    const getAgentColor = (agent: string) => {
        switch (agent) {
            case "FINANCIAL": return "var(--c-gold)";
            case "LEGAL": return "var(--c-purple)";
            case "MARKET": return "var(--c-teal)";
            case "ADMIN": return "var(--c-blue)";
            default: return "var(--c-dim)";
        }
    };

    return (
        <div className="axiom-stack-20">
            <div className="axiom-flex-sb-center">
                <div>
                    <div className="axiom-text-9-dim-up-ls2">Active Objective</div>
                    <div className="axiom-text-18-bold">{state.objective}</div>
                </div>
                <Badge label={state.status} color={state.status === "ACTIVE" ? "var(--c-green)" : "var(--c-dim)"} />
            </div>

            <div className="axiom-swarm-timeline">
                {state.tasks.map((task: SwarmTask, i: number) => (
                    <div key={task.id} className="axiom-swarm-card">
                        <div className="axiom-flex-gap-12">
                            <div className="axiom-swarm-node" style={{ borderColor: getAgentColor(task.assignedTo) } as any}>
                                {i + 1}
                            </div>
                            <div className="axiom-full-width">
                                <div className="axiom-flex-sb">
                                    <span className="axiom-text-11-bold" style={{ color: getAgentColor(task.assignedTo) } as any}>{task.assignedTo}</span>
                                    <span className="axiom-text-9-dim">{task.status}</span>
                                </div>
                                <div className="axiom-text-12 axiom-mt-4">{task.description}</div>
                                {task.output && (
                                    <div className="axiom-swarm-output axiom-mt-8">
                                        {task.output}
                                    </div>
                                )}
                            </div>
                        </div>
                        {i < state.tasks.length - 1 && <div className="axiom-swarm-connector" />}
                    </div>
                ))}
            </div>

            {state.status === "ACTIVE" && (
                <Button
                    label="Execute Next Step"
                    onClick={() => swarmEngine.executeNext()}
                    variant="gold"
                    className="axiom-full-width"
                />
            )}
        </div>
    );
}
