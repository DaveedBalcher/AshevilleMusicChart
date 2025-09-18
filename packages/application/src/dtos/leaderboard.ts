import type { ArtistHistoryDTO } from './artist-history';
import type { GrowthSnapshotDTO } from './growth';

export interface RankedArtistDTO {
  readonly rank: number;
  readonly score: number;
  readonly history: ArtistHistoryDTO;
}

export interface GrowthLeaderboardEntryDTO {
  readonly rank: number;
  readonly history: ArtistHistoryDTO;
  readonly growth: GrowthSnapshotDTO;
}
