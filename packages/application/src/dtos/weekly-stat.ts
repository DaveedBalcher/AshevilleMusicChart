export interface WeeklyStatDTO {
  readonly weekStartDate: string;
  readonly weekEndDate: string;
  readonly totalListens: number;
  readonly listensDifference?: number;
}
