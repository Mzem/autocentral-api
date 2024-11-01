import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as cheerio from 'cheerio'
import { firstValueFrom } from 'rxjs'

export namespace Tayara {
  export interface MerchantInfo {
    description: string | null
    address: string | null
  }
  export interface PostDetail {
    km: string | null
    color: string | null
    gearbox: string | null
    year: string | null
    cylinder: string | null
    make: string | null
    model: string | null
    cv: string | null
    body: string | null
    fuel: string | null
    merchant: {
      id: string | null
      phoneNumber: string | null
      description: string | null
      address: string | null
      website: string | null
    }
  }
  export interface PostDetailDto {
    props: {
      pageProps: {
        adDetails: {
          title: string
          description: string
          phone: string
          id: string
          price: number
          images: string[]
          location: {
            delegation: string
            governorate: string
          }
          category: string
          subCategoryId: string
          publishedOn: string
          publisher: {
            avatar: string
            id: string
          }
          adParams: [
            { label: 'Kilométrage'; value: string },
            { label: 'Couleur du véhicule'; value: string },
            { label: 'Etat du véhicule'; value: string },
            { label: 'Boite'; value: string },
            { label: 'Marque'; value: string },
            { label: 'Modèle'; value: string },
            { label: 'Carburant'; value: string },
            { label: 'Type de carrosserie'; value: string },
            { label: 'Puissance fiscale'; value: string },
            { label: 'Année'; value: string },
            { label: 'Cylindrée'; value: string }
          ]
          sold: boolean
          deleted: boolean
          state: number
        }
        adUserData: {
          avatar: string
          address: string
          email: string
          fullname: string
          isShop: boolean
          enabled: boolean
          kcid: string
          favoritesList: string[]
          phonenumber: string
          tokenbalance: number
          url: string
          id: string
          shopBackgroundIMage: string
          description: string
          categoryId: string
          blacklist: string[]
        }
        countAdByUser: number
      }
    }
    buildId: string
  }
  export interface PostDto {
    id: string
    title: string
    images: string[]
    description: string
    price?: string
    phone: string
    location: {
      delegation: string
      governorate: string
    }
    metadata: {
      publishedOn: string
      isModified: boolean
      subCategory: string
      isFeatured: boolean
      publisher: {
        isApproved: boolean
        name: string
        isShop: boolean
        avatar: string
      }
      producttype: number
    }
  }
  export interface PostsFrontDto {
    pageProps: {
      searchedListingsAction: {
        newHits: PostDto[]
      }
    }
  }

  export interface ScrapedPost {
    post: PostDto
    detail?: PostDetail
  }
}
@Injectable()
export class TayaraApiClient {
  private apiUrl: string
  private logger: Logger

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {
    const _buildId = this.configService.get('scrapers.tayara.buildId')!
    //this.apiUrl = `https://www.tayara.tn/_next/data/${buildId}/en/ads/c/V%C3%A9hicules.json?category=V%C3%A9hicules`
    this.apiUrl = `https://www.tayara.tn/api/marketplace`
    this.logger = new Logger('TayaraApiClient')
  }

  async getPosts(page: number): Promise<Tayara.ScrapedPost[]> {
    const response = await firstValueFrom(
      this.httpService.post<[[Tayara.PostDto[], number], unknown]>(
        this.apiUrl + `/search-api`,
        {
          searchRequest: {
            query: '',
            offset: page * 20,
            limit: 20,
            sort: 0,
            filter: {
              categoryId: '60be84bc50ab95b45b08a094',
              subCategoryId: '60be84be50ab95b45b08a0a4'
            }
          }
        }
      )
    )

    const posts = response.data[0][0] ?? []

    const result: Tayara.ScrapedPost[] = []

    for (const post of posts) {
      const detail = await this.getPostDetail(post.id)

      result.push({ post, detail })
    }
    return result
  }

  private async getPostDetail(
    postId: string
  ): Promise<Tayara.PostDetail | undefined> {
    const urlPost = `https://www.tayara.tn/item/${postId}`
    try {
      const response = await firstValueFrom(this.httpService.get(urlPost))
      const $ = cheerio.load(response.data)
      const scriptContent = $('#__NEXT_DATA__').html()

      if (scriptContent) {
        const jsonData = JSON.parse(scriptContent) as Tayara.PostDetailDto
        const postDetail: Tayara.PostDetail = {
          km:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Kilométrage'
            )?.value || null,
          color:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Couleur du véhicule'
            )?.value || null,
          gearbox:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Boite'
            )?.value || null,
          year:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Année'
            )?.value || null,
          cylinder:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Cylindrée'
            )?.value || null,
          make:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Marque'
            )?.value || null,
          model:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Modèle'
            )?.value || null,
          cv:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Puissance fiscale'
            )?.value || null,
          body:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Type de carrosserie'
            )?.value || null,
          fuel:
            jsonData.props.pageProps.adDetails.adParams.find(
              param => param.label === 'Carburant'
            )?.value || null,
          merchant: {
            id: jsonData.props.pageProps.adUserData.id || null,
            description:
              jsonData.props.pageProps.adUserData.description || null,
            phoneNumber:
              jsonData.props.pageProps.adUserData.phonenumber || null,
            address: jsonData.props.pageProps.adUserData.address || null,
            website: jsonData.props.pageProps.adUserData.url || null
          }
        }
        return postDetail
      }
    } catch (error) {
      this.logger.error('Error getPostDetail: ' + error)
    }
    return undefined
  }
}
