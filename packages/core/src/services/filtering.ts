import { ArtistHistory } from '../entities/artist-history';

export interface FilterCriteria {
  readonly genres?: readonly string[];
  readonly searchTerm?: string;
  readonly minimumCurrentListens?: number;
}

function matchesGenres(history: ArtistHistory, genres?: readonly string[]): boolean {
  if (!genres || genres.length === 0) {
    return true;
  }

  const normalized = genres.map((genre) => genre.trim().toLowerCase()).filter(Boolean);

  if (normalized.length === 0) {
    return true;
  }

  return normalized.some((genre) => history.artist.matchesGenre(genre));
}

function matchesSearch(history: ArtistHistory, term?: string): boolean {
  if (!term) {
    return true;
  }

  const normalized = term.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return history.artist.name.toLowerCase().includes(normalized);
}

function matchesMinimumListens(history: ArtistHistory, minimum?: number): boolean {
  if (minimum == null) {
    return true;
  }

  if (!Number.isFinite(minimum)) {
    throw new TypeError('Minimum listens filter must be a finite number.');
  }

  return history.currentWeek.totalListens.value >= minimum;
}

export function filterArtists(
  entries: Iterable<ArtistHistory>,
  criteria: FilterCriteria = {},
): ArtistHistory[] {
  const filtered: ArtistHistory[] = [];

  for (const history of entries) {
    if (
      matchesGenres(history, criteria.genres) &&
      matchesSearch(history, criteria.searchTerm) &&
      matchesMinimumListens(history, criteria.minimumCurrentListens)
    ) {
      filtered.push(history);
    }
  }

  return filtered;
}
