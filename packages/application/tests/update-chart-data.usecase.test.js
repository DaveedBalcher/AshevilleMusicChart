import test from 'node:test';
import assert from 'node:assert/strict';

import { UpdateChartDataUseCase } from '../dist/index.js';
import { createChart, createArtistHistory } from '../../core/tests/helpers.js';

class InMemoryChartRepository {
  constructor(chart) {
    this.chart = chart;
    this.savedCharts = [];
  }

  async loadLatest() {
    return this.chart;
  }

  async save(chart) {
    this.savedCharts.push(chart);
  }
}

class InMemoryArchiveRepository {
  constructor() {
    this.saved = [];
  }

  async listSnapshots() {
    return [];
  }

  async loadSnapshot() {
    return null;
  }

  async saveSnapshot(chart) {
    this.saved.push(chart);
  }
}

class StubEventRepository {
  constructor(responses = {}) {
    this.responses = responses;
    this.calls = [];
  }

  async listUpcomingEvents(artistId, query) {
    this.calls.push({ artistId, query });
    return this.responses[artistId] ?? [];
  }
}

class StubImageService {
  constructor(responses = {}) {
    this.responses = responses;
    this.calls = [];
  }

  async findImageFor(artist) {
    this.calls.push(artist.id);
    return this.responses[artist.id] ?? null;
  }
}

test('saves enriched chart data, archives the snapshot, and returns DTO projections', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-a', name: 'Atlas Echo', totals: [1000, 1400] }),
    createArtistHistory({ id: 'artist-b', name: 'Beacon Bloom', totals: [1200, 1500], imageUrl: 'https://images.test/beacon.jpg' }),
  ];
  const chart = createChart(histories, '2024-07-08T12:00:00.000Z');

  const charts = new InMemoryChartRepository(chart);
  const archive = new InMemoryArchiveRepository();
  const events = new StubEventRepository({
    'artist-a': [
      {
        artistId: 'artist-a',
        name: 'Live at The Grey Eagle',
        startDate: '2024-07-20T20:00:00.000Z',
        venue: 'The Grey Eagle',
        city: 'Asheville',
      },
    ],
  });
  const images = new StubImageService({ 'artist-a': 'https://images.test/atlas.jpg' });

  const useCase = new UpdateChartDataUseCase(charts, charts, archive, events, images);
  const response = await useCase.execute({ eventQuery: { limit: 5 } });

  assert.equal(response.artistCount, 2);
  assert.equal(response.archived, true);
  assert.deepEqual(response.updatedImageUrls, { 'artist-a': 'https://images.test/atlas.jpg' });
  assert.deepEqual(Object.keys(response.eventsByArtist), ['artist-a']);
  assert.equal(response.eventsByArtist['artist-a'][0].venue, 'The Grey Eagle');
  assert.equal(response.chart.entries[0].artist.imageUrl, 'https://images.test/atlas.jpg');
  assert.equal(response.chart.entries[1].artist.imageUrl, 'https://images.test/beacon.jpg');

  assert.equal(charts.savedCharts.length, 1);
  assert.equal(archive.saved.length, 1);
  assert.equal(images.calls.length, 1);
  assert.equal(images.calls[0], 'artist-a');
  assert.equal(events.calls.length, 2);
  assert.equal(events.calls[0].artistId, 'artist-a');
  assert.equal(events.calls[0].query.limit, 5);
  assert.equal(events.calls[1].artistId, 'artist-b');
  assert.equal(events.calls[1].query.limit, 5);

  const savedChart = charts.savedCharts[0];
  assert.equal(savedChart.entries[0].artist.imageUrl, 'https://images.test/atlas.jpg');
  assert.equal(savedChart.entries[1].artist.imageUrl, 'https://images.test/beacon.jpg');
});

test('allows opt-out of enrichment steps when requested', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-a', name: 'Atlas Echo', totals: [1000, 1400] }),
  ];
  const chart = createChart(histories, '2024-07-08T12:00:00.000Z');

  const charts = new InMemoryChartRepository(chart);
  const archive = new InMemoryArchiveRepository();
  const events = new StubEventRepository({ 'artist-a': [{ artistId: 'artist-a', name: 'Pop-up Show', startDate: '2024-07-25T20:00:00.000Z' }] });
  const images = new StubImageService({ 'artist-a': 'https://images.test/atlas.jpg' });

  const useCase = new UpdateChartDataUseCase(charts, charts, archive, events, images);
  const response = await useCase.execute({ enrichArtistImages: false, includeEvents: false });

  assert.equal(images.calls.length, 0);
  assert.equal(events.calls.length, 0);
  assert.deepEqual(response.updatedImageUrls, {});
  assert.deepEqual(response.eventsByArtist, {});
  assert.equal(charts.savedCharts.length, 1);
  assert.strictEqual(charts.savedCharts[0], chart);
});
