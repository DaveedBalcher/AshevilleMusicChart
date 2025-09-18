import { ArtistHistory } from '../entities/artist-history';
import { WeeklyStat } from '../entities/weekly-stat';

export interface GrowthSnapshot {
  readonly current: WeeklyStat;
  readonly previous?: WeeklyStat;
  readonly absoluteChange: number | null;
  readonly percentageChange: number | null;
}

export function calculateGrowthBetween(current: WeeklyStat, previous?: WeeklyStat): GrowthSnapshot {
  if (!previous) {
    return {
      current,
      previous: undefined,
      absoluteChange: null,
      percentageChange: null,
    } satisfies GrowthSnapshot;
  }

  const absoluteChange = current.growthSince(previous);
  const percentageChange = previous.totalListens.value === 0
    ? null
    : (absoluteChange / previous.totalListens.value) * 100;

  return {
    current,
    previous,
    absoluteChange,
    percentageChange,
  } satisfies GrowthSnapshot;
}

export function currentGrowth(history: ArtistHistory): GrowthSnapshot {
  return calculateGrowthBetween(history.currentWeek, history.previousWeek);
}
