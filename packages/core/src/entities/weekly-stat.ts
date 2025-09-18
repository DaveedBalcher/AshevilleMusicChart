import { DateRange } from '../value-objects/date-range';
import { ListenCount } from '../value-objects/listen-count';

export interface WeeklyStatProps {
  weekStartDate: string;
  weekEndDate: string;
  totalListens: number;
  listensDifference?: number | null;
}

export class WeeklyStat {
  readonly period: DateRange;
  readonly totalListens: ListenCount;
  readonly listensDifference?: number;

  constructor(props: WeeklyStatProps) {
    this.period = DateRange.fromISO(props.weekStartDate, props.weekEndDate);
    this.totalListens = ListenCount.from(props.totalListens);

    if (props.listensDifference != null) {
      if (!Number.isFinite(props.listensDifference)) {
        throw new TypeError('Listens difference must be a finite number when provided.');
      }
      this.listensDifference = Math.trunc(props.listensDifference);
    }
  }

  growthSince(previous: WeeklyStat): number {
    return this.totalListens.subtract(previous.totalListens);
  }
}
