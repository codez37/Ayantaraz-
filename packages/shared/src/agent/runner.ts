import { createInitialState, type AgentState } from './state'
import { step } from './loop'
import { verifyState, verifyConsistency, verifyOutput } from './verifier'
import { AgentOutput } from './schema'
import { semanticVerify, aggregateSemantic, type SemanticCheck, type SemanticVerdict } from './semantic'

const MAX_STEPS = 10

export type AgentResult = {
  state: AgentState
  valid: boolean
  errors: string[]
  semantic: {
    checks: SemanticCheck[]
    overallConfidence: number
    verdict: SemanticVerdict
    verifiedCount: number
    contradictedCount: number
    unverifiableCount: number
  }
}

export async function runAgent(input: string): Promise<AgentResult> {
  const state = createInitialState(input)
  const errors: string[] = []

  // ── Input verification ──
  if (typeof input !== 'string' || input.trim().length === 0) {
    return {
      state,
      valid: false,
      errors: ['input must be non-empty string'],
      semantic: {
        checks: [],
        overallConfidence: 0,
        verdict: 'UNVERIFIABLE',
        verifiedCount: 0,
        contradictedCount: 0,
        unverifiableCount: 0,
      },
    }
  }

  for (let i = 0; i < MAX_STEPS; i++) {
    await step(state)

    // ── State verification after each step ──
    const stateCheck = verifyState(state)
    if (!stateCheck.valid) {
      errors.push(`step ${state.step}: state corruption: ${stateCheck.errors.join(', ')}`)
    }

    // ── Consistency verification ──
    const consistencyCheck = verifyConsistency(state)
    if (!consistencyCheck.valid) {
      errors.push(`step ${state.step}: consistency: ${consistencyCheck.errors.join(', ')}`)
    }

    // ── Stop condition ──
    if (state.flags.done) {
      state.logs.push(`Done at step ${state.step}`)
      break
    }

    if (state.step >= MAX_STEPS) {
      state.logs.push(`Max steps (${MAX_STEPS}) reached`)
      break
    }
  }

  // ── Final output verification ──
  const outputCheck = verifyOutput(AgentOutput, state)
  if (!outputCheck.valid) {
    errors.push(`output schema: ${outputCheck.errors.join(', ')}`)
  }

  // ── Semantic verification ──
  const semanticChecks = await semanticVerify(state)
  const semanticResult = aggregateSemantic(semanticChecks)

  if (semanticResult.contradictedCount > 0) {
    errors.push(`semantic: ${semanticResult.contradictedCount} contradictions detected`)
  }

  return {
    state,
    valid: errors.length === 0,
    errors,
    semantic: {
      checks: semanticChecks,
      ...semanticResult,
    },
  }
}
