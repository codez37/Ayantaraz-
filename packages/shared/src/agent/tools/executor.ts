import type { ToolResult } from './webSearch'

export async function execute(task: string): Promise<ToolResult> {
  try {
    return {
      success: true,
      data: `executed: ${task}`,
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message }
  }
}
