import React, { useState, useCallback } from 'react';
import { S, C, MODELS } from '../../constants';
import { useLS, callLLM } from '../../utils';
import { Badge } from './Badge';
import { useAgentMemory } from '../../AI/memory/useAgentMemory';

export function Agent({ id, system, placeholder }) {
    // Per-agent conversation persistence (keyed by id) — BUG-H4 fix
    const [msgs, setMsgs] = useLS(`axiom_msgs_${id}`, []);
    const [inp, setInp] = useState("");
    const [busy, setBusy] = useState(false);
    // Per-agent model selection — BUG-H2 fix (was global "axiom_agent_model" key shared by all instances)
    const [model, setModel] = useLS(`axiom_agent_model_${id}`, "claude-sonnet-4-20250514");

    const [model, setModel] = useLS(`axiom_agent_model_${id}`, "claude-sonnet-4-20250514");

    const mem = useAgentMemory({ tenantId: '00000000-0000-0000-0000-000000000000', agentId: id, domain: 'general' });

    const send = useCallback(async () => {
        if (!inp.trim() || busy) return;
        const um = { role: "user", content: inp };
        const nm = [...msgs, um];
        setMsgs(nm);
        setInp("");
        setBusy(true);

        // Retrieve memory context
        const memData = await mem.loadMemory(um.content);
        let augmentedSystem = system;
        if (memData && memData.contextString) {
            augmentedSystem += `\n\n--- MEMORY CONTEXT ---\n${memData.contextString}`;
        }

        const reply = await callLLM(nm, augmentedSystem, model);
        setMsgs([...nm, { role: "assistant", content: reply }]);
        
        // Log episodic memory
        mem.logEvent('output', `Q: ${um.content}\nA: ${reply}`).catch(console.error);
        
        setBusy(false);
    }, [inp, msgs, system, busy, model, mem]);

    return (
        <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                <select
                    style={{ ...S.sel, flex: 1, fontSize: 10, padding: "3px 6px" }}
                    value={model}
                    onChange={e => setModel(e.target.value)}
                >
                    {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <span style={{ fontSize: 9, color: C.dim }}>{MODELS.find(x => x.id === model)?.provider || ""}</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 9 }}>
                {!msgs.length && <div style={{ fontSize: 12, color: C.dim, fontStyle: "italic", padding: "8px 0" }}>Agent ready — ask anything about this section.</div>}
                {msgs.map((m, i) => (
                    <div key={i} style={S.bub(m.role)}>
                        <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>
                            {m.role === "user" ? "You" : `· ${id}`}
                        </div>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 13, lineHeight: 1.5 }}>{m.content}</pre>
                    </div>
                ))}
                {busy && !mem.isLoading && <div style={{ ...S.bub("assistant"), color: C.gold, fontSize: 12 }}>· Processing...</div>}
                {mem.isLoading && <div style={{ ...S.bub("assistant"), color: C.blue, fontSize: 12 }}>· Searching neural memory...</div>}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
                <input
                    style={{ ...S.inp, flex: 1 }}
                    value={inp}
                    onChange={e => setInp(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    placeholder={placeholder || "Ask the agent..."}
                />
                <button style={S.btn("gold")} onClick={send} disabled={busy}>Send</button>
                <button style={S.btn()} onClick={() => setMsgs([])}>Clear</button>
            </div>
        </div>
    );
}
