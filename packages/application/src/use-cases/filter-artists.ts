import { filterArtists, type FilterCriteria } from '@asheville-music-chart/core';

import type { ArtistHistoryDTO } from '../dtos';
import { toArtistHistoryDTO } from '../mappers';
import type { ChartReadRepository } from '../ports';

export interface FilterArtistsRequest {
  readonly criteria?: FilterCriteria;
}

export interface FilterArtistsResponse {
  readonly entries: readonly ArtistHistoryDTO[];
  readonly totalMatched: number;
  readonly totalAvailable: number;
}

export class FilterArtistsUseCase {
  constructor(private readonly charts: ChartReadRepository) {}

  async execute({ criteria }: FilterArtistsRequest = {}): Promise<FilterArtistsResponse> {
    const chart = await this.charts.loadLatest();
    const filtered = filterArtists(chart.entries, criteria);

    return {
      entries: filtered.map((history) => toArtistHistoryDTO(history)),
      totalMatched: filtered.length,
      totalAvailable: chart.size,
    } satisfies FilterArtistsResponse;
  }
}
