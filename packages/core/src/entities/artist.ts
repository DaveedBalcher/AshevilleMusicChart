export interface ArtistProps {
  id: string;
  name: string;
  imageUrl?: string;
  highLevelGenre?: string | null;
  specificGenre?: string | null;
  spotifyUrl?: string | null;
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} cannot be empty.`);
  }
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export class Artist {
  readonly id: string;
  readonly name: string;
  readonly imageUrl?: string;
  readonly highLevelGenre?: string;
  readonly specificGenre?: string;
  readonly spotifyUrl?: string;

  constructor(props: ArtistProps) {
    assertNonEmpty(props.id, 'Artist id');
    assertNonEmpty(props.name, 'Artist name');

    this.id = props.id;
    this.name = props.name;

    if (props.imageUrl) {
      if (!isValidUrl(props.imageUrl)) {
        throw new Error('Artist image URL must be a valid URL.');
      }
      this.imageUrl = props.imageUrl;
    }

    if (props.spotifyUrl) {
      if (!isValidUrl(props.spotifyUrl)) {
        throw new Error('Spotify URL must be a valid URL.');
      }
      this.spotifyUrl = props.spotifyUrl;
    }

    if (props.highLevelGenre) {
      this.highLevelGenre = props.highLevelGenre;
    }

    if (props.specificGenre) {
      this.specificGenre = props.specificGenre;
    }
  }

  matchesGenre(genre: string): boolean {
    const target = genre.trim().toLowerCase();
    const highLevelMatch = this.highLevelGenre
      ? this.highLevelGenre.toLowerCase() === target
      : false;
    const specificMatch = this.specificGenre
      ? this.specificGenre.toLowerCase() === target
      : false;

    return highLevelMatch || specificMatch;
  }
}
