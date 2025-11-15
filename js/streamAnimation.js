/**
 * Utility functions for animating stream counts based on elapsed time
 * since data collection.
 *
 * The animation shows values growing from 0 (at 12:01am on collection date)
 * to the actual value over the course of one week (604800 seconds).
 */

const SECONDS_IN_WEEK = 604800; // 7 * 24 * 60 * 60

/**
 * Calculates the base date/time for animation (12:01am on the data collection date)
 * @param {string} timestamp - ISO timestamp from data (e.g., "2025-10-24T05:05:20.881Z")
 * @returns {Date} - Date object set to 12:01am on the collection date (in local timezone)
 */
export function getAnimationStartTime(timestamp) {
  const date = new Date(timestamp);
  // Get the year, month, and day in local timezone
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  // Create a new date at 12:01am local time on that day
  return new Date(year, month, day, 0, 1, 0, 0);
}

/**
 * Calculates the current animated value based on elapsed time
 * @param {number} actualValue - The actual/final stream count value
 * @param {Date} startTime - The animation start time (12:01am on collection date)
 * @returns {number} - The current animated value to display
 */
export function getAnimatedValue(actualValue, startTime) {
  const now = new Date();
  const elapsedMs = now - startTime;
  const elapsedSeconds = Math.max(0, elapsedMs / 1000);

  // If we're before the start time, show 0
  if (elapsedSeconds <= 0) {
    return 0;
  }

  // If we've passed the week mark, show full value
  if (elapsedSeconds >= SECONDS_IN_WEEK) {
    return actualValue;
  }

  // Calculate the proportional value
  const ratio = elapsedSeconds / SECONDS_IN_WEEK;
  return Math.floor(actualValue * ratio);
}

/**
 * Creates an animation controller that updates a callback every second
 * @param {Function} updateCallback - Function to call with new values each second
 * @returns {Object} - Controller with start() and stop() methods
 */
export function createAnimationController(updateCallback) {
  let intervalId = null;

  return {
    start() {
      if (intervalId) return; // Already running

      // Update immediately
      updateCallback();

      // Then update every 5 seconds
      intervalId = setInterval(updateCallback, 5000);
    },

    stop() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },

    isRunning() {
      return intervalId !== null;
    }
  };
}
