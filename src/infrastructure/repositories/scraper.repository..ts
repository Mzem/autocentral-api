import { Injectable, Logger } from '@nestjs/common'
import { Scraper } from '../../domain/scraper'
import { FirebaseClient } from '../clients/firebase-client'
import { bufferToJson } from '../../application/helpers'

const SCRAPS_DIR = 'scraps'

@Injectable()
export class ScraperRepository implements Scraper.Repository {
  private logger: Logger

  constructor(private firebaseClient: FirebaseClient) {
    this.logger = new Logger('ScraperRepository')
  }

  async save(
    category: Scraper.Category,
    site: Scraper.Site,
    json: unknown
  ): Promise<void> {
    await this.firebaseClient.uploadJSON(buildFileName(category, site), json)
  }
  async get<T>(category: Scraper.Category, site: Scraper.Site): Promise<T> {
    const fileBuffer = await this.firebaseClient.downloadFile(
      buildFileName(category, site)
    )
    return bufferToJson<T>(fileBuffer)
  }
}

function buildFileName(category: Scraper.Category, site: Scraper.Site): string {
  return `${SCRAPS_DIR}/${category}/${site}.json`
}
