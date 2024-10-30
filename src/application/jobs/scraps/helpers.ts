import { Fuel, Gearbox, Transmission } from '../../../domain/car-model'
import { BodyType, Color, InteriorType } from '../../../domain/car-post'
import {
  cleanString,
  cleanStringOrNull,
  fromStringToNumber,
  stringContains
} from '../../helpers'

export function generateId(
  postId: string,
  source: 'TAYARA' | 'AUTOMOBILETN'
): string {
  return `${source}-${postId}`
}

export function isPostIgnored(
  titleDescription: string,
  title: string,
  make?: string | null
): boolean {
  return Boolean(
    stringContains(titleDescription, [
      'tracteur',
      'trakteur',
      'trax',
      'traks',
      'poid lour',
      'poid lours',
      'poids lourd',
      'camion om',
      'vespa',
      'mobylette',
      'location'
    ]) ||
      stringContains(title, [
        'jante',
        '4 roue',
        'accessoir',
        'accesoir',
        'accsoir',
        'piece',
        'pneu',
        '3jeli',
        '3jal',
        '3ajla',
        'cherche',
        'chauffeur',
        'malle',
        'male',
        'retro',
        'volant',
        'pare-ch',
        'parechoc',
        'parach',
        'para-ch',
        'parash',
        'volan',
        'acciden',
        'aciden'
      ]) ||
      ['AC', 'Acrea', 'Acura', 'Masey Ferguson', 'UFO', 'Zotye'].includes(
        make ?? ''
      )
  )
}

export function cleanTitle(title: string): string | null {
  return (
    cleanStringOrNull(title.substring(0, 75))
      ?.toUpperCase()
      .replace('VOITURE', '')
      .replace('VEHICULE', '')
      .replace('A VENDRE', '')
      .replace('A VENTE', '')
      .replace('VENTE', '')
      .replace('À VENDRE', '')
      .replace('A VANDRE', '')
      .replace('AVENDRE', '')
      .replace('AVANDRE', '')
      .replace('AVANDR', '')
      .replace('AVENDR', '')
      .replace('VANDRE', '')
      .replace('VOITUR', '')
      .replace('VOITUR', '')
      .replace('TRÈS BELLE', '')
      .replace('TRÈS BIEN', '')
      .replace('TRES BELLE', '')
      .replace('TRES BIEN', '')
      .replace('BELLE', '')
      .replace('BIEN', '')
      .replace('MERCEDESBENZ', 'MERCEDES')
      .replace('MERCEDES-BENZ', 'MERCEDES')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .replace(/[\n\t\r]/g, '')
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ''
      )
      .trim() || null
  )
}
export function mapInteriorType(description: string): InteriorType | null {
  if (stringContains(description, ['simili'])) return InteriorType.LEATHERETTE
  if (stringContains(description, ['cuir'])) return InteriorType.LEATHER
  if (stringContains(description, ['alcant'])) return InteriorType.ALCANTARA
  if (stringContains(description, ['tissu'])) return InteriorType.FABRIC

  return null
}

export function mapPrice(price: string): number | null {
  const sanitized = fromStringToNumber(price)
  if (
    sanitized === 0 ||
    sanitized.toString().length === 1 ||
    (sanitized.toString().length === 4 &&
      !sanitized.toString().includes('00')) ||
    sanitized.toString().includes('123') ||
    sanitized.toString().includes('111') ||
    sanitized.toString().includes('999')
  )
    return null
  if (sanitized.toString().length === 2 || sanitized.toString().length === 3)
    return Number(sanitized.toString() + '000')

  return sanitized
}

export function mapKm(
  km: string | null | undefined,
  year: number,
  currentYear: number
): number | null {
  if (km === null || km === undefined) return null

  const sanitizedKm = fromStringToNumber(km)

  // if current year is 2024

  // 2011 and older
  if (year < currentYear - 12) {
    if (sanitizedKm < 100) return 400000
    if (sanitizedKm < 1000) return Number(sanitizedKm.toString() + '000')
    if (sanitizedKm < 10000) return Number(sanitizedKm.toString() + '00')
    if (sanitizedKm < 25000) return Number(sanitizedKm.toString() + '0')
  }
  // 2020 and older
  if (year < currentYear - 3) {
    if (sanitizedKm === 0) return null
    if (sanitizedKm < 10) return Number(sanitizedKm.toString() + '0000')
    if (sanitizedKm < 100) return Number(sanitizedKm.toString() + '000')
    if (sanitizedKm < 1000) return Number(sanitizedKm.toString() + '00')
  }

  if (
    sanitizedKm.toString().includes('999') ||
    [1234, 12345, 123456, 1234567, 12345678, 1111, 2222, 11111, 22222].includes(
      sanitizedKm
    )
  )
    return null

  return sanitizedKm
}

