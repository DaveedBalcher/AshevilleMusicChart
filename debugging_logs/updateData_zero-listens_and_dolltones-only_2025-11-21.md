# UpdateData zero-listens debugging (2025-11-21)

## What went wrong
- The 2025-11-21 UpdateData run (commit 4ed76ad) produced weekly listen totals of `0` for 27 of 28 artists; only The Dolltones retained non-zero numbers.
- The prior refresh (06eee55 on 2025-11-14) contained normal, populated totals for every artist, so the zeros appeared abruptly without code changes to the fetcher.

## Artist roster context
- UpdateData reads its roster from `scripts/artists.json`. Between the healthy 06eee55 run and the zero-heavy 4ed76ad run, the only code changes were adding new artists and editing bios; no fetch logic was modified.
- The expanded roster increases the number of API calls but does not alter how results are processed; new artists could naturally return zeros if their Soundcharts UUIDs lack data, but that would not explain legacy artists also dropping to zero.

## Why The Dolltones could be the only artist with data
- Each roster entry follows the same shape (uuid, name, imageUrl, genre fields, Spotify URL). The Dolltones entry is formatted like the others, so the roster itself does not privilege them.
- In `scripts/updateData.js`, each artist fetch is attempted in sequence. If a request fails (non-OK HTTP status or missing `items` array) the error is logged and that artist is skipped; only successful payloads are appended to the output.
- Therefore, seeing only The Dolltones in the output implies that their Soundcharts request succeeded while every other artist’s request failed or returned an unexpected shape. Likely causes include credentials scoped to a project that tracks only that UUID, or invalid/unauthorized UUIDs for the other artists.

## Follow-up debugging ideas
- Add logging around per-artist fetches to capture HTTP status codes, item counts, and min/max item dates so failures and empty responses are visible in build logs.
- Record the computed week boundaries and the number of items that fall into each window to confirm whether zeros stem from empty responses or date-misaligned data.
