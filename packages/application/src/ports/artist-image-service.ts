import type { Artist } from '@asheville-music-chart/core';

export interface ArtistImageService {
  findImageFor(artist: Artist): Promise<string | null>;
}
