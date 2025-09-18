import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyRanking,
  currentListensRule,
  weekOverWeekGrowthRule,
} from '../dist/index.js';
import { createArtistHistory, createChart } from './helpers.js';

test('orders artists by current week listens for the Top tab scenario', () => {
  const historyA = createArtistHistory({
    id: 'artist-a',
    name: 'Artemis Aria',
    totals: [1200, 1500],
  });
  const historyB = createArtistHistory({
    id: 'artist-b',
    name: 'Beacon Bloom',
    totals: [1500, 2100],
  });
  const historyC = createArtistHistory({
    id: 'artist-c',
    name: 'Crimson Choir',
    totals: [1800, 1800],
  });

  const chart = createChart([historyA, historyB, historyC]);

  const ranked = applyRanking(chart, currentListensRule);

  assert.equal(ranked[0].history.artist.id, 'artist-b');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].history.artist.id, 'artist-c');
  assert.equal(ranked[1].rank, 2);
  assert.equal(ranked[2].history.artist.id, 'artist-a');
  assert.equal(ranked[2].rank, 3);
});

test('uses alphabetical tie-breakers when current listens are equal', () => {
  const historyA = createArtistHistory({
    id: 'artist-a',
    name: 'Atlas Echo',
    totals: [1200, 1700],
  });
  const historyB = createArtistHistory({
    id: 'artist-b',
    name: 'Basilisk',
    totals: [1200, 1700],
  });

  const chart = createChart([historyB, historyA]);
  const ranked = applyRanking(chart, currentListensRule);

  assert.equal(ranked[0].history.artist.name, 'Atlas Echo');
  assert.equal(ranked[0].rank, 1);
  assert.equal(ranked[1].history.artist.name, 'Basilisk');
  assert.equal(ranked[1].rank, 1);
});

test('prioritizes artists with positive week-over-week growth for the Hottest tab', () => {
  const surging = createArtistHistory({
    id: 'artist-hot',
    name: 'Fireline',
    totals: [800, 1600],
  });
  const steady = createArtistHistory({
    id: 'artist-steady',
    name: 'Glowstate',
    totals: [1500, 1500],
  });
  const newcomer = createArtistHistory({
    id: 'artist-new',
    name: 'Harmonic Horizon',
    totals: [900],
  });

  const chart = createChart([steady, newcomer, surging]);
  const ranked = applyRanking(chart, weekOverWeekGrowthRule);

  assert.equal(ranked[0].history.artist.id, 'artist-hot');
  assert.equal(ranked[0].score, 800);
  assert.equal(ranked[1].history.artist.id, 'artist-steady');
  assert.equal(ranked[1].score, 0);
  assert.equal(ranked[2].history.artist.id, 'artist-new');
  assert.equal(ranked[2].score, Number.NEGATIVE_INFINITY);
});
