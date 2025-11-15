/**
 * StatsRefreshManager - Manages automatic stats refreshing at 5-second intervals
 */
class StatsRefreshManager {
  constructor(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callback = callback;
    this.intervalId = null;
    this.running = false;
  }

  /**
   * Start the 5-second refresh interval
   */
  start() {
    if (this.running) {
      return; // Already running, don't start another interval
    }

    this.intervalId = setInterval(() => {
      this.callback();
    }, 5000); // 5 seconds

    this.running = true;
  }

  /**
   * Stop the refresh interval
   */
  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  /**
   * Check if the manager is currently running
   */
  isRunning() {
    return this.running;
  }

  /**
   * Clean up and stop the interval
   */
  destroy() {
    this.stop();
  }
}

/**
 * Updates the chart by reloading data and re-rendering
 */
async function updateChart() {
  try {
    // Dynamically import to avoid circular dependencies
    const { loadChartData } = await import('./dataLoader.js');
    const { renderChart } = await import('./chart.js');

    const { dataset, displayWeekStart, displayWeekEnd, timestamp } = await loadChartData();
    const chartData = Array.isArray(dataset?.data) ? dataset.data : [];

    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      renderChart(chartContainer, chartData, { displayWeekStart, displayWeekEnd, timestamp });
    }
  } catch (error) {
    console.error('Failed to update chart:', error);
  }
}

// Export for CommonJS (Jest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StatsRefreshManager, updateChart };
}

// Export for ES modules (browser)
if (typeof window !== 'undefined') {
  window.StatsRefreshManager = StatsRefreshManager;
  window.updateChart = updateChart;
}
