/**
 * StatRollAnimation - Creates an iOS date picker-style rolling animation for stat updates
 * Only animates when values change, preventing flicker for unchanged stats
 */
class StatRollAnimation {
  constructor(element, oldValue, newValue) {
    if (!element) {
      throw new Error('Element is required');
    }

    this.element = element;
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.duration = 600; // Animation duration in ms
    this.steps = 20; // Number of intermediate values to show
  }

  /**
   * Determines if animation should run
   * @returns {boolean} True if values are different, false otherwise
   */
  shouldAnimate() {
    return this.oldValue !== this.newValue;
  }

  /**
   * Formats a number with comma separators
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Runs the rolling animation
   * Does nothing if values haven't changed (prevents flicker)
   */
  animate() {
    // Don't animate if value hasn't changed
    if (!this.shouldAnimate()) {
      return;
    }

    // Add rolling class to indicate animation in progress
    this.element.classList.add('stat-rolling');

    // Calculate the step size
    const diff = this.newValue - this.oldValue;
    const stepSize = diff / this.steps;
    const stepDuration = this.duration / this.steps;

    let currentStep = 0;

    // Create rolling container for the animation
    const originalContent = this.element.textContent;
    const container = document.createElement('div');
    container.className = 'stat-roll-container';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.display = 'inline-block';

    // Store the element's original display property
    const originalDisplay = this.element.style.display;

    // Clear element and add container
    this.element.textContent = '';
    this.element.appendChild(container);

    // Animation loop
    const animate = () => {
      currentStep++;

      if (currentStep <= this.steps) {
        // Calculate intermediate value
        const currentValue = Math.round(this.oldValue + (stepSize * currentStep));

        // Create new digit element
        const digitElement = document.createElement('div');
        digitElement.className = 'stat-roll-digit';
        digitElement.textContent = this.formatNumber(currentValue);
        digitElement.style.position = 'absolute';
        digitElement.style.width = '100%';
        digitElement.style.transition = 'transform 0.05s ease-out, opacity 0.05s ease-out';
        digitElement.style.transform = 'translateY(20px)';
        digitElement.style.opacity = '0';

        container.appendChild(digitElement);

        // Animate in
        requestAnimationFrame(() => {
          digitElement.style.transform = 'translateY(0)';
          digitElement.style.opacity = '1';
        });

        // Remove old digits
        const digits = container.querySelectorAll('.stat-roll-digit');
        if (digits.length > 1) {
          const oldDigit = digits[0];
          oldDigit.style.transform = 'translateY(-20px)';
          oldDigit.style.opacity = '0';
          setTimeout(() => oldDigit.remove(), 50);
        }

        // Schedule next step
        setTimeout(animate, stepDuration);
      } else {
        // Animation complete - clean up
        this.cleanup(originalDisplay);
      }
    };

    // Start animation
    animate();
  }

  /**
   * Cleans up after animation completes
   * @param {string} originalDisplay - Original display property value
   */
  cleanup(originalDisplay) {
    // Remove rolling class
    this.element.classList.remove('stat-rolling');

    // Remove container and show final value
    this.element.textContent = this.formatNumber(this.newValue);

    // Restore original display if it was set
    if (originalDisplay) {
      this.element.style.display = originalDisplay;
    }
  }
}

// Export for both CommonJS (Jest) and ES6 modules (browser)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StatRollAnimation };
}

// ES6 export for browser usage
if (typeof window !== 'undefined') {
  window.StatRollAnimation = StatRollAnimation;
}
