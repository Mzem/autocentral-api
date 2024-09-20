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

export function fromNameToId(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ') // Remove multiple whitespaces
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
}

export function cleanString(string: string): string {
  return string.toString().replace(/\s+/g, ' ').trim()
}
