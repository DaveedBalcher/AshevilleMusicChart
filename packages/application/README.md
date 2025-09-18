# @asheville-music-chart/application

This package coordinates application-level workflows for the Asheville Music Chart refactor. It
wraps the core domain models with use cases, DTOs, and boundary interfaces so presentation layers
and tooling can interact with the chart without touching persistence or external services
directly.

## Available surface area

### Ports
- `ChartReadRepository` / `ChartWriteRepository` describe how to load and persist the current chart
  snapshot.
- `ArchiveRepository` surfaces historical chart storage with discovery APIs.
- `EventRepository` provides upcoming show listings keyed by artist.
- `ArtistImageService` looks up display-ready imagery for artists missing artwork.

### Use cases
- `GetCurrentChartUseCase` returns the latest chart as serializable DTOs.
- `FilterArtistsUseCase` applies domain filtering policies before presenting data to the UI.
- `ListGrowthLeadersUseCase` exposes a ranked leaderboard driven by week-over-week momentum.
- `UpdateChartDataUseCase` orchestrates ingestion pipelines, image enrichment, and archive writes.

### DTOs and mappers
DTO helpers convert domain entities (`Chart`, `ArtistHistory`, `WeeklyStat`) into immutable data
contracts suitable for transport across the application boundary.
