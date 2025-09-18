export interface ArtistEventDTO {
  readonly id?: string;
  readonly artistId: string;
  readonly name: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly venue?: string;
  readonly city?: string;
  readonly country?: string;
  readonly url?: string;
  readonly source?: string;
}
