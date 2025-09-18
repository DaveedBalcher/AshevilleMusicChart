# @asheville-music-chart/core

The core package defines the **pure domain model** for the Asheville Music Chart. It is
framework-agnostic so that the web UI, automation tooling, and future services can share the
same behaviors.

## Contents

- **Value objects** like `ListenCount` and `DateRange` encapsulate invariants around numeric plays
  and reporting windows.
- **Entities** for `Artist`, `WeeklyStat`, `ArtistHistory`, and `Chart` describe the data contracts
  exchanged between layers and validate their inputs up front.
- **Domain services** implement reusable policies for ranking artists, calculating growth, and
  applying filter criteria without relying on presentation or infrastructure concerns.

Because this package has no runtime dependencies, the domain can be exercised in any environment
(including tests) without provisioning the DOM, filesystem, or network.
