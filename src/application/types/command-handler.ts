import { Logger } from '@nestjs/common'
import {
  Failure,
  failure,
  isSuccess,
  Result,
  success,
  Success
} from '../../utils/result/result'
import { LogEvent, LogEventKey } from './log.event'

export abstract class CommandHandler<C, R> {
  protected logger: Logger
  private commandName: string

  constructor(commandName: string) {
    this.commandName = commandName
    this.logger = new Logger(commandName)
  }

  async execute(command: C): Promise<Result<R>> {
    try {
      const result = await this.handle(command)

      this.logAfter(command, result)

      return result
    } catch (e) {
      this.logAfter(command, failure(e))
      throw e
    }
  }

  abstract handle(command: C): Promise<Result<R>>

  protected logAfter(command: C, result: Result<R>): void {
    const mappedResult = mapResult(result)
    const commandSanitized = sanitizeCommand(command)

    const event = new LogEvent(LogEventKey.COMMAND_EVENT, {
      handler: this.commandName,
      command: commandSanitized,
      result: mappedResult
    })
    this.logger.log(event)
  }
}

function mapResult<T>(result: Success<T> | Failure): Result<unknown> {
  if (isSuccess(result)) {
    return typeof result.data === 'object'
      ? result
      : success({
          value: result.data
        })
  }
  return result
}

function sanitizeCommand<C>(command: C | undefined): C | undefined {
  const commandSanitized = {
    ...command
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (commandSanitized && commandSanitized.file) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    commandSanitized.file = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ...commandSanitized.file,
      buffer: undefined
    }
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return commandSanitized
}
