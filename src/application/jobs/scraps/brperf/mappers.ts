export function parseTypeDatesYears(
  carTitleName: string
): [string | null, string, string] {
  let vehicleType: string | null = null
  let startYear: string = 'unknown'
  let endYear: string = 'unknown'

  // Remove the month (MM) if present, but keep the year (YYYY)
  carTitleName = carTitleName.replace(/(\d{2})\/(\d{4})/, '$2').trim()

  // Split the cleaned line into parts
  const parts = carTitleName.split(/\s+/)

  // Check if the first part is a date (e.g., 10/2019) or "All"
  if (/^\d{2}\/\d{4}$/.test(parts[0]) || parts[0] === 'All') {
    vehicleType = null
    return [vehicleType, startYear, endYear]
  } else {
    // Identify the vehicle type by checking all leading non-numeric parts
    const vehicleTypeParts: string[] = []
    for (const part of parts) {
      if (
        /^\d{4}$/.test(part) ||
        part === '...' ||
        part.toLowerCase() === 'all'
      ) {
        break
      }
      vehicleTypeParts.push(part)
    }

    vehicleType = vehicleTypeParts.join(' ')
    const years = parts.slice(vehicleTypeParts.length).join(' ')

    // Handle different cases of years
    if (years.includes('...')) {
      const yearParts = years.split(/\s+/)
      if (yearParts.length === 2) {
        if (yearParts[0] === '...') {
          startYear = 'Unknown'
          endYear = yearParts[1]
        } else {
          startYear = yearParts[0]
          endYear = 'Present'
        }
      } else if (yearParts.length === 1) {
        if (yearParts[0] === '...') {
          startYear = 'Unknown'
          endYear = 'Unknown'
        } else {
          startYear = yearParts[0]
          endYear = 'Present'
        }
      }
    } else if (/^\d{4}\s+\d{4}$/.test(years)) {
      ;[startYear, endYear] = years.split(/\s+/)
    } else if (/^\d{4}\s+\.\.\.$/.test(years)) {
      startYear = years.split(/\s+/)[0]
      endYear = 'Present'
    } else if (/^\.\.\.\s+\d{4}$/.test(years)) {
      startYear = 'Unknown'
      endYear = years.split(/\s+/)[1]
    } else if (/^All$/.test(years)) {
      startYear = 'Unknown'
      endYear = 'Unknown'
    }
  }

  return [vehicleType, startYear, endYear]
}
