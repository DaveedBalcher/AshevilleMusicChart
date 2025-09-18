import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateGrowthBetween, currentGrowth } from '../dist/index.js';
import { createWeeklyStatForIndex, createArtistHistory } from './helpers.js';

test('derives absolute and percentage change between weekly stats', () => {
  const previous = createWeeklyStatForIndex(0, 1000);
  const current = createWeeklyStatForIndex(1, 1500, 500);

  const snapshot = calculateGrowthBetween(current, previous);

  assert.equal(snapshot.absoluteChange, 500);
  assert.equal(snapshot.percentageChange, 50);
  assert.equal(snapshot.previous.totalListens.value, 1000);
  assert.equal(snapshot.current.totalListens.value, 1500);
});

test('omits percentage change when the previous week had no listens', () => {
  const previous = createWeeklyStatForIndex(0, 0);
  const current = createWeeklyStatForIndex(1, 200, 200);

  const snapshot = calculateGrowthBetween(current, previous);

  assert.equal(snapshot.absoluteChange, 200);
  assert.equal(snapshot.percentageChange, null);
});

test('returns null growth values for artists without a prior week', () => {
  const history = createArtistHistory({
    id: 'artist-new',
    name: 'New Arrival',
    totals: [700],
  });

  const snapshot = currentGrowth(history);

  assert.equal(snapshot.previous, undefined);
  assert.equal(snapshot.absoluteChange, null);
  assert.equal(snapshot.percentageChange, null);
});
