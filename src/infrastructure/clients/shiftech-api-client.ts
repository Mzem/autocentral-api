import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'

export namespace Shiftech {
  export interface MakesDto {
    hits: Array<{ brand: { name: string; slug: string } }>
  }
  export interface ModelsDto {
    hits: Array<{
      model: { id: string; name: string; slug: string; image: string | null }
    }>
  }
  export interface TypeYearsDto {
    hits: Array<{
      version: { id: string; name: string; slug: string; year: string }
    }>
  }
  export interface EnginesDto {
    hits: Array<{
      engine: { name: string; slug: string; horsepower: string; fuel: string }
    }>
  }
  export interface RemapDto {
    blocks: Array<{
      content: {
        horsepower: string
        torque: string
        stages: Array<{
          name: 'stage1' | 'stage2'
          horsepowerTotal: string
          torqueTotal: string
        }>
      }
    }>
  }
}
@Injectable()
export class ShiftechApiClient {
  private apiUrl: string = 'https://search.unanim.studio/indexes'
  private token: string
  private logger: Logger

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    this.token = this.configService.get('scrapers.shiftech.apiToken')!
    this.logger = new Logger('ShiftechApiClient')
  }

  async getMakes(): Promise<Shiftech.MakesDto> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl + '/shif23ecom_prod_brands/search',
        {
          q: '',
          hitsPerPage: 1000,
          sort: [
            'brand.name:asc',
            'version.name:asc',
            'model.name:asc',
            'engine.horsepower:asc'
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      )
    )
    return response.data
  }

  async getModels(make: string): Promise<Shiftech.ModelsDto> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl + '/shif23ecom_prod_models/search',
        {
          q: '',
          filter: `type = car AND brand.slug = ${make}`,
          hitsPerPage: 1000,
          sort: [
            'brand.name:asc',
            'version.name:asc',
            'model.name:asc',
            'engine.horsepower:asc'
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      )
    )
    return response.data
  }

  async getTypeYears(
    make: string,
    model: string
  ): Promise<Shiftech.TypeYearsDto> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl + '/shif23ecom_prod_versions/search',
        {
          q: '',
          filter: `type = car AND brand.slug = ${make} AND model.slug = ${model}`,
          hitsPerPage: 1000,
          sort: [
            'brand.name:asc',
            'version.name:asc',
            'model.name:asc',
            'engine.horsepower:asc'
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      )
    )
    return response.data
  }

  async getEngines(
    make: string,
    model: string,
    year: string
  ): Promise<Shiftech.EnginesDto> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl + '/shif23ecom_prod_engines/search',
        {
          q: '',
          filter: `type = car AND brand.slug = ${make} AND model.slug = ${model} AND version.slug = ${year}`,
          hitsPerPage: 1000,
          sort: [
            'brand.name:asc',
            'version.name:asc',
            'model.name:asc',
            'engine.horsepower:asc'
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      )
    )
    return response.data
  }

  async getRemap(
    make: string,
    model: string,
    year: string,
    engine: string
  ): Promise<{ remap: Shiftech.RemapDto; urlSource: string }> {
    const urlSource = `https://www.shiftech.eu/endpoints/fr/reprogramming/${make}/${model}/${year}/${engine}`
    const response = await firstValueFrom(this.httpService.get(urlSource))
    return { remap: response.data, urlSource }
  }
}
