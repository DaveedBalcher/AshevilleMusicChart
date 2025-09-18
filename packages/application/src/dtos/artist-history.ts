import type { ArtistDTO } from './artist';
import type { GrowthSnapshotDTO } from './growth';
import type { WeeklyStatDTO } from './weekly-stat';

export interface ArtistHistoryDTO {
  readonly artist: ArtistDTO;
  readonly weeks: readonly WeeklyStatDTO[];
  readonly currentWeek: WeeklyStatDTO;
  readonly previousWeek?: WeeklyStatDTO;
  readonly growth: GrowthSnapshotDTO;
}
