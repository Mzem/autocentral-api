export function mapEngineYears(fromYear: string, toYear: string): string {
  let years = ''
  if (fromYear === 'all' || toYear === 'all') {
    years = 'all'
  } else {
    if (fromYear === 'unknown') {
      years += '...'
    } else {
      years += fromYear
    }

    if (toYear === 'present' || toYear === 'unknown') {
      years += ' > ...'
    } else {
      years += ` > ${toYear}`
    }
  }
  return years
}
