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
    .replace(/[^\w\s]/g, '') // Remove non alphanumeric
    .replace(/\s+/g, ' ') // Remove multiple whitespaces
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
}

export function cleanString(string: string): string {
  return string.toString().replace(/\s+/g, ' ').trim()
}

export function cleanStringOrNull(
  string: string | undefined | null
): string | null {
  return string ? cleanString(string) : null
}

export function capitalize(input: string): string {
  return input
    .split(' ') // Split the string into words based on spaces
    .map(word => {
      // Capitalize first alphabetic character and lower case the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ') // Join the words back with spaces
}

export function fromStringToNumber(string: string): number {
  return Number(string.toString().replace(/\D+/g, ''))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortByStringField<T extends Record<string, any>>(
  array: T[],
  fieldName: string,
  order = 'asc'
): T[] {
  return array.sort((a, b) => {
    const fieldA =
      a[fieldName] && ['string', 'number'].includes(typeof a[fieldName])
        ? a[fieldName].toString().toLowerCase()
        : undefined
    const fieldB =
      b[fieldName] && ['string', 'number'].includes(typeof b[fieldName])
        ? b[fieldName].toString().toLowerCase()
        : undefined

    if (!fieldA) {
      return 1
    }
    if (!fieldB) {
      return -1
    }

    if (fieldA < fieldB) {
      return order === 'asc' ? -1 : 1
    }
    if (fieldA > fieldB) {
      return order === 'asc' ? 1 : -1
    }
    return 0
  })
}

export function stringContains(
  string: string = '',
  containedList: string[]
): boolean {
  for (const containedOne of containedList) {
    if (
      string
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (accents)
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .includes(containedOne)
    ) {
      return true
    }
  }
  return false
}
