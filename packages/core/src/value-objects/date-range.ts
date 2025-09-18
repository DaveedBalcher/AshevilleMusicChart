import { isISODateString } from '../utils/is-iso-date-string';

export class DateRange {
  readonly start: string;
  readonly end: string;

  private constructor(start: string, end: string) {
    this.start = start;
    this.end = end;
  }

  static fromISO(start: string, end: string): DateRange {
    if (!isISODateString(start)) {
      throw new TypeError(`Invalid ISO date string for range start: ${start}`);
    }

    if (!isISODateString(end)) {
      throw new TypeError(`Invalid ISO date string for range end: ${end}`);
    }

    if (end < start) {
      throw new RangeError('Date range end must be on or after the start date.');
    }

    return new DateRange(start, end);
  }

  contains(date: string): boolean {
    if (!isISODateString(date)) {
      throw new TypeError(`Invalid ISO date string: ${date}`);
    }

    return date >= this.start && date <= this.end;
  }
}
