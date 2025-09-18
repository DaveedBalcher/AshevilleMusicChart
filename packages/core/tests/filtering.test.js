import test from 'node:test';
import assert from 'node:assert/strict';

import { filterArtists } from '../dist/index.js';
import { createArtistHistory } from './helpers.js';

test('filters artists by high-level and specific genre matches for the filter menu scenario', () => {
  const indie = createArtistHistory({
    id: 'artist-indie',
    name: 'Indigo Ridge',
    totals: [900, 1300],
    highLevelGenre: 'Indie',
  });
  const rock = createArtistHistory({
    id: 'artist-rock',
    name: 'Beacon Bloom',
    totals: [1200, 1600],
    highLevelGenre: 'Rock',
  });
  const indiePop = createArtistHistory({
    id: 'artist-pop',
    name: 'City Lights',
    totals: [1400, 1900],
    highLevelGenre: 'Pop',
    specificGenre: 'Indie Pop',
  });

  const result = filterArtists([indie, rock, indiePop], { genres: ['indie', 'indie pop'] });

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((history) => history.artist.id), ['artist-indie', 'artist-pop']);
});

test('filters artists by case-insensitive name search', () => {
  const indie = createArtistHistory({
    id: 'artist-indie',
    name: 'Indigo Ridge',
    totals: [900, 1300],
    highLevelGenre: 'Indie',
  });
  const rock = createArtistHistory({
    id: 'artist-rock',
    name: 'Beacon Bloom',
    totals: [1200, 1600],
    highLevelGenre: 'Rock',
  });

  const result = filterArtists([indie, rock], { searchTerm: 'BLOOM' });

  assert.equal(result.length, 1);
  assert.equal(result[0].artist.id, 'artist-rock');
});

test('enforces a minimum listens threshold when requested', () => {
  const indie = createArtistHistory({
    id: 'artist-indie',
    name: 'Indigo Ridge',
    totals: [900, 1300],
    highLevelGenre: 'Indie',
  });
  const rock = createArtistHistory({
    id: 'artist-rock',
    name: 'Beacon Bloom',
    totals: [1200, 1600],
    highLevelGenre: 'Rock',
  });
  const indiePop = createArtistHistory({
    id: 'artist-pop',
    name: 'City Lights',
    totals: [1400, 1900],
    highLevelGenre: 'Pop',
    specificGenre: 'Indie Pop',
  });

  const result = filterArtists([indie, rock, indiePop], { minimumCurrentListens: 1600 });

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((history) => history.artist.id), ['artist-rock', 'artist-pop']);
});
