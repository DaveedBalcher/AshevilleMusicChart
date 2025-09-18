import type { Chart } from '@asheville-music-chart/core';

import type { ChartDTO } from '../dtos';
import { toArtistHistoryDTO } from './artist-history';

export function toChartDTO(chart: Chart): ChartDTO {
  return {
    generatedAt: chart.generatedAt.toISOString(),
    entries: chart.entries.map((entry) => toArtistHistoryDTO(entry)),
  };
}
