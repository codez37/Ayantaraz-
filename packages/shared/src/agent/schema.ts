import { z } from 'zod'

export const WebSearchOutput = z.object({
  results: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    snippet: z.string(),
  })),
  query: z.string(),
})

export const ExecuteOutput = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
})

export const AgentOutput = z.object({
  input: z.string(),
  step: z.number().min(0).max(10),
  memory: z.object({
    facts: z.array(z.string()),
    errors: z.array(z.string()),
    assumptions: z.array(z.string()),
  }),
  context: z.object({
    lastAction: z.string().optional(),
    lastResult: z.unknown().optional(),
  }),
  flags: z.object({
    needsWeb: z.boolean(),
    needsRetry: z.boolean(),
    done: z.boolean(),
  }),
  logs: z.array(z.string()),
})

export type WebSearchOutput = z.infer<typeof WebSearchOutput>
export type ExecuteOutput = z.infer<typeof ExecuteOutput>
export type AgentOutput = z.infer<typeof AgentOutput>
