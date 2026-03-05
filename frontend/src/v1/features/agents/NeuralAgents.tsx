import { AgentHub } from "../output/AgentHub";
import { NeuralNet } from "./NeuralNet";
import { Copilot } from "./Copilot";
import { WorkflowHub } from "./WorkflowHub";
import { Tabs } from "../../components/ui/layout";

export function NeuralAgents() {

    return (
        <Tabs tabs={["💬 Command Copilot", "🤖 Agent Hub", "🧠 Neural Intelligence", "⚡ Automation Hub"]}>
            <Copilot />
            <AgentHub />
            <NeuralNet />
            <WorkflowHub />
        </Tabs>
    );
}
