import { Artist } from './artist';
import { WeeklyStat } from './weekly-stat';

function ensureChronological(stats: WeeklyStat[]): WeeklyStat[] {
  const ordered = [...stats].sort((a, b) => a.period.start.localeCompare(b.period.start));

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];

    if (previous.period.end > current.period.start) {
      throw new Error('Weekly stats must be provided in chronological order without overlap.');
    }
  }

  return ordered;
}

export class ArtistHistory {
  readonly artist: Artist;
  private readonly weeklyStats: WeeklyStat[];

  constructor(artist: Artist, stats: Iterable<WeeklyStat>) {
    const statList = Array.from(stats);

    if (statList.length === 0) {
      throw new Error('Artist history requires at least one weekly stat.');
    }

    this.artist = artist;
    this.weeklyStats = ensureChronological(statList);
  }

  get weeks(): readonly WeeklyStat[] {
    return this.weeklyStats;
  }

  get currentWeek(): WeeklyStat {
    return this.weeklyStats[this.weeklyStats.length - 1];
  }

  get previousWeek(): WeeklyStat | undefined {
    if (this.weeklyStats.length < 2) {
      return undefined;
    }

    return this.weeklyStats[this.weeklyStats.length - 2];
  }

  growthSincePreviousWeek(): number | null {
    const previous = this.previousWeek;

    if (!previous) {
      return null;
    }

    return this.currentWeek.growthSince(previous);
  }
}
