import { Logger } from '@nestjs/common'
import { failure, Result } from '../../utils/result/result'
import { LogEvent, LogEventKey } from './log.event'
import { Query } from './query'
/**
 * @see https://martinfowler.com/bliki/CommandQuerySeparation.html
 * @see https://udidahan.com/2009/12/09/clarified-cqrs/
 */
export abstract class QueryHandler<Q extends Query | void, R> {
  protected logger: Logger
  private queryHandlerName: string

  constructor(queryHandlerName: string) {
    this.logger = new Logger(queryHandlerName)
    this.queryHandlerName = queryHandlerName
  }

  async execute(query: Q): Promise<Result<R>> {
    try {
      const result = await this.handle(query)
      this.logAfter(query, result)
      return result
    } catch (e) {
      this.logAfter(query, failure(e))
      throw e
    }
  }

  abstract handle(query: Q): Promise<Result<R>>

  protected logAfter(query: Q, result: Result<R>): void {
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    if (query?.accessToken) {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      query.accessToken = '[REDACTED]'
    }
    const event = new LogEvent(LogEventKey.QUERY_EVENT, {
      handler: this.queryHandlerName,
      query,
      result
    })
    this.logger.log(event)
  }
}
