import { applyRanking, currentGrowth, weekOverWeekGrowthRule } from '@asheville-music-chart/core';

import type { GrowthLeaderboardEntryDTO } from '../dtos';
import { toArtistHistoryDTO, toGrowthSnapshotDTO } from '../mappers';
import type { ChartReadRepository } from '../ports';

export interface ListGrowthLeadersRequest {
  readonly limit?: number;
}

export interface ListGrowthLeadersResponse {
  readonly leaders: readonly GrowthLeaderboardEntryDTO[];
}

export class ListGrowthLeadersUseCase {
  constructor(private readonly charts: ChartReadRepository) {}

  async execute({ limit }: ListGrowthLeadersRequest = {}): Promise<ListGrowthLeadersResponse> {
    const chart = await this.charts.loadLatest();
    const ranked = applyRanking(chart, weekOverWeekGrowthRule).filter((entry) => Number.isFinite(entry.score));

    const leaders = (typeof limit === 'number' && limit >= 0)
      ? ranked.slice(0, limit)
      : ranked;

    return {
      leaders: leaders.map((entry) => ({
        rank: entry.rank,
        history: toArtistHistoryDTO(entry.history),
        growth: toGrowthSnapshotDTO(currentGrowth(entry.history)),
      })),
    } satisfies ListGrowthLeadersResponse;
  }
}
