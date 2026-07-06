import type { AgentState } from './state'
import { webSearch } from './tools/webSearch'
import { execute } from './tools/executor'
import { verifyState, verifyConsistency } from './verifier'

function isUnknown(state: AgentState): boolean {
  return (
    state.step === 0 && !state.context.lastResult ||
    state.memory.errors.length > 0 ||
    state.flags.needsRetry
  )
}

export async function step(state: AgentState): Promise<AgentState> {
  state.step++
  state.logs.push(`Step ${state.step}: input="${state.input}"`)

  // ── Pre-step verification ──
  const preCheck = verifyState(state)
  if (!preCheck.valid) {
    state.logs.push(`Step ${state.step}: pre-step verification failed: ${preCheck.errors.join(', ')}`)
    state.memory.errors.push(`state corruption: ${preCheck.errors.join(', ')}`)
    return state
  }

  if (isUnknown(state)) {
    state.flags.needsWeb = true
    state.logs.push(`Step ${state.step}: unknown state → web search`)
  }

  if (state.flags.needsWeb) {
    state.logs.push(`Step ${state.step}: web search`)
    const result = await webSearch(state.input)

    if (result.success) {
      state.context.lastResult = result.data
      state.memory.facts.push(JSON.stringify(result.data))
      state.logs.push(`Step ${state.step}: web search success`)
    } else {
      state.memory.errors.push(result.error ?? 'web search failed')
      state.logs.push(`Step ${state.step}: web search failed: ${result.error}`)
    }

    state.flags.needsWeb = false
    state.flags.needsRetry = false
    return state
  }

  state.logs.push(`Step ${state.step}: execute`)
  const execResult = await execute(state.input)

  if (!execResult.success) {
    state.memory.errors.push(execResult.error ?? 'execution failed')
    state.flags.needsRetry = true
    state.logs.push(`Step ${state.step}: execute failed: ${execResult.error}`)
  } else {
    state.context.lastResult = execResult.data
    state.context.lastAction = state.input
    state.logs.push(`Step ${state.step}: execute success`)
  }

  // ── Post-step consistency check ──
  const consistency = verifyConsistency(state)
  if (!consistency.valid) {
    state.logs.push(`Step ${state.step}: consistency warning: ${consistency.errors.join(', ')}`)
  }

  return state
}
