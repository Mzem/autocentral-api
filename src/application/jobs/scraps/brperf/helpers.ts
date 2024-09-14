import * as cheerio from 'cheerio'
import { Element } from 'domhandler'

export function removeHelperStrings(
  inputList: string[],
  resultList: string[]
): string[] {
  return resultList.filter(item => !inputList.includes(item))
}

export function normalizeSpaces(line: string): string {
  return line.split(/\s+/).join(' ') // Split by any whitespace and rejoin by single space
}

export function removeDuplicatesPreserveOrder<T>(lst: T[]): T[] {
  const seen = new Set<T>()
  return lst.filter(x => {
    if (seen.has(x)) {
      return false
    }
    seen.add(x)
    return true
  })
}

export function convertFromHtmlToDict(
  tableCarCategoryTechnical: cheerio.Cheerio<Element>
): Record<string, string | null> {
  const data: Record<string, string | null> = {}

  const rows = tableCarCategoryTechnical.find('tr')

  // Parse horsepower data
  if (rows.length > 1 && rows.eq(1).find('td').length >= 3) {
    data['hp'] = rows.eq(1).find('td').eq(0).text().trim()
    data['hp_remap'] = rows.eq(1).find('td').eq(1).text().trim()
  } else {
    data['hp'] = null
    data['hp_remap'] = null
  }

  // Parse torque data
  if (rows.length > 2 && rows.eq(2).find('td').length >= 3) {
    data['torque'] = rows.eq(2).find('td').eq(0).text().trim()
    data['torque_remap'] = rows.eq(2).find('td').eq(1).text().trim()
  } else {
    data['torque'] = null
    data['torque_remap'] = null
  }

  return data
}

export function parseCarTypesNames(aTags: cheerio.Cheerio<Element>): string[] {
  const result: string[] = []
  let lastHref: string | null = null

  aTags.each((_index, tag) => {
    // tag is already an Element, so we can access its properties directly
    const href = (tag as Element).attribs['href'] // Access 'href' directly from attribs
    const text = (tag as Element).children
      .map(child => (child.type === 'text' ? child.data || '' : ''))
      .join('')
      .trim() // Access and join text content from children

    if (href !== lastHref) {
      result.push(text)
      lastHref = href
    }
  })

  return result
}
