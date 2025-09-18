import {
  Artist,
  ArtistHistory,
  Chart,
  WeeklyStat,
} from '../dist/index.js';

const BASE_DATE = new Date('2024-06-03T00:00:00.000Z');

function isoDateFromBase(offsetDays) {
  const date = new Date(BASE_DATE);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function createWeeklyStatForIndex(index, totalListens, listensDifference) {
  const props = {
    weekStartDate: isoDateFromBase(index * 7),
    weekEndDate: isoDateFromBase(index * 7 + 6),
    totalListens,
  };

  if (listensDifference !== undefined) {
    props.listensDifference = listensDifference;
  }

  return new WeeklyStat(props);
}

export function createArtistHistory({
  id,
  name,
  totals,
  highLevelGenre,
  specificGenre,
  imageUrl,
  spotifyUrl,
}) {
  const artist = new Artist({
    id,
    name,
    highLevelGenre,
    specificGenre,
    imageUrl,
    spotifyUrl: spotifyUrl ?? `https://example.com/${id}`,
  });

  const weeks = totals.map((total, index, arr) => {
    const previous = index > 0 ? arr[index - 1] : undefined;
    const difference = previous !== undefined ? total - previous : undefined;
    return createWeeklyStatForIndex(index, total, difference);
  });

  return new ArtistHistory(artist, weeks);
}

export function createChart(histories, generatedAt = '2024-07-01T00:00:00.000Z') {
  return new Chart({
    generatedAt,
    entries: histories,
  });
}
