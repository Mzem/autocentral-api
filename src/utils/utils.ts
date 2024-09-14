export function sanitizeStringForDBInsert(
  input?: string | null
): string | null {
  if (
    !input ||
    input.includes('null') ||
    input.includes('Null') ||
    input.includes('NULL') ||
    input.trim() === 'N' ||
    input.trim() === '-' ||
    input.trim() === ''
  )
    return null

  const sanitized = input
    .replace(/\\/g, '')
    .replace(/"/g, '')
    .replace(/\\t/g, '')
    .replace(/\t/g, '')

  return sanitized.trim()
}

export function bufferToJson<T>(buffer: Buffer): T {
  return JSON.parse(buffer.toString())
}