export function mapBody(
  titleDescription: string,
  body?: string | null
): BodyType | null {
  if (!body) return null

  if (
    stringContains(titleDescription, [
      'partnair',
      'partner',
      'partenair',
      'kango',
      'berling',
      'doblo',
      'dok',
      'cady',
      'caddy',
      'caddy'
    ])
  )
    return BodyType.UTILITY

  if (stringContains(titleDescription, ['van', 'hicace', 'scenic']))
    return BodyType.MONOSPACE_VAN

  if (stringContains(titleDescription, ['coupe'])) return BodyType.COUPE

  if (stringContains(titleDescription, ['roadster', 'cabrio', 'decapo']))
    return BodyType.CABRIOLET

  if (stringContains(titleDescription, ['break'])) return BodyType.BREAK

  if (
    stringContains(titleDescription, ['polo', 'ibiza', 'golf', 'leon', 'rio'])
  )
    return BodyType.COMPACT

  const sanitized = cleanString(body)

  switch (sanitized) {
    case 'Compacte':
      return BodyType.COMPACT
    case 'Berline':
      return BodyType.BERLINE
    case 'Cabriolet':
      return BodyType.CABRIOLET
    case '4 x 4':
      return BodyType.SUV
    case 'Monospace':
      return BodyType.MONOSPACE_VAN
    case 'Utilitaire':
      return BodyType.UTILITY
    case 'Pick up':
      return BodyType.PICKUP
  }
  return null
}

export function mapTransmission(description: string): Transmission | null {
  if (
    stringContains(description, [
      'integral',
      '4 motion',
      '4motion',
      '4matic',
      '4 matic',
      'x drive',
      'xdrive',
      'awd',
      '4wd',
      '4 wd',
      '4 roue',
      '4roue',
      'quatre roue'
    ])
  )
    return Transmission.AWD
  return null
}

export function mapGearbox(
  gearbox: string | null | undefined,
  titleDescription: string
): Gearbox | null {
  const cleaned = cleanStringOrNull(gearbox)

  switch (cleaned) {
    case 'Automatique':
      return Gearbox.AUTO
    case 'Manuelle':
      return Gearbox.MANUAL
    default:
      if (stringContains(titleDescription, ['bva', 'boite auto']))
        return Gearbox.AUTO
      return null
  }
}

export function mapColor(color: string | null | undefined): Color | null {
  const cleaned = cleanStringOrNull(color)

  switch (cleaned) {
    case 'Argent':
    case 'Gris':
      return Color.GREY
    case 'Beige':
    case 'Camel':
    case 'Doré':
    case 'Marron':
      return Color.BROWN
    case 'Blanc':
      return Color.WHITE
    case 'Bleu':
    case 'Corail':
      return Color.BLUE
    case 'Jaune':
      return Color.YELLOW
    case 'Noir':
      return Color.BLACK
    case 'Orange':
      return Color.ORANGE
    case 'Rose':
      return Color.PINK
    case 'Rouge':
      return Color.RED
    case 'Vert':
      return Color.GREEN
    case 'Violet':
      return Color.PURPLE
    default:
      return null
  }
}

export function mapFuel(fuel: string | null | undefined): Fuel | null {
  const cleaned = cleanStringOrNull(fuel)

  switch (cleaned) {
    case 'Essence':
    case 'essence':
    case 'petrole':
    case 'petrol':
    case 'Petrole':
    case 'Petrol':
    case 'gasoline':
    case 'Gasoline':
      return Fuel.ESSENCE
    case 'diesel':
    case 'Diesel':
      return Fuel.DIESEL
    case 'hybrid':
    case 'Hybrid':
    case 'Hybride':
    case 'Hybride Diesel':
    case 'Hybride Essence':
    case 'electric':
    case 'Electric':
    case 'electrique':
    case 'Electrique':
      return Fuel.HYBRID
    default:
      return null
  }
}

export function mapYear(year: string | undefined | null): number | null {
  if (!year) return null
  const yearMatch = year.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    return parseInt(yearMatch[0], 10)
  }
  return null
}

export function mapPhoneNumber(
  phone: string | undefined | null
): number | null {
  if (!phone) return null
  const tmpPhone = fromStringToNumber(phone)
  const potentialPhoneNumber = tmpPhone.toString().slice(-8)
  if (potentialPhoneNumber.length !== 8 || isNaN(Number(potentialPhoneNumber)))
    return null

  return Number('00216' + potentialPhoneNumber)
}
