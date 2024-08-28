export function mapEngineYears(
  fromYear: string | null,
  toYear: string | null
): string {
  let years = ''
  if (fromYear === 'All' || toYear === 'All') {
    years = 'All'
  } else {
    if (fromYear === 'unknown' || !fromYear) {
      years += '...'
    } else {
      years += fromYear
    }
    if (toYear === 'Present') {
      years += ' > ...'
    } else if (toYear === 'unknown' || !toYear) {
      years += ' > ...'
    } else {
      years += ` > ${toYear}`
    }
  }
  return years
}
