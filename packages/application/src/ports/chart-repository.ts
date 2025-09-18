import type { Chart } from '@asheville-music-chart/core';

export interface ChartReadRepository {
  loadLatest(): Promise<Chart>;
}

export interface ChartWriteRepository {
  save(chart: Chart): Promise<void>;
}

export type ChartRepository = ChartReadRepository & ChartWriteRepository;
