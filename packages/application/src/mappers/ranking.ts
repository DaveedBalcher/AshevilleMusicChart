import type { RankedArtist } from '@asheville-music-chart/core';

import type { RankedArtistDTO } from '../dtos';
import { toArtistHistoryDTO } from './artist-history';

export function toRankedArtistDTO(entry: RankedArtist): RankedArtistDTO {
  return {
    rank: entry.rank,
    score: entry.score,
    history: toArtistHistoryDTO(entry.history),
  };
}
