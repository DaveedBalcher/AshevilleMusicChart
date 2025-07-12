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
        <div class="inline-alert-text">
          <section>
            <p>
              <em>
                This project spotlights Asheville's local music talent and helps neighbors discover the artists shaping our city's sound.
              </em>
            </p>

            <h2>How It Works</h2>

            <p>
              These rankings are based on global Spotify streams for artists based in the Asheville area. Charts update weekly.
            </p>

            <p>Each artist's entry shows:</p>
            <ul>
              <li><strong>Total streams</strong> from the most recent week</li>
              <li><strong>Change</strong> from the previous week</li>
            </ul>

            <div class="fire-highlight">
              <p>
                <strong>🔥 Biggest Weekly Growth:</strong><br>
                The <span class="fire-icon">🔥</span> icon marks the artist with the highest percentage increase in streams this week.
              </p>
            </div>
          </section>
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
        // Remove active state from info icon when alert is closed
        const infoIcon = document.querySelector('.info-icon');
        if (infoIcon) infoIcon.classList.remove('active');
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