import type { ArtistHistoryDTO } from './artist-history';

export interface ChartDTO {
  readonly generatedAt: string;
  readonly entries: readonly ArtistHistoryDTO[];
}
