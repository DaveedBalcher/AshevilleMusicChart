/**
 * FilterMenu Component - Renders the filter options menu
 * Single Responsibility: Handle filter menu UI and interactions
 */
export class FilterMenu {
  constructor(genres, currentFilter, onFilterSelect, onClose) {
    this.genres = genres;
    this.currentFilter = currentFilter;
    this.onFilterSelect = onFilterSelect;
    this.onClose = onClose;
    this.element = null;
  }

  render() {
    const menu = document.createElement('div');
    menu.className = 'filter-menu-overlay';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Filter artists by genre');
    
    menu.innerHTML = `
      <div class="filter-menu">
        <div class="filter-menu-header">
          <h3>Filter by Genre</h3>
          <button class="filter-menu-close" aria-label="Close filter menu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="filter-menu-content">
          <div class="filter-option ${!this.currentFilter ? 'selected' : ''}" data-genre="All">
            <span class="filter-option-text">All Genres</span>
            <span class="filter-option-count">(${this.genres.length})</span>
          </div>
          ${this.genres.map(genre => `
            <div class="filter-option ${this.currentFilter === genre ? 'selected' : ''}" data-genre="${genre}">
              <span class="filter-option-text">${genre}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    menu.addEventListener('click', (e) => {
      if (e.target.closest('.filter-menu-close') || e.target === menu) {
        this.close();
      }
    });

    const filterOptions = menu.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
      option.addEventListener('click', () => {
        const genre = option.dataset.genre;
        this.onFilterSelect(genre === 'All' ? null : genre);
        this.close();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', this.handleKeydown.bind(this));

    this.element = menu;
    return menu;
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  close() {
    if (this.element) {
      this.element.classList.add('closing');
      setTimeout(() => {
        this.onClose();
      }, 200);
    }
  }

  destroy() {
    if (this.element) {
      document.removeEventListener('keydown', this.handleKeydown.bind(this));
      this.element.remove();
      this.element = null;
    }
  }
} 