import { AgentHub } from "./AgentHub";
import { NeuralNet } from "./NeuralNet";
import { Copilot } from "./Copilot";
import { Tabs } from "../../components/ui/layout";

export function NeuralAgents() {

    return (
        <Tabs tabs={["💬 Command Copilot", "🤖 Agent Hub", "🧠 Neural Intelligence"]}>
            <Copilot />
            <AgentHub />
            <NeuralNet />
        </Tabs>
    );
}
