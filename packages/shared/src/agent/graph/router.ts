import type { AgentState } from '../state'

export type Route = 'WEB_SEARCH' | 'RETRY' | 'EXECUTE'

export function route(state: AgentState): Route {
  if (state.flags.needsWeb) return 'WEB_SEARCH'
  if (state.flags.needsRetry) return 'RETRY'
  return 'EXECUTE'
}
