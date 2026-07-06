import { z } from 'zod'
import type { AgentState } from './state'

export type VerifyResult = {
  valid: boolean
  errors: string[]
}

export function verifyState(state: AgentState): VerifyResult {
  const errors: string[] = []

  if (typeof state.input !== 'string' || state.input.length === 0) {
    errors.push('input must be non-empty string')
  }

  if (typeof state.step !== 'number' || state.step < 0 || state.step > 10) {
    errors.push('step must be 0-10')
  }

  if (!Array.isArray(state.memory.facts)) {
    errors.push('memory.facts must be array')
  }

  if (!Array.isArray(state.memory.errors)) {
    errors.push('memory.errors must be array')
  }

  if (!Array.isArray(state.memory.assumptions)) {
    errors.push('memory.assumptions must be array')
  }

  if (typeof state.flags.needsWeb !== 'boolean') {
    errors.push('flags.needsWeb must be boolean')
  }

  if (typeof state.flags.needsRetry !== 'boolean') {
    errors.push('flags.needsRetry must be boolean')
  }

  if (typeof state.flags.done !== 'boolean') {
    errors.push('flags.done must be boolean')
  }

  if (!Array.isArray(state.logs)) {
    errors.push('logs must be array')
  }

  return { valid: errors.length === 0, errors }
}

export function verifyOutput<T>(schema: z.ZodSchema<T>, data: unknown): VerifyResult {
  const result = schema.safeParse(data)

  if (result.success) {
    return { valid: true, errors: [] }
  }

  const errors = result.error.issues.map(
    (i) => `${i.path.join('.')}: ${i.message}`
  )

  return { valid: false, errors }
}

export function verifyConsistency(state: AgentState): VerifyResult {
  const errors: string[] = []

  if (state.flags.done && state.memory.errors.length > 0) {
    errors.push('done=true but errors exist')
  }

  if (state.flags.done && !state.context.lastResult) {
    errors.push('done=true but no lastResult')
  }

  if (state.flags.needsRetry && state.memory.errors.length === 0) {
    errors.push('needsRetry=true but no errors')
  }

  if (state.flags.needsWeb && state.flags.done) {
    errors.push('needsWeb=true and done=true (contradiction)')
  }

  if (state.step > 1 && !state.context.lastAction && !state.context.lastResult) {
    errors.push('step > 1 but no lastAction and no lastResult')
  }

  return { valid: errors.length === 0, errors }
}
