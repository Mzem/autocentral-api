import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { firstValueFrom } from 'rxjs'
import { cleanString, fromNameToId } from '../../application/helpers'

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'

export namespace Automobiletn {
  export interface ScrapedPost {
    urlSource: string
    images: string[]
    price?: string
    new?: {
      price: string
      urlSource: string
    }
    phone: string
    make?: string
    model?: string
    type?: string
    variant?: string
    color?: string
    interiorColor?: string
    interiorType?: string
    km?: string
    year?: string
    fuel?: string
    cv?: string
    transmission?: string
    body?: string
    date?: string
    region?: string
    engine?: string
    gearbox?: string
    cylinder?: string
    description?: string
    allOptions: string[]
    merchant?: {
      name: string
      idSource: string
      urlSource: string
      address?: string
      logo?: string
      website?: string
      gmaps?: string
    }
  }
}
@Injectable()
export class AutomobiletnApiClient {
  private websiteUrl: string
  private logger: Logger

  constructor(private httpService: HttpService) {
    this.websiteUrl = `https://www.automobile.tn`
    this.logger = new Logger('AutomobiletnApiClient')
  }

  async getList(
    page: number
  ): Promise<Array<{ originalId: string; thumbnail: string }>> {
    const suffix = '/fr/occasion/'
    const url = this.websiteUrl + suffix + page

    const result: Array<{ originalId: string; thumbnail: string }> = []

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': userAgent
          }
        })
      )
      const $ = cheerio.load(response.data)
      $('.articles > div').each((_index, childElement) => {
        const originalId = $(childElement)
          .find('a.occasion-link-overlay')
          .attr('href')
          ?.replace(suffix, '')
        const thumbnail = $(childElement).find('img.thumb').attr('src')
        if (originalId && thumbnail) {
          result.push({ originalId: originalId, thumbnail })
        }
      })
    } catch (error) {
      this.logger.error('Error getIds: ' + error)
    }
    this.logger.debug('ok get list')
    return result
  }

  async getPostDetail(
    postId: string
  ): Promise<Automobiletn.ScrapedPost | undefined> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 4000))
    const suffix = '/fr/occasion/'
    const urlPost = this.websiteUrl + suffix + postId

    try {
      const response = await firstValueFrom(
        this.httpService.get(urlPost, {
          headers: {
            'User-Agent': userAgent
          }
        })
      )
      const $ = cheerio.load(response.data)

      const images: string[] = []
      $('#occasionCarousel img').each((_, imgElement) => {
        const imageUrl =
          $(imgElement).attr('data-lazy-src') || $(imgElement).attr('src')

        // Only push URLs that are not placeholder images
        if (imageUrl && !imageUrl.startsWith('data:image/gif;base64')) {
          images.push(imageUrl)
        }
      })

      const description = $('.text').first().text().trim()
      const subtitle = $('.occasion-title')
        .first()
        .find('span')
        .first()
        .text()
        .trim()

      const priceElement = $('.price-box').first()
      const price = $(priceElement).find('.price').text().trim()
      const phone = $('a.phone').attr('href')?.replace('tel:', '').trim()

      if (!phone) {
        return
      }

      const newElement = $('.versions-item')
      const newUrl = newElement.find('a').attr('href')
      const newPrice = newElement.find('.price span').text()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mainSpecs: any = {}
      $('.main-specs').each((_, specList) => {
        $(specList)
          .find('li')
          .each((_, element) => {
            const key = $(element).find('.spec-name').text()
            const valueElement = $(element).find('.spec-value')
            const value =
              valueElement.find('a').length > 0
                ? valueElement.find('a').text().trim()
                : valueElement.text().trim()

            if (key && value) {
              mainSpecs[fromNameToId(key)] = cleanString(value)
            }
          })
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const otherSpecs: any = {}
      $('.divided-specs').each((_, specList) => {
        $(specList)
          .find('li')
          .each((_, element) => {
            const key = $(element).find('.spec-name').text()
            const valueElement = $(element).find('.spec-value')
            const value =
              valueElement.find('a').length > 0
                ? valueElement.find('a').text().trim()
                : valueElement.text().trim()

            if (key && value) {
              otherSpecs[fromNameToId(key)] = cleanString(value)
            }
          })
      })

      const options: string[] = []
      const optionsElement = $('.equipments-wrapper').first()
      optionsElement?.find('.spec-value').each((_, element) => {
        const itemText = $(element).text().trim()
        if (itemText) {
          options.push(itemText)
        }
      })

      const merchantElement = $('.box.pro')
      const merchantName = merchantElement
        ?.find('span')
        ?.first()
        ?.text()
        ?.trim()
      const merchantUrlSource = merchantElement
        ?.find('a.pro-cta')
        ?.first()
        ?.attr('href')
      const merchantAddress = merchantElement?.find('.address')?.text()?.trim()
      const merchantLogo = merchantElement?.find('img')?.first()?.attr('src')
      const merchantWebsite = merchantElement
        .find('a[target="_blank"]')
        .first()
        .attr('href')
      const iframeGmaps = $('iframe.pro-map').attr('src')

      this.logger.debug('ok get detail')
      return {
        urlSource: urlPost,
        images,
        price,
        new:
          newUrl && newPrice
            ? {
                urlSource: this.websiteUrl + newUrl.trim(),
                price: newPrice.trim()
              }
            : undefined,
        phone,
        variant: subtitle,
        description,
        allOptions: options,
        make: otherSpecs['marque'],
        model: otherSpecs['modele'],
        color: otherSpecs['couleur-exterieure'],
        interiorColor: otherSpecs['couleur-interieure'],
        interiorType: otherSpecs['sellerie'],
        fuel: otherSpecs['energie'],
        gearbox: otherSpecs['boite-vitesse'],
        cv: otherSpecs['puissance-fiscale'],
        transmission: otherSpecs['transmission'],
        cylinder: otherSpecs['cylindree'],
        type: otherSpecs['generation'],
        engine: otherSpecs['moteur'],
        km: mainSpecs['kilometrage'],
        year: mainSpecs['mise-en-circulation'],
        body: mainSpecs['carrosserie'],
        date: mainSpecs['date-de-l-annonce'],
        region: mainSpecs['gouvernorat'],
        merchant: merchantUrlSource
          ? {
              name: merchantName,
              address: merchantAddress,
              logo: merchantLogo,
              urlSource: this.websiteUrl + merchantUrlSource.trim(),
              idSource: merchantUrlSource
                .trim()
                .replace('/fr/occasion/vendeurs-pro/', ''),
              website: merchantWebsite,
              gmaps: iframeGmaps
                ? generateGoogleMapsUrl(iframeGmaps)
                : undefined
            }
          : undefined
      }
    } catch (error) {
      this.logger.error('Error getPostDetail: ' + error)
    }
    return undefined
  }
}

function generateGoogleMapsUrl(embedUrl: string): string | undefined {
  // Regular expression to extract latitude and longitude from the embed URL
  const regex = /!2d([-\d.]+)!3d([-\d.]+)/
  const match = embedUrl.match(regex)

  if (match && match[1] && match[2]) {
    const longitude = match[1]
    const latitude = match[2]
    return `https://www.google.com/maps?q=${latitude},${longitude}`
  }

  return undefined
}
