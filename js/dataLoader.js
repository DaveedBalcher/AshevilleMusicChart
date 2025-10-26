import { data as rootData } from '../data.js';
import { archiveManifest } from '../archive/manifest.js';

function hasChartData(dataset) {
  return Boolean(dataset && Array.isArray(dataset.data) && dataset.data.length > 0);
}

function deriveWeekRangeFromTimestamp(timestamp) {
  if (!timestamp) return { start: null, end: null };
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return { start: null, end: null };
  }
  const start = parsed.toISOString().slice(0, 10);
  const endDate = new Date(parsed);
  endDate.setDate(endDate.getDate() + 7);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export async function loadChartData() {
  const rootTimestamp = rootData?.timestamp ?? null;
  const rootRange = deriveWeekRangeFromTimestamp(rootTimestamp);

  if (hasChartData(rootData)) {
    return {
      dataset: rootData,
      displayWeekStart: rootRange.start,
      displayWeekEnd: rootRange.end,
      timestamp: rootTimestamp,
    };
  }

  for (const entry of archiveManifest) {
    try {
      const module = await import(entry.importPath);
      const archiveData = module?.data;
      if (hasChartData(archiveData)) {
        const archiveTimestamp = rootTimestamp ?? archiveData.timestamp ?? null;
        const archiveRange = deriveWeekRangeFromTimestamp(archiveTimestamp);
        return {
          dataset: archiveData,
          displayWeekStart: archiveRange.start,
          displayWeekEnd: archiveRange.end,
          timestamp: archiveTimestamp,
        };
      }
    } catch (error) {
      console.error(`Failed to load archive dataset ${entry.filename}:`, error);
    }
  }

  return {
    dataset: rootData,
    displayWeekStart: rootRange.start,
    displayWeekEnd: rootRange.end,
    timestamp: rootTimestamp,
  };
}
