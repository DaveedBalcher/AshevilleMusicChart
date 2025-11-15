/**
 * RollingNumber - iOS date picker style number rolling animation
 * Animates number changes with a vertical rolling effect for each digit
 */

export class RollingNumber {
  constructor(container, initialValue = 0) {
    this.container = container;
    this.currentValue = initialValue;
    this.digitElements = [];
    this.commaElements = [];

    this.render();
  }

  /**
   * Format number with commas and return array of characters
   */
  formatNumber(value) {
    return Math.floor(value).toLocaleString().split('');
  }

  /**
   * Create the initial DOM structure
   */
  render() {
    this.container.innerHTML = '';
    this.container.classList.add('rolling-number-container');

    const chars = this.formatNumber(this.currentValue);
    this.digitElements = [];
    this.commaElements = [];

    chars.forEach((char, index) => {
      if (char === ',') {
        const commaSpan = document.createElement('span');
        commaSpan.className = 'rolling-comma';
        commaSpan.textContent = ',';
        this.container.appendChild(commaSpan);
        this.commaElements.push(commaSpan);
      } else {
        const digitContainer = this.createDigitElement(parseInt(char));
        this.container.appendChild(digitContainer);
        this.digitElements.push(digitContainer);
      }
    });
  }

  /**
   * Create a single digit element with rolling animation capability
   */
  createDigitElement(digit) {
    const wrapper = document.createElement('span');
    wrapper.className = 'rolling-digit-wrapper';

    const roller = document.createElement('span');
    roller.className = 'rolling-digit-roller';

    // Create a strip of digits 0-9, with current digit at top
    // We'll create: [current, current+1, current+2, ..., 9, 0, 1, ..., current-1]
    // This allows smooth rolling both up and down
    for (let i = 0; i < 10; i++) {
      const digitSpan = document.createElement('span');
      digitSpan.className = 'rolling-digit';
      digitSpan.textContent = i;
      roller.appendChild(digitSpan);
    }

    // Set initial position
    roller.style.transform = `translateY(-${digit * 100}%)`;
    roller.setAttribute('data-current-digit', digit);

    wrapper.appendChild(roller);
    return wrapper;
  }

  /**
   * Update to a new value with rolling animation
   */
  update(newValue) {
    if (this.currentValue === newValue) return;

    const oldChars = this.formatNumber(this.currentValue);
    const newChars = this.formatNumber(newValue);

    // If the number of characters changed, re-render completely
    if (oldChars.length !== newChars.length) {
      this.currentValue = newValue;
      this.render();
      return;
    }

    // Animate each digit that changed
    let digitIndex = 0;
    newChars.forEach((char, charIndex) => {
      if (char === ',') {
        return; // Skip commas
      }

      const newDigit = parseInt(char);
      const digitWrapper = this.digitElements[digitIndex];
      const roller = digitWrapper.querySelector('.rolling-digit-roller');
      const currentDigit = parseInt(roller.getAttribute('data-current-digit'));

      if (currentDigit !== newDigit) {
        this.animateDigit(roller, currentDigit, newDigit);
      }

      digitIndex++;
    });

    this.currentValue = newValue;
  }

  /**
   * Animate a single digit from old to new value
   */
  animateDigit(roller, oldDigit, newDigit) {
    // Determine direction and distance
    let distance = newDigit - oldDigit;

    // For smoother animation, we always roll "forward" through numbers
    // If going backwards (e.g., 9 -> 0), we still go forward through the strip
    if (distance < 0) {
      distance += 10;
    }

    // Create a smooth rolling effect
    // We'll temporarily modify the strip to create a continuous roll
    const currentTransform = -oldDigit * 100;
    const targetTransform = -(oldDigit + distance) * 100;

    // If we're wrapping around (e.g., 9->0), we need to handle the overflow
    if (oldDigit + distance >= 10) {
      // Create duplicate digits at the end for seamless rolling
      const digitSpans = roller.querySelectorAll('.rolling-digit');
      const digitsToAdd = Math.ceil((oldDigit + distance) / 10) * 10 - 10;

      for (let i = 0; i < digitsToAdd; i++) {
        const digit = i % 10;
        const digitSpan = document.createElement('span');
        digitSpan.className = 'rolling-digit rolling-digit-temp';
        digitSpan.textContent = digit;
        roller.appendChild(digitSpan);
      }
    }

    // Apply the animation
    roller.style.transition = 'none';
    roller.style.transform = `translateY(${currentTransform}%)`;

    // Force reflow
    roller.offsetHeight;

    // Animate to new position
    roller.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    roller.style.transform = `translateY(${targetTransform}%)`;

    // After animation, clean up and reset to proper position
    setTimeout(() => {
      // Remove temporary digits
      const tempDigits = roller.querySelectorAll('.rolling-digit-temp');
      tempDigits.forEach(temp => temp.remove());

      // Reset to new digit position without animation
      roller.style.transition = 'none';
      roller.style.transform = `translateY(-${newDigit * 100}%)`;
      roller.setAttribute('data-current-digit', newDigit);

      // Force reflow to ensure the transition reset takes effect
      roller.offsetHeight;

      // Re-enable transitions for future animations
      roller.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 600);
  }

  /**
   * Get current value
   */
  getValue() {
    return this.currentValue;
  }

  /**
   * Destroy the component
   */
  destroy() {
    this.container.innerHTML = '';
    this.digitElements = [];
    this.commaElements = [];
  }
}
