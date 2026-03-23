import { retrieveMemory, formatMemoryForContext, type MemoryResult, type AgentDomain } from './MEMORY_RETRIEVER.ts'

export async function buildAgentContext({
  tenantId,
  agentId,
  query,
  domain,
  projectId,
  topK = 12,
  tokenBudget = 3000,
}: {
  tenantId: string
  agentId: string
  query: string
  domain?: AgentDomain
  projectId?: string
  topK?: number
  tokenBudget?: number
}): Promise<{ contextString: string; results: MemoryResult[] }> {
  const results = await retrieveMemory({
    tenantId,
    query,
    domain,
    projectId,
    topK,
    tokenBudget,
  })

  const contextString = formatMemoryForContext(results)
  return { contextString, results }
}

export function buildSystemPromptWithMemory(
  baseSystemPrompt: string,
  contextString: string
): string {
  if (!contextString) return baseSystemPrompt

  return `${baseSystemPrompt}

---

## Agent Memory Context

The following is relevant knowledge, history, and procedures retrieved for this task:

${contextString}

---

Use the above context to inform your response. Prioritize rules and procedures over general knowledge.`
}
