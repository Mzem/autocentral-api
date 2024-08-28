import { Failure, failure } from './result'

export interface DomainError {
  readonly code: string
  readonly message: string
}

export class NotFoundError implements DomainError {
  static CODE = 'NOT_FOUND'
  readonly code: string = NotFoundError.CODE
  readonly message: string

  constructor(entity: string, identifier?: string) {
    this.message = `${entity}${identifier ? ' ' + identifier : ''} not found`
  }
}

export function NotFoundFailure(entity: string, identifier?: string): Failure {
  return failure(new NotFoundError(entity, identifier))
}
