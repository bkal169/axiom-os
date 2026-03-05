export type AgentType = "FINANCIAL" | "LEGAL" | "ADMIN" | "MARKET" | "SYSTEM";

export interface SwarmTask {
    id: string;
    description: string;
    assignedTo: AgentType;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
    output?: string;
    parentTaskId?: string;
}

export interface SwarmState {
    id: string;
    objective: string;
    tasks: SwarmTask[];
    sharedMemory: Record<string, any>;
    status: "IDLE" | "ACTIVE" | "DONE";
}

class SwarmEngine {
    private state: SwarmState | null = null;
    private listeners: ((state: SwarmState) => void)[] = [];

    init(objective: string) {
        this.state = {
            id: crypto.randomUUID(),
            objective,
            tasks: [],
            sharedMemory: {},
            status: "ACTIVE"
        };
        this.notify();
    }

    addTask(description: string, assignedTo: AgentType, parentId?: string) {
        if (!this.state) return;
        const task: SwarmTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            description,
            assignedTo,
            status: "PENDING",
            parentTaskId: parentId
        };
        this.state.tasks.push(task);
        this.notify();
        return task.id;
    }

    updateTask(taskId: string, updates: Partial<SwarmTask>) {
        if (!this.state) return;
        const idx = this.state.tasks.findIndex(t => t.id === taskId);
        if (idx !== -1) {
            this.state.tasks[idx] = { ...this.state.tasks[idx], ...updates };
            this.notify();
        }
    }

    setMemory(key: string, value: any) {
        if (!this.state) return;
        this.state.sharedMemory[key] = value;
        localStorage.setItem(`axiom_swarm_mem_${this.state.id}`, JSON.stringify(this.state.sharedMemory));
        this.notify();
    }

    subscribe(fn: (state: SwarmState) => void) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    private notify() {
        if (this.state) {
            this.listeners.forEach(l => l(this.state!));
        }
    }

    async executeNext() {
        if (!this.state || this.state.status !== "ACTIVE") return;

        const nextTask = this.state.tasks.find(t => t.status === "PENDING");
        if (!nextTask) {
            this.state.status = "DONE";
            this.notify();
            return;
        }

        this.updateTask(nextTask.id, { status: "RUNNING" });

        // Simulated AI logic for now — in production this hits the /analyze endpoint
        await new Promise(r => setTimeout(r, 1500));

        const mockOutput = `Analysis complete for ${nextTask.description}. Result stored in shared memory.`;
        this.setMemory(nextTask.id, mockOutput);
        this.updateTask(nextTask.id, { status: "COMPLETED", output: mockOutput });

        this.executeNext();
    }
}

export const swarmEngine = new SwarmEngine();
