export type ToolResult = {
  success: boolean
  data?: unknown
  error?: string
}

export type WebSearchResult = {
  results: Array<{ title: string; url: string; snippet: string }>
  query: string
}

export async function webSearch(query: string): Promise<ToolResult> {
  try {
    const res = await fetch(process.env.WEB_SEARCH_API_URL || 'https://api.search.mock/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${res.statusText}` }
    }

    const data: WebSearchResult = await res.json()
    return { success: true, data }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message }
  }
}
