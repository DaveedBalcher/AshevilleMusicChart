import test from 'node:test';
import assert from 'node:assert/strict';

import { GetCurrentChartUseCase } from '../dist/index.js';
import { createChart, createArtistHistory } from '../../core/tests/helpers.js';

class StubChartRepository {
  constructor(chart) {
    this.chart = chart;
    this.loadCalls = 0;
  }

  async loadLatest() {
    this.loadCalls += 1;
    return this.chart;
  }
}

test('returns the latest chart projection with artist counts for the landing page', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-a', name: 'Atlas Echo', totals: [1000, 1400] }),
    createArtistHistory({ id: 'artist-b', name: 'Beacon Bloom', totals: [900, 1200] }),
  ];
  const chart = createChart(histories, '2024-07-08T12:00:00.000Z');
  const charts = new StubChartRepository(chart);
  const useCase = new GetCurrentChartUseCase(charts);

  const response = await useCase.execute();

  assert.equal(charts.loadCalls, 1);
  assert.equal(response.artistCount, 2);
  assert.equal(response.chart.generatedAt, '2024-07-08T12:00:00.000Z');
  assert.equal(response.chart.entries.length, 2);
  assert.equal(response.chart.entries[0].artist.id, 'artist-a');
  assert.equal(response.chart.entries[1].artist.id, 'artist-b');
});
