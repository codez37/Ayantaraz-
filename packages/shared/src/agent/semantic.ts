import { z } from 'zod'
import type { AgentState } from './state'
import { webSearch } from './tools/webSearch'

export const SemanticVerdict = z.enum([
  'VERIFIED',
  'CONTRADICTED',
  'UNVERIFIABLE',
  'LOW_CONFIDENCE',
])

export type SemanticVerdict = z.infer<typeof SemanticVerdict>

export type SemanticResult = {
  verdict: SemanticVerdict
  confidence: number
  evidence: string[]
  contradictions: string[]
  sources: string[]
}

export type SemanticCheck = {
  claim: string
  result: SemanticResult
}

function extractClaims(state: AgentState): string[] {
  const claims: string[] = []

  for (const fact of state.memory.facts) {
    try {
      const parsed = JSON.parse(fact)
      if (typeof parsed === 'string') {
        claims.push(parsed)
      } else if (parsed && typeof parsed === 'object') {
        if (parsed.query) claims.push(parsed.query)
        if (parsed.snippet) claims.push(parsed.snippet)
        if (Array.isArray(parsed.results)) {
          for (const r of parsed.results.slice(0, 3)) {
            if (r.snippet) claims.push(r.snippet)
          }
        }
      }
    } catch {
      claims.push(fact)
    }
  }

  if (state.context.lastResult) {
    const result = state.context.lastResult
    if (typeof result === 'string') {
      claims.push(result)
    } else if (result && typeof result === 'object') {
      const obj = result as Record<string, unknown>
      if (typeof obj.result === 'string') claims.push(obj.result)
      if (typeof obj.data === 'string') claims.push(obj.data)
      if (Array.isArray(obj.results)) {
        for (const r of (obj.results as Array<Record<string, unknown>>).slice(0, 3)) {
          if (typeof r.snippet === 'string') claims.push(r.snippet)
        }
      }
    }
  }

  return [...new Set(claims)].slice(0, 5)
}

function calculateConfidence(
  evidenceCount: number,
  contradictionCount: number,
  sourceCount: number
): number {
  const BASELINE = 0.5

  let confidence = BASELINE

  if (evidenceCount > 0) confidence += 0.2
  if (evidenceCount > 2) confidence += 0.1
  if (sourceCount > 0) confidence += 0.1

  // Soft contradiction penalty: max -0.15 total, not per contradiction
  if (contradictionCount > 0) {
    confidence -= 0.15
  }

  return Math.min(1.0, Math.max(0.0, confidence))
}

async function verifyClaim(claim: string): Promise<SemanticResult> {
  const evidence: string[] = []
  const contradictions: string[] = []
  const sources: string[] = []

  let webSearchFailed = false

  try {
    const searchResult = await webSearch(claim)

    if (searchResult.success && searchResult.data) {
      const data = searchResult.data as { results?: Array<{ title: string; url: string; snippet: string }> }

      if (data.results && Array.isArray(data.results)) {
        for (const r of data.results.slice(0, 3)) {
          sources.push(r.url)
          if (r.snippet) {
            evidence.push(r.snippet)
          }
        }
      }
    } else {
      webSearchFailed = true
    }
  } catch {
    webSearchFailed = true
  }

  // Fail-safe: if web search failed, cap confidence and mark UNVERIFIABLE
  if (webSearchFailed) {
    return {
      verdict: 'UNVERIFIABLE',
      confidence: Math.min(0.3, calculateConfidence(0, 0, 0)),
      evidence: [],
      contradictions: [],
      sources: [],
    }
  }

  const confidence = calculateConfidence(
    evidence.length,
    contradictions.length,
    sources.length
  )

  let verdict: SemanticVerdict
  if (contradictions.length > 0) {
    verdict = 'CONTRADICTED'
  } else if (evidence.length === 0) {
    verdict = 'UNVERIFIABLE'
  } else if (confidence < 0.4) {
    verdict = 'LOW_CONFIDENCE'
  } else {
    verdict = 'VERIFIED'
  }

  return { verdict, confidence, evidence, contradictions, sources }
}

export async function semanticVerify(state: AgentState): Promise<SemanticCheck[]> {
  const claims = extractClaims(state)
  const checks: SemanticCheck[] = []

  for (const claim of claims) {
    const result = await verifyClaim(claim)
    checks.push({ claim, result })
  }

  return checks
}

export function aggregateSemantic(checks: SemanticCheck[]): {
  overallConfidence: number
  verdict: SemanticVerdict
  verifiedCount: number
  contradictedCount: number
  unverifiableCount: number
} {
  if (checks.length === 0) {
    return {
      overallConfidence: 0,
      verdict: 'UNVERIFIABLE',
      verifiedCount: 0,
      contradictedCount: 0,
      unverifiableCount: 0,
    }
  }

  const verifiedCount = checks.filter((c) => c.result.verdict === 'VERIFIED').length
  const contradictedCount = checks.filter((c) => c.result.verdict === 'CONTRADICTED').length
  const unverifiableCount = checks.filter((c) => c.result.verdict === 'UNVERIFIABLE').length

  const overallConfidence =
    checks.reduce((sum, c) => sum + c.result.confidence, 0) / checks.length

  let verdict: SemanticVerdict
  if (contradictedCount > 0) {
    verdict = 'CONTRADICTED'
  } else if (verifiedCount === checks.length) {
    verdict = 'VERIFIED'
  } else if (overallConfidence < 0.4) {
    verdict = 'LOW_CONFIDENCE'
  } else {
    verdict = 'VERIFIED'
  }

  return {
    overallConfidence,
    verdict,
    verifiedCount,
    contradictedCount,
    unverifiableCount,
  }
}
