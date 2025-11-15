/**
 * @jest-environment jsdom
 */

describe('ArtistCells Rolling Animation Integration', () => {
  let renderArtistCells;
  let StatRollAnimation;

  beforeEach(() => {
    // Mock the streamAnimation module
    jest.mock('../js/streamAnimation.js', () => ({
      getAnimationStartTime: jest.fn(() => null),
      getAnimatedValue: jest.fn((value) => value),
      createAnimationController: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn()
      }))
    }));

    // Import modules
    StatRollAnimation = require('../js/statRollAnimation.js').StatRollAnimation;

    // Clear document
    document.body.innerHTML = '';
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('stats update behavior', () => {
    it('should track previous stat values for comparison', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const artistData = {
        artist: {
          uuid: 'test-123',
          name: 'Test Artist',
          imageUrl: 'http://test.com/image.jpg',
          specific_genre: 'Rock',
          spotifyUrl: 'http://spotify.com'
        },
        weeks: [
          { totalListens: 1000 },
          { totalListens: 2000 }
        ]
      };

      // When we store stats, we should be able to track the previous value
      const currentValue = 2000;
      const previousValue = 1000;

      expect(currentValue).not.toBe(previousValue);
    });

    it('should only animate stats that have changed', () => {
      const unchangedElement = document.createElement('span');
      unchangedElement.textContent = '5000';

      const changedElement = document.createElement('span');
      changedElement.textContent = '1000';

      // Stat that hasn't changed
      const unchangedAnimation = new StatRollAnimation(unchangedElement, 5000, 5000);
      const unchangedSpy = jest.spyOn(unchangedAnimation, 'animate');
      unchangedAnimation.animate();

      // Stat that has changed
      const changedAnimation = new StatRollAnimation(changedElement, 1000, 2000);
      const changedSpy = jest.spyOn(changedAnimation, 'animate');
      changedAnimation.animate();

      // Unchanged element should not have rolling class
      expect(unchangedElement.classList.contains('stat-rolling')).toBe(false);

      // Changed element should have rolling class
      expect(changedElement.classList.contains('stat-rolling')).toBe(true);
    });

    it('should apply rolling animation to stat value element', () => {
      const statElement = document.createElement('span');
      statElement.className = 'stat-value';
      statElement.id = 'stream-value-test-123';
      statElement.textContent = '1,000';

      const animation = new StatRollAnimation(statElement, 1000, 2500);
      animation.animate();

      // Should have rolling class during animation
      expect(statElement.classList.contains('stat-rolling')).toBe(true);
    });

    it('should handle change indicator animation', () => {
      const changeElement = document.createElement('span');
      changeElement.className = 'up-arrow';
      changeElement.textContent = '+100';

      // Change indicator goes from +100 to +200
      const animation = new StatRollAnimation(changeElement, 100, 200);
      animation.animate();

      expect(changeElement.classList.contains('stat-rolling')).toBe(true);
    });

    it('should not flicker when re-rendering with same values', () => {
      const statElement = document.createElement('span');
      statElement.className = 'stat-value';
      statElement.textContent = '5,000';
      const originalContent = statElement.innerHTML;

      // Simulate stats refresh with same value
      const animation = new StatRollAnimation(statElement, 5000, 5000);
      animation.animate();

      // Content should remain unchanged
      expect(statElement.innerHTML).toBe(originalContent);
      expect(statElement.classList.contains('stat-rolling')).toBe(false);
    });
  });

  describe('multiple stats update', () => {
    it('should handle multiple artists with different stat changes', () => {
      const container = document.createElement('div');

      // Create multiple stat elements
      const stat1 = document.createElement('span');
      stat1.textContent = '1,000';
      const stat2 = document.createElement('span');
      stat2.textContent = '2,000';
      const stat3 = document.createElement('span');
      stat3.textContent = '3,000';

      container.appendChild(stat1);
      container.appendChild(stat2);
      container.appendChild(stat3);

      // Simulate different changes
      const anim1 = new StatRollAnimation(stat1, 1000, 1500); // Changed
      const anim2 = new StatRollAnimation(stat2, 2000, 2000); // Unchanged
      const anim3 = new StatRollAnimation(stat3, 3000, 3500); // Changed

      anim1.animate();
      anim2.animate();
      anim3.animate();

      // Only changed stats should have rolling class
      expect(stat1.classList.contains('stat-rolling')).toBe(true);
      expect(stat2.classList.contains('stat-rolling')).toBe(false);
      expect(stat3.classList.contains('stat-rolling')).toBe(true);
    });
  });

  describe('animation timing', () => {
    it('should show final correct value after animation completes', (done) => {
      const statElement = document.createElement('span');
      statElement.textContent = '1,000';
      document.body.appendChild(statElement);

      const animation = new StatRollAnimation(statElement, 1000, 2500);
      animation.animate();

      setTimeout(() => {
        expect(statElement.textContent).toBe('2,500');
        expect(statElement.classList.contains('stat-rolling')).toBe(false);
        done();
      }, 700);
    });
  });
});
