/**
 * @jest-environment jsdom
 */

describe('StatsRefreshManager', () => {
  let StatsRefreshManager;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
    // Import the module - will implement this in js/statsRefresh.js
    StatsRefreshManager = require('../js/statsRefresh.js').StatsRefreshManager;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a stats refresh manager with a callback', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      expect(manager).toBeDefined();
      expect(manager.isRunning()).toBe(false);
    });

    it('should throw error if callback is not a function', () => {
      expect(() => new StatsRefreshManager()).toThrow('Callback must be a function');
      expect(() => new StatsRefreshManager('not a function')).toThrow('Callback must be a function');
    });
  });

  describe('start', () => {
    it('should start interval with 5000ms delay', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();

      expect(manager.isRunning()).toBe(true);
      expect(setInterval).toHaveBeenCalledTimes(1);
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should not start multiple intervals if already running', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();
      manager.start();

      expect(setInterval).toHaveBeenCalledTimes(1);
    });

    it('should call callback after 5 seconds', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call callback multiple times at 5-second intervals', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();

      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('stop', () => {
    it('should stop the interval', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();
      expect(manager.isRunning()).toBe(true);

      manager.stop();
      expect(manager.isRunning()).toBe(false);
      expect(clearInterval).toHaveBeenCalledTimes(1);
    });

    it('should not call callback after stopping', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();
      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(1);

      manager.stop();
      jest.advanceTimersByTime(5000);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle stopping when not running', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      expect(() => manager.stop()).not.toThrow();
      expect(manager.isRunning()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should stop interval and clean up', () => {
      const callback = jest.fn();
      const manager = new StatsRefreshManager(callback);

      manager.start();
      manager.destroy();

      expect(manager.isRunning()).toBe(false);
      expect(clearInterval).toHaveBeenCalled();
    });
  });
});

describe('Stats Update Integration', () => {
  let updateChart;

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock the chart update function
    updateChart = require('../js/statsRefresh.js').updateChart;
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should export an updateChart function', () => {
    expect(updateChart).toBeDefined();
    expect(typeof updateChart).toBe('function');
  });
});
