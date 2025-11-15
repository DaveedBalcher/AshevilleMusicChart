export class RollingNumber {
  constructor(element, initialValue = 0) {
    this.element = element;
    this.currentValue = initialValue;
    this.isAnimating = false;

    // Initialize the element with the rolling structure
    this.initializeStructure();
  }

  initializeStructure() {
    this.element.classList.add('rolling-number-container');
    this.element.innerHTML = '';
    this.updateDisplay(this.currentValue, false);
  }

  formatNumber(value) {
    return Math.floor(Math.abs(value)).toLocaleString();
  }

  createDigitColumn(digit, isComma = false) {
    const column = document.createElement('span');
    column.className = 'rolling-digit-column';

    if (isComma) {
      column.classList.add('comma');
      column.textContent = ',';
      return column;
    }

    const roller = document.createElement('span');
    roller.className = 'rolling-digit-roller';

    // Create all digits 0-9
    for (let i = 0; i <= 9; i++) {
      const digitSpan = document.createElement('span');
      digitSpan.className = 'rolling-digit';
      digitSpan.textContent = i;
      roller.appendChild(digitSpan);
    }

    column.appendChild(roller);

    // Set initial position
    const digitValue = parseInt(digit) || 0;
    roller.style.transform = `translateY(-${digitValue * 100}%)`;

    return column;
  }

  updateDisplay(newValue, animate = true) {
    const oldFormatted = this.formatNumber(this.currentValue);
    const newFormatted = this.formatNumber(newValue);

    // If the number of characters changed significantly, just rebuild
    if (Math.abs(oldFormatted.length - newFormatted.length) > 3 || !animate) {
      this.rebuildDisplay(newFormatted);
      this.currentValue = newValue;
      return;
    }

    // Pad the shorter string to match lengths
    const maxLength = Math.max(oldFormatted.length, newFormatted.length);
    const oldPadded = oldFormatted.padStart(maxLength, ' ');
    const newPadded = newFormatted.padStart(maxLength, ' ');

    // Update existing columns or add new ones
    let columnIndex = 0;
    for (let i = 0; i < newPadded.length; i++) {
      const char = newPadded[i];

      if (char === ',') {
        if (!this.element.children[columnIndex] ||
            !this.element.children[columnIndex].classList.contains('comma')) {
          this.rebuildDisplay(newFormatted);
          this.currentValue = newValue;
          return;
        }
        columnIndex++;
        continue;
      }

      if (char === ' ') {
        columnIndex++;
        continue;
      }

      const digit = parseInt(char);
      const column = this.element.children[columnIndex];

      if (!column || column.classList.contains('comma')) {
        this.rebuildDisplay(newFormatted);
        this.currentValue = newValue;
        return;
      }

      const roller = column.querySelector('.rolling-digit-roller');
      if (roller && animate) {
        roller.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        roller.style.transform = `translateY(-${digit * 100}%)`;
      } else if (roller) {
        roller.style.transition = 'none';
        roller.style.transform = `translateY(-${digit * 100}%)`;
      }

      columnIndex++;
    }

    this.currentValue = newValue;
  }

  rebuildDisplay(formattedValue) {
    this.element.innerHTML = '';

    for (let i = 0; i < formattedValue.length; i++) {
      const char = formattedValue[i];

      if (char === ',') {
        this.element.appendChild(this.createDigitColumn('0', true));
      } else {
        this.element.appendChild(this.createDigitColumn(char, false));
      }
    }
  }

  setValue(newValue, animate = true) {
    if (newValue === this.currentValue) return;
    this.updateDisplay(newValue, animate);
  }

  getValue() {
    return this.currentValue;
  }

  destroy() {
    this.element.innerHTML = '';
    this.element.classList.remove('rolling-number-container');
  }
}
