import { currentGrowth, type GrowthSnapshot, type ArtistHistory, type Artist, type WeeklyStat } from '@asheville-music-chart/core';

import type {
  ArtistDTO,
  ArtistHistoryDTO,
  GrowthSnapshotDTO,
  WeeklyStatDTO,
} from '../dtos';

function toArtistDTO(artist: Artist): ArtistDTO {
  return {
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    highLevelGenre: artist.highLevelGenre,
    specificGenre: artist.specificGenre,
    spotifyUrl: artist.spotifyUrl,
  };
}

function toWeeklyStatDTO(stat: WeeklyStat): WeeklyStatDTO {
  return {
    weekStartDate: stat.period.start,
    weekEndDate: stat.period.end,
    totalListens: stat.totalListens.value,
    listensDifference: stat.listensDifference,
  };
}

function toGrowthSnapshotDTO(snapshot: GrowthSnapshot): GrowthSnapshotDTO {
  return {
    current: toWeeklyStatDTO(snapshot.current),
    previous: snapshot.previous ? toWeeklyStatDTO(snapshot.previous) : undefined,
    absoluteChange: snapshot.absoluteChange,
    percentageChange: snapshot.percentageChange,
  };
}

export function toArtistHistoryDTO(history: ArtistHistory): ArtistHistoryDTO {
  const growth = currentGrowth(history);
  const weeks = history.weeks.map((week) => toWeeklyStatDTO(week));

  return {
    artist: toArtistDTO(history.artist),
    weeks,
    currentWeek: toWeeklyStatDTO(history.currentWeek),
    previousWeek: history.previousWeek ? toWeeklyStatDTO(history.previousWeek) : undefined,
    growth: toGrowthSnapshotDTO(growth),
  };
}

export { toArtistDTO, toWeeklyStatDTO, toGrowthSnapshotDTO };
