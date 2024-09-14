export const ScraperRepositoryToken = 'ScraperRepositoryToken'

export namespace Scraper {
  export enum Category {
    CAR_ENGINE = 'CAR_ENGINE',
    CAR_MODEL = 'CAR_MODEL',
    CAR_POST = 'CAR_POST'
  }
  export enum Site {
    BRPERF = 'BRPERF',
    SHIFTECH = 'SHIFTECH',
    AUTOMOBILE_TN = 'AUTOMOBILE_TN',
    TAYARA = 'TAYARA'
  }

  export interface Repository {
    save(category: Category, site: Site, json: object): Promise<void>
    get<T>(category: Category, site: Site): Promise<T>
  }
}
