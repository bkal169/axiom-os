/**
 * useAgentMemory — stub hook for agent memory context.
 * Provides loadMemory and saveMemory no-ops until semantic backend is wired.
 */
export function useAgentMemory({ tenantId, agentId, domain } = {}) {
  const loadMemory = async (query) => {
    return { contextString: '', memories: [] };
  };

  const saveMemory = async (content, metadata = {}) => {
    return null;
  };

  return { loadMemory, saveMemory };
}
