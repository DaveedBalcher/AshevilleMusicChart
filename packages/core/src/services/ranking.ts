import { ArtistHistory } from '../entities/artist-history';
import { Chart } from '../entities/chart';

export interface RankingRule {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  score(history: ArtistHistory): number;
}

export interface RankedArtist {
  readonly rank: number;
  readonly score: number;
  readonly history: ArtistHistory;
}

export interface RankingOptions {
  readonly tieBreaker?: (a: ArtistHistory, b: ArtistHistory) => number;
}

const defaultTieBreaker = (a: ArtistHistory, b: ArtistHistory): number =>
  a.artist.name.localeCompare(b.artist.name);

export function applyRanking(
  chart: Chart,
  rule: RankingRule,
  options: RankingOptions = {},
): RankedArtist[] {
  const tieBreaker = options.tieBreaker ?? defaultTieBreaker;

  const decorated = chart.entries.map((history) => ({
    history,
    score: rule.score(history),
  }));

  decorated.sort((a, b) => {
    const scoreDelta = b.score - a.score;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return tieBreaker(a.history, b.history);
  });

  let currentRank = 0;
  let lastScore: number | undefined;

  return decorated.map(({ history, score }) => {
    if (lastScore === undefined || score !== lastScore) {
      currentRank += 1;
      lastScore = score;
    }

    return {
      rank: currentRank,
      score,
      history,
    } satisfies RankedArtist;
  });
}

export const currentListensRule: RankingRule = {
  id: 'current-listens',
  label: 'Current week total listens',
  description: 'Orders artists by the total listens recorded for the most recent week.',
  score(history) {
    return history.currentWeek.totalListens.value;
  },
};

export const weekOverWeekGrowthRule: RankingRule = {
  id: 'week-over-week-growth',
  label: 'Week over week growth',
  description: 'Orders artists by the change in listens compared to the previous week.',
  score(history) {
    const growth = history.growthSincePreviousWeek();
    return growth ?? Number.NEGATIVE_INFINITY;
  },
};
