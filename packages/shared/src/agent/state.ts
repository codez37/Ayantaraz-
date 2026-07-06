export type AgentState = {
  input: string
  step: number
  memory: {
    facts: string[]
    errors: string[]
    assumptions: string[]
  }
  context: {
    lastAction?: string
    lastResult?: unknown
  }
  flags: {
    needsWeb: boolean
    needsRetry: boolean
    done: boolean
  }
  logs: string[]
}

export function createInitialState(input: string): AgentState {
  return {
    input,
    step: 0,
    memory: {
      facts: [],
      errors: [],
      assumptions: [],
    },
    context: {},
    flags: {
      needsWeb: false,
      needsRetry: false,
      done: false,
    },
    logs: [],
  }
}
