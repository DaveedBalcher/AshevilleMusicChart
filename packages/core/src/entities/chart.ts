import { ArtistHistory } from './artist-history';

export interface ChartProps {
  generatedAt: Date | string;
  entries: Iterable<ArtistHistory>;
}

function toDate(value: Date | string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError('Chart timestamp must be a valid date.');
    }
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError('Chart timestamp must be a valid ISO date string.');
  }
  return parsed;
}

export class Chart {
  readonly generatedAt: Date;
  private readonly entryList: ArtistHistory[];
  private readonly entryIndex: Map<string, ArtistHistory>;

  constructor({ generatedAt, entries }: ChartProps) {
    this.generatedAt = toDate(generatedAt);
    this.entryList = Array.from(entries);

    const index = new Map<string, ArtistHistory>();

    for (const history of this.entryList) {
      const artistId = history.artist.id;
      if (index.has(artistId)) {
        throw new Error(`Duplicate artist detected in chart: ${artistId}`);
      }
      index.set(artistId, history);
    }

    this.entryIndex = index;
  }

  get entries(): readonly ArtistHistory[] {
    return this.entryList;
  }

  findByArtistId(id: string): ArtistHistory | undefined {
    return this.entryIndex.get(id);
  }

  get size(): number {
    return this.entryList.length;
  }
}
