import type { Chart } from '@asheville-music-chart/core';

export interface ArchivedChartSummary {
  readonly generatedAt: Date;
  readonly artistCount: number;
  readonly source?: string;
}

export interface ArchiveRepository {
  listSnapshots(): Promise<readonly ArchivedChartSummary[]>;
  loadSnapshot(generatedAt: Date): Promise<Chart | null>;
  saveSnapshot(chart: Chart): Promise<void>;
}
