import type { ChartReadRepository } from '../ports';
import type { ChartDTO } from '../dtos';
import { toChartDTO } from '../mappers';

export interface GetCurrentChartResponse {
  readonly chart: ChartDTO;
  readonly artistCount: number;
}

export class GetCurrentChartUseCase {
  constructor(private readonly charts: ChartReadRepository) {}

  async execute(): Promise<GetCurrentChartResponse> {
    const chart = await this.charts.loadLatest();

    return {
      chart: toChartDTO(chart),
      artistCount: chart.size,
    } satisfies GetCurrentChartResponse;
  }
}
