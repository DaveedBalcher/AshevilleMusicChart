export interface ArtistDTO {
  readonly id: string;
  readonly name: string;
  readonly imageUrl?: string;
  readonly highLevelGenre?: string;
  readonly specificGenre?: string;
  readonly spotifyUrl?: string;
}
