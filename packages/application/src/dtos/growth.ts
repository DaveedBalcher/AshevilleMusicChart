import type { WeeklyStatDTO } from './weekly-stat';

export interface GrowthSnapshotDTO {
  readonly current: WeeklyStatDTO;
  readonly previous?: WeeklyStatDTO;
  readonly absoluteChange: number | null;
  readonly percentageChange: number | null;
}
