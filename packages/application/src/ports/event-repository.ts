import type { ArtistEventDTO } from '../dtos';

export interface UpcomingEventsQuery {
  readonly limit?: number;
  readonly startDate?: Date;
  readonly endDate?: Date;
}

export interface EventRepository {
  listUpcomingEvents(artistId: string, query?: UpcomingEventsQuery): Promise<readonly ArtistEventDTO[]>;
}
