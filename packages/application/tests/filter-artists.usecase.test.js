import test from 'node:test';
import assert from 'node:assert/strict';

import { FilterArtistsUseCase } from '../dist/index.js';
import { createChart, createArtistHistory } from '../../core/tests/helpers.js';

class StubChartRepository {
  constructor(chart) {
    this.chart = chart;
  }

  async loadLatest() {
    return this.chart;
  }
}

test('filters chart entries and reports match counts for the genre filter scenario', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-indie', name: 'Indigo Ridge', totals: [900, 1300], highLevelGenre: 'Indie' }),
    createArtistHistory({ id: 'artist-rock', name: 'Beacon Bloom', totals: [1200, 1600], highLevelGenre: 'Rock' }),
    createArtistHistory({ id: 'artist-pop', name: 'City Lights', totals: [1400, 1900], highLevelGenre: 'Pop', specificGenre: 'Indie Pop' }),
  ];
  const chart = createChart(histories);
  const charts = new StubChartRepository(chart);
  const useCase = new FilterArtistsUseCase(charts);

  const response = await useCase.execute({ criteria: { genres: ['indie', 'indie pop'], minimumCurrentListens: 1500 } });

  assert.equal(response.totalAvailable, 3);
  assert.equal(response.totalMatched, 1);
  assert.equal(response.entries.length, 1);
  assert.equal(response.entries[0].artist.id, 'artist-pop');
  assert.equal(response.entries[0].artist.highLevelGenre, 'Pop');
});

test('returns the full chart when no filter criteria are provided', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-indie', name: 'Indigo Ridge', totals: [900, 1300], highLevelGenre: 'Indie' }),
    createArtistHistory({ id: 'artist-rock', name: 'Beacon Bloom', totals: [1200, 1600], highLevelGenre: 'Rock' }),
  ];
  const chart = createChart(histories);
  const charts = new StubChartRepository(chart);
  const useCase = new FilterArtistsUseCase(charts);

  const response = await useCase.execute();

  assert.equal(response.totalAvailable, 2);
  assert.equal(response.totalMatched, 2);
  assert.equal(response.entries.length, 2);
});
