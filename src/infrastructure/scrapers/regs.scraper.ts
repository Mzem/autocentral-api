import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import puppeteer, { Page } from 'puppeteer'
import { firstValueFrom } from 'rxjs'

interface ScrapedReg {
  make?: string
  model?: string
  variant?: string
  registration?: string
  registrationDate?: string
  type?: string
  fuel?: string
  cv?: string
  cylinder?: string
  vin?: string
  engine?: string
  transmission?: string
  gearboxCode?: string
  constructorType?: string
}

@Injectable()
export class RegsScaper {
  private logger: Logger
  private page: Page
  private siteUrl: string
  private captchaKey: string
  private apiKey: string

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.logger = new Logger('RegsScaper')

    const config = this.configService.get('scrapers.regsScraper')
    this.siteUrl = config.siteUrl
    this.captchaKey = config.captchaKey
    this.apiKey = config.apiKey
  }

  async scrapReg(reg: string): Promise<ScrapedReg | undefined> {
    try {
      this.logger.debug('Opening browser')
      const browser = await puppeteer.launch({
        //headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ],
        timeout: 0
      })
      this.page = await browser.newPage()

      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      )
      await this.page.mouse.move(100, 100)
      this.logger.debug('Going to page')

      await this.page.goto(this.siteUrl, {
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 60000
      })

      const token = await this.getCaptchaToken()
      this.logger.debug('Request for ' + reg)

      const data = await this.getRegEval(reg, token)

      browser.close()

      if (!data || data.vin) {
        return undefined
      }
      return {
        make: data.manufacturer,
        model: data.model,
        variant: data.bodyType,
        registration: data.registration,
        registrationDate: data.inServiceDate,
        type: data.type,
        cv: data.fiscalPower,
        cylinder: data.cylinder,
        fuel: data.fuel,
        engine: data.engine,
        vin: data.vin,
        transmission: data.transmission,
        gearboxCode: data.gearboxCode,
        constructorType: data.constructorType
      }
    } catch (e) {
      this.logger.error(e)
      return undefined
    }
  }

  private async getCaptchaToken(): Promise<string> {
    this.logger.debug('Waiting for captcha')
    await this.page.waitForFunction(
      'typeof grecaptcha !== "undefined" && grecaptcha.ready',
      { timeout: 5000 }
    )
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const token = await this.page.evaluate(async captchaKey => {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        grecaptcha.ready(() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return grecaptcha
            .execute(captchaKey, {
              action: 'getCarInfo'
            })
            .then(resolve)
            .catch((error: unknown) => {
              this.logger.error('Captcha error:', error) // Log any errors
              reject(error)
            })
        })
      })
    }, this.captchaKey)
    return token as string
  }

  private async _getReg(
    reg: string,
    captchaToken: string
  ): Promise<CarRegDto | undefined> {
    const response = await firstValueFrom(
      this.httpService.get<CarRegDto | undefined>(
        `${this.siteUrl}/api/gatewayclient/registration/${reg}?vinverif=3C0KZ48658A300326`,
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            'captcha-token': captchaToken,
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          withCredentials: true
        }
      )
    )
    if (!response?.data) {
      return undefined
    }
    if (response.data.code) {
      return {}
    }
    return response.data
  }

  private async getRegEval(
    reg: string,
    captchaToken: string
  ): Promise<CarRegDto | undefined> {
    try {
      const response = await this.page.evaluate(
        async (reg, captchaToken, siteUrl, apiKey) => {
          const url = `${siteUrl}/api/gatewayclient/registration/${reg}?vinverif=3C0KZ48658A300326`
          try {
            const result = await fetch(url, {
              method: 'GET',
              headers: {
                Authorization: `Basic ${apiKey}`,
                'captcha-token': captchaToken,
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            })

            // Check the response status
            if (!result.ok) {
              return undefined
            }

            // Parse response as JSON
            const data = await result.json()
            return data
          } catch (fetchError) {
            return undefined
          }
        },
        reg,
        captchaToken,
        this.siteUrl,
        this.apiKey
      )

      if (!response) {
        this.logger.error(`Error during fetch: ${response?.error}`)
        return undefined
      }
      if (response.code) {
        return {}
      }
      return response
    } catch (error) {
      this.logger.error('Error executing getReg:', error)
      return undefined
    }
  }
}

interface CarRegDto {
  code?: string
  manufacturer?: string
  model?: string
  bodyType?: string
  registration?: string
  inServiceDate?: string
  type?: string
  fuel?: string
  fiscalPower?: string
  cylinder?: string
  vin?: string
  engine?: string
  transmission?: string
  gearboxCode?: string
  constructorType?: string
}
