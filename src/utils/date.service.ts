import { Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'

@Injectable()
export class DateService {
  now(): DateTime {
    return DateTime.now()
  }
  nowJs(): Date {
    return new Date()
  }
  static countExecutionTime(startDate: DateTime): number {
    return startDate.diffNow().milliseconds * -1
  }
}
