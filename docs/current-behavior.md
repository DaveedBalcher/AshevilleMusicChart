# Current Front-End and Data Pipeline Behavior

## Browser Boot Sequence
- `index.html` bootstraps the page by loading the static header/menu scripts and the ES module entry point that wires up chart rendering once `DOMContentLoaded` fires.【F:index.html†L30-L55】
- On load, the page renders the support/recommend/feedback menu via `renderMainMenu` and the logo/header via `renderMainHeader` before attempting to load chart data.【F:index.html†L39-L47】【F:js/mainMenu.js†L5-L46】【F:js/mainHeader.js†L5-L21】
- The module fetches chart data through `loadChartData()`, normalizes the payload to an array, and delegates to `renderChart` with optional week-range display hints.【F:index.html†L42-L49】

## Data Contracts and Loading Rules
- Each chart dataset is a JSON object with a `timestamp` and `data` array; every artist entry contains an `artist` metadata object and a `weeks` collection with Spotify listen totals and optional week-over-week deltas.【F:archive/data_2025-06-13T12-47-06-325Z.js†L1-L47】
- The root `data.js` file mirrors this structure and may be empty when no chart has been published yet.【F:data.js†L1-L4】
- `loadChartData()` first returns the root dataset when it has non-empty `data`, otherwise it lazily iterates over the generated archive manifest and dynamically imports the first dataset that includes rows, deriving the display week start/end dates from the selected timestamp.【F:js/dataLoader.js†L4-L54】【F:archive/manifest.js†L1-L23】

## Chart Rendering Responsibilities
- `renderChart` owns the sticky header tabs (`Top`, `Hottest`, `Shows`), the tab-specific description block, the inline alert mount point, and the cell container wrapper appended beneath the sticky header region.【F:js/chart.js†L9-L47】
- The function computes a fallback display range by examining the most recent artist week when the loader does not supply `displayWeekStart`/`displayWeekEnd`, and formats the range using shared date helpers.【F:js/chart.js†L52-L77】
- Tab descriptions depend on whether data exists, with the info icon toggling the inline alert when present; without data, both the `Top` and `Hottest` descriptions show a missing-data message while `Shows` always renders a stub copy for the current month.【F:js/chart.js†L79-L117】
- Artist records are copied, sorted by latest-week listens, and wrapped with an `index` and a `getChangeIndicator` helper that produces up/down HTML based on the two most recent weeks.【F:js/chart.js†L127-L152】
- The `renderEmptyState` helper swaps the cells container contents with a message when the filter result is empty or data is unavailable.【F:js/chart.js†L119-L125】

## Filtering & Alert Interaction Contracts
- A `FilterController` instance coordinates a `FilterService`, floating `FilterButton`, and dynamically created `FilterMenu`. Initialization registers the source dataset, renders the mobile-only filter button, and immediately pushes the unfiltered results back to the chart renderer.【F:js/chart.js†L155-L175】【F:js/filterController.js†L7-L36】
- Selecting a genre applies the filter inside `FilterService`, updates button state (text + active class), and re-renders the artist cells; clearing filters resets to the full list.【F:js/filterController.js†L89-L112】【F:js/filterService.js†L13-L68】【F:js/filterButton.js†L5-L40】
- The controller listens for window resize to remove the floating button and close the overlay on desktop widths, and to recreate it when shrinking back to mobile.【F:js/filterController.js†L114-L129】 The menu overlay renders as a dialog, wires click handlers for option selection/close, and attaches `Escape` handling for dismissal.【F:js/filterMenu.js†L14-L86】
- `InlineAlert` renders descriptive copy with an expandable “How it works” section, tracks its own visibility, and exposes `show`/`hide`/`destroy` while clearing the info-icon active state when dismissed.【F:js/inlineAlert.js†L5-L112】 `renderChart` auto-opens the alert shortly after mount and toggles it whenever the info icon is activated.【F:js/chart.js†L177-L201】

## Artist Cell Rendering & Mobile Behaviors
- `renderArtistCells` determines the highest week-over-week improvement rate, instantiates an `ArtistCell` per artist, and adds a fire emoji plus `highest-improver` class to the leader.【F:js/artistCells.js†L1-L58】
- Each cell prints the ordinal rank, artist metadata, Spotify link, formatted listen total, and change indicator (with `NEW!` badge for one-week histories).【F:js/artistCells.js†L39-L100】
- A mobile-only `setupJumpingSpotifyOnScroll` hook highlights the Spotify button for the card closest to one-third viewport height, fading out previous highlights, and is exposed globally for `renderChart` to call after rendering.【F:js/artistCells.js†L103-L151】【F:js/chart.js†L269-L273】

## Tab Switching & Lifecycle Hooks
- Switching tabs adjusts the active class, injects the appropriate description markup, and either renders sorted artists for `Top`/`Hottest` or shows a placeholder banner for the upcoming `Shows` tab while hiding the inline alert.【F:js/chart.js†L230-L260】
- The chart registers global resize and `beforeunload` listeners to refresh filter UI state and to clean up filter/alert instances when navigating away.【F:js/chart.js†L263-L282】

## Legacy Script Entry Point
- The historical `script.js` still ships a `DOMContentLoaded` handler that sorts the global `data.data` array, instantiates a DOM-only `ArtistChart`, and renders basic cells without tabs, filters, or alerts. The class assumes each artist object has a `weeks` array with at least one entry and uses the last two weeks to build the change indicator.【F:script.js†L1-L70】

## Ancillary UI Modules
- `renderMainMenu` inserts three CTA links (Support Asheville, Recommend Artist, Give Feedback) into the sticky header, while `renderMainHeader` outputs the logo and subtitle hero block; both expose themselves via `window` for the entry module to call.【F:js/mainMenu.js†L5-L46】【F:js/mainHeader.js†L5-L21】
- Date formatting helpers provide presentation-friendly strings for the chart header, showing the start date with a month/day suffix and the end date condensed unless the week spans multiple months.【F:js/dateFormatting.js†L1-L25】

## Data Update Pipeline (Soundcharts)
- `scripts/updateData.js` loads environment variables for the Soundcharts API credentials, reads `scripts/artists.json`, and builds two contiguous 7-day ranges covering weeks -16 to -9 and -8 to -1 relative to execution.【F:scripts/updateData.js†L8-L56】
- For each artist, it requests Spotify listening data over the combined range, validates the response structure, and reduces the daily points into totals for each tracked week while calculating week-over-week change metadata.【F:scripts/updateData.js†L87-L171】
- After processing all artists, the script timestamps the aggregate payload, archives the previous `data.js` snapshot with an ISO-stamped filename, writes the new dataset, and regenerates `archive/manifest.js` by listing archive files in reverse chronological order.【F:scripts/updateData.js†L173-L218】

