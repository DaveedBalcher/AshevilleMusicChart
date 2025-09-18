import test from 'node:test';
import assert from 'node:assert/strict';

import { ListGrowthLeadersUseCase } from '../dist/index.js';
import { createChart, createArtistHistory } from '../../core/tests/helpers.js';

class StubChartRepository {
  constructor(chart) {
    this.chart = chart;
  }

  async loadLatest() {
    return this.chart;
  }
}

test('returns the strongest week-over-week growth leaders for the Hottest tab', async () => {
  const histories = [
    createArtistHistory({ id: 'artist-surge', name: 'Fireline', totals: [800, 1600] }),
    createArtistHistory({ id: 'artist-steady', name: 'Glowstate', totals: [1200, 1200] }),
    createArtistHistory({ id: 'artist-rise', name: 'Harmonic Horizon', totals: [600, 900] }),
  ];
  const chart = createChart(histories);
  const charts = new StubChartRepository(chart);
  const useCase = new ListGrowthLeadersUseCase(charts);

  const response = await useCase.execute({ limit: 2 });

  assert.equal(response.leaders.length, 2);
  assert.equal(response.leaders[0].history.artist.id, 'artist-surge');
  assert.equal(response.leaders[0].growth.absoluteChange, 800);
  assert.equal(response.leaders[0].growth.percentageChange, 100);
  assert.equal(response.leaders[1].history.artist.id, 'artist-rise');
  assert.equal(response.leaders[1].growth.absoluteChange, 300);
  assert.equal(response.leaders[1].rank, 2);
});
