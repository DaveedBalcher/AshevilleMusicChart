/**
 * @jest-environment jsdom
 */

describe('StatRollAnimation', () => {
  let StatRollAnimation;

  beforeEach(() => {
    // Import the module
    StatRollAnimation = require('../js/statRollAnimation.js').StatRollAnimation;

    // Clear any existing animations
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    it('should create a stat roll animation with element and values', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 1000, 2000);

      expect(animation).toBeDefined();
      expect(animation.element).toBe(element);
      expect(animation.oldValue).toBe(1000);
      expect(animation.newValue).toBe(2000);
    });

    it('should throw error if element is not provided', () => {
      expect(() => new StatRollAnimation(null, 1000, 2000)).toThrow('Element is required');
      expect(() => new StatRollAnimation(undefined, 1000, 2000)).toThrow('Element is required');
    });

    it('should handle zero values', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 0, 100);

      expect(animation.oldValue).toBe(0);
      expect(animation.newValue).toBe(100);
    });

    it('should handle negative values', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, -500, 100);

      expect(animation.oldValue).toBe(-500);
      expect(animation.newValue).toBe(100);
    });
  });

  describe('shouldAnimate', () => {
    it('should return true when values are different', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 1000, 2000);

      expect(animation.shouldAnimate()).toBe(true);
    });

    it('should return false when values are the same', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 1000, 1000);

      expect(animation.shouldAnimate()).toBe(false);
    });

    it('should return true for small differences', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 1000, 1001);

      expect(animation.shouldAnimate()).toBe(true);
    });

    it('should return true when going from positive to negative', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 100, -100);

      expect(animation.shouldAnimate()).toBe(true);
    });
  });

  describe('animate', () => {
    it('should not animate when values are the same', () => {
      const element = document.createElement('div');
      element.textContent = '1000';
      const animation = new StatRollAnimation(element, 1000, 1000);

      animation.animate();

      // Element should not have animation class
      expect(element.classList.contains('stat-rolling')).toBe(false);
      // Text should remain unchanged
      expect(element.textContent).toBe('1000');
    });

    it('should add rolling class when values are different', () => {
      const element = document.createElement('div');
      element.textContent = '1000';
      const animation = new StatRollAnimation(element, 1000, 2000);

      animation.animate();

      // Element should have animation class
      expect(element.classList.contains('stat-rolling')).toBe(true);
    });

    it('should update to final value after animation', (done) => {
      const element = document.createElement('div');
      element.textContent = '1000';
      const animation = new StatRollAnimation(element, 1000, 2000);

      animation.animate();

      // After animation completes (600ms), should show final value
      setTimeout(() => {
        expect(element.textContent).toBe('2,000');
        expect(element.classList.contains('stat-rolling')).toBe(false);
        done();
      }, 700);
    });

    it('should handle formatted numbers (with commas)', () => {
      const element = document.createElement('div');
      element.textContent = '1,000';
      const animation = new StatRollAnimation(element, 1000, 2500);

      animation.animate();

      expect(element.classList.contains('stat-rolling')).toBe(true);
    });

    it('should not flicker when value stays the same', () => {
      const element = document.createElement('div');
      element.textContent = '5000';
      document.body.appendChild(element);

      const animation = new StatRollAnimation(element, 5000, 5000);
      const originalContent = element.innerHTML;

      animation.animate();

      // Content should not change at all
      expect(element.innerHTML).toBe(originalContent);

      // No classes should be added
      expect(element.className).toBe('');
    });

    it('should handle multiple animations on different elements', () => {
      const element1 = document.createElement('div');
      const element2 = document.createElement('div');
      element1.textContent = '1000';
      element2.textContent = '2000';

      const animation1 = new StatRollAnimation(element1, 1000, 1500);
      const animation2 = new StatRollAnimation(element2, 2000, 2500);

      animation1.animate();
      animation2.animate();

      expect(element1.classList.contains('stat-rolling')).toBe(true);
      expect(element2.classList.contains('stat-rolling')).toBe(true);
    });
  });

  describe('formatNumber', () => {
    it('should format positive numbers with commas', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 0, 1000);

      expect(animation.formatNumber(1000)).toBe('1,000');
      expect(animation.formatNumber(1000000)).toBe('1,000,000');
      expect(animation.formatNumber(100)).toBe('100');
    });

    it('should format negative numbers with commas and sign', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 0, -1000);

      expect(animation.formatNumber(-1000)).toBe('-1,000');
      expect(animation.formatNumber(-1000000)).toBe('-1,000,000');
    });

    it('should handle zero', () => {
      const element = document.createElement('div');
      const animation = new StatRollAnimation(element, 0, 0);

      expect(animation.formatNumber(0)).toBe('0');
    });
  });

  describe('createRollingDigits', () => {
    it('should create rolling container with digits', () => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const animation = new StatRollAnimation(element, 1000, 2000);

      animation.animate();

      // Should create a rolling container
      const rollingContainer = element.querySelector('.stat-roll-container');
      expect(rollingContainer).toBeTruthy();
    });

    it('should animate through intermediate values', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      const animation = new StatRollAnimation(element, 1000, 1010);

      let contentChanges = 0;
      const observer = new MutationObserver(() => {
        contentChanges++;
      });

      observer.observe(element, {
        childList: true,
        subtree: true,
        characterData: true
      });

      animation.animate();

      setTimeout(() => {
        observer.disconnect();
        // Should have changed content during animation
        expect(contentChanges).toBeGreaterThan(0);
        done();
      }, 650);
    });
  });

  describe('integration with stats refresh', () => {
    it('should work when called multiple times on same element', () => {
      const element = document.createElement('div');
      element.textContent = '1000';

      // First animation
      const animation1 = new StatRollAnimation(element, 1000, 2000);
      animation1.animate();

      // Second animation (simulating another stats update)
      const animation2 = new StatRollAnimation(element, 2000, 3000);
      animation2.animate();

      expect(element.classList.contains('stat-rolling')).toBe(true);
    });

    it('should not animate when previous and new values are the same', () => {
      const element = document.createElement('div');
      element.textContent = '5000';

      // Stats update but value hasn't changed
      const animation = new StatRollAnimation(element, 5000, 5000);
      animation.animate();

      // Should not have any rolling class or container
      expect(element.classList.contains('stat-rolling')).toBe(false);
      expect(element.querySelector('.stat-roll-container')).toBeFalsy();
    });
  });

  describe('cleanup', () => {
    it('should clean up after animation completes', (done) => {
      const element = document.createElement('div');
      document.body.appendChild(element);
      element.textContent = '1000';

      const animation = new StatRollAnimation(element, 1000, 2000);
      animation.animate();

      // Should have rolling container during animation
      expect(element.querySelector('.stat-roll-container')).toBeTruthy();

      setTimeout(() => {
        // After animation, rolling container should be removed
        expect(element.querySelector('.stat-roll-container')).toBeFalsy();
        expect(element.textContent).toBe('2,000');
        done();
      }, 700);
    });
  });
});
