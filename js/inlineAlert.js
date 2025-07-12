/**
 * InlineAlert Component - Renders alert inline under chart header
 * Single Responsibility: Handle inline alert UI and interactions
 */
export class InlineAlert {
  constructor(onClose) {
    this.onClose = onClose;
    this.element = null;
    this.isVisible = false;
  }

  render() {
    const alert = document.createElement('div');
    alert.className = 'inline-alert';
    alert.setAttribute('role', 'alert');
    alert.setAttribute('aria-live', 'polite');
    
    alert.innerHTML = `
      <div class="inline-alert-content">
        <div class="inline-alert-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="inline-alert-text">
          <strong>How Rankings Work:</strong> Rankings are based on global Spotify streams for artists based in the Asheville area. Updates weekly.
          <br><br>
          For each artist, the number of Spotify listens is shown for the most recent week and the difference from the previous week.
          <br><br>
          <strong>🔥</strong> Indicates the artist with the highest percentage increase in listens from the previous week.
        </div>
        <button class="inline-alert-close" aria-label="Close information">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add event listener for close button
    const closeBtn = alert.querySelector('.inline-alert-close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    });

    this.element = alert;
    return alert;
  }

  show() {
    if (this.element && !this.isVisible) {
      this.element.classList.add('visible');
      this.isVisible = true;
    }
  }

  hide() {
    if (this.element && this.isVisible) {
      this.element.classList.add('hiding');
      setTimeout(() => {
        this.element.classList.remove('visible', 'hiding');
        this.isVisible = false;
        this.onClose();
      }, 300); // Match CSS animation duration
    }
  }

  isCurrentlyVisible() {
    return this.isVisible;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
} 