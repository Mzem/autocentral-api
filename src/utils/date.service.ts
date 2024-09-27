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
  toRelative(date: DateTime): string {
    return date.toRelative({ base: DateTime.now(), locale: 'fr' })
  }
  currentYear(): number {
    return DateTime.now().year
  }
  static countExecutionTime(startDate: DateTime): number {
    return Math.abs(startDate.diffNow().milliseconds)
  }
}
