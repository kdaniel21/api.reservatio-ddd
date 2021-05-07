import {
  lastDayOfYear,
  addMonths,
  eachWeekOfInterval,
  set,
  setDate,
  eachMonthOfInterval,
  differenceInCalendarDays,
  addDays,
} from 'date-fns'

export default class DateUtils {
  static lastDayOfCurrentYear(): Date {
    return lastDayOfYear(new Date())
  }

  static addDays(date: Date, numOfDays: number): Date {
    return addDays(date, numOfDays)
  }

  static addMonths(date: Date, numOfMonths: number): Date {
    return addMonths(date, numOfMonths)
  }

  static getWeeklyInterval(startDate: Date, endDate: Date): Date[] {
    return eachWeekOfInterval(
      { start: startDate, end: endDate },
      { weekStartsOn: startDate.getDay() as 1 | 2 | 3 | 4 | 5 | 6 }
    ).map(weekStart =>
      set(weekStart, { hours: startDate.getHours(), minutes: startDate.getMinutes(), seconds: startDate.getSeconds() })
    )
  }

  static getMonthlyInterval(startDate: Date, endDate: Date): Date[] {
    return eachMonthOfInterval({ start: startDate, end: endDate })
      .map(monthStart => {
        const correctDate = setDate(monthStart, startDate.getDate())
        return set(correctDate, {
          hours: startDate.getHours(),
          minutes: startDate.getMinutes(),
          seconds: startDate.getSeconds(),
        })
      })
      .filter(date => date.getTime() <= endDate.getTime())
  }

  static removeTime(date: Date): Date {
    return new Date(date.toDateString())
  }

  static differenceInCalendarDays(startDate: Date, endDate: Date): number {
    return differenceInCalendarDays(endDate, startDate)
  }
}
