import { NotFoundException } from '@nestjs/common'
import { NotFoundError } from './error'
import { Failure, isFailure, Result } from './result'
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception'

export function handleResult<R>(result: Result<R>): R
export function handleResult<R, T>(result: Result<R>, mapper: (data: R) => T): T
export function handleResult<R, T>(
  result: Result<R>,
  mapper?: (data: R) => T
): R | T {
  if (isFailure(result)) handleFailure(result)
  const transform = mapper ?? ((data: R): R => data)
  return transform(result.data)
}

function handleFailure(result: Failure): never {
  switch (result.error.code) {
    case NotFoundError.CODE:
      throw new NotFoundException(result.error.message)
    default:
      throw new RuntimeException(result.error.message)
  }
}
