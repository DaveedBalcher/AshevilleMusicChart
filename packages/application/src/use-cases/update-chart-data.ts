import { Artist, ArtistHistory, Chart } from '@asheville-music-chart/core';

import type { ArtistEventDTO, ChartDTO } from '../dtos';
import { toChartDTO } from '../mappers';
import type {
  ArchiveRepository,
  ArtistImageService,
  ChartReadRepository,
  ChartWriteRepository,
  EventRepository,
  UpcomingEventsQuery,
} from '../ports';

export interface UpdateChartDataRequest {
  readonly enrichArtistImages?: boolean;
  readonly includeEvents?: boolean;
  readonly eventQuery?: UpcomingEventsQuery;
}

export interface UpdateChartDataResponse {
  readonly chart: ChartDTO;
  readonly artistCount: number;
  readonly archived: boolean;
  readonly updatedImageUrls: Readonly<Record<string, string>>;
  readonly eventsByArtist: Readonly<Record<string, readonly ArtistEventDTO[]>>;
}

export class UpdateChartDataUseCase {
  constructor(
    private readonly source: ChartReadRepository,
    private readonly destination: ChartWriteRepository,
    private readonly archive: ArchiveRepository,
    private readonly events?: EventRepository,
    private readonly images?: ArtistImageService,
  ) {}

  async execute(request: UpdateChartDataRequest = {}): Promise<UpdateChartDataResponse> {
    const chart = await this.source.loadLatest();
    const updatedHistories: ArtistHistory[] = [];
    const updatedImageUrls = new Map<string, string>();
    const eventsByArtist = new Map<string, ArtistEventDTO[]>();

    const shouldEnrichImages = request.enrichArtistImages ?? true;
    const shouldIncludeEvents = (request.includeEvents ?? true) && Boolean(this.events);

    for (const history of chart.entries) {
      let artist = history.artist;

      if (shouldEnrichImages && this.images && !artist.imageUrl) {
        const resolvedUrl = await this.images.findImageFor(artist);
        if (resolvedUrl) {
          updatedImageUrls.set(artist.id, resolvedUrl);
          artist = new Artist({
            id: artist.id,
            name: artist.name,
            imageUrl: resolvedUrl,
            highLevelGenre: artist.highLevelGenre,
            specificGenre: artist.specificGenre,
            spotifyUrl: artist.spotifyUrl,
          });
        }
      }

      if (shouldIncludeEvents && this.events) {
        const artistEvents = await this.events.listUpcomingEvents(artist.id, request.eventQuery);
        if (artistEvents.length > 0) {
          eventsByArtist.set(artist.id, [...artistEvents]);
        }
      }

      if (artist !== history.artist) {
        updatedHistories.push(new ArtistHistory(artist, history.weeks));
      } else {
        updatedHistories.push(history);
      }
    }

    const finalChart = updatedImageUrls.size > 0
      ? new Chart({ generatedAt: chart.generatedAt, entries: updatedHistories })
      : chart;

    await this.destination.save(finalChart);
    await this.archive.saveSnapshot(finalChart);

    return {
      chart: toChartDTO(finalChart),
      artistCount: finalChart.size,
      archived: true,
      updatedImageUrls: Object.fromEntries(updatedImageUrls.entries()),
      eventsByArtist: Object.fromEntries(eventsByArtist.entries()),
    } satisfies UpdateChartDataResponse;
  }
}
