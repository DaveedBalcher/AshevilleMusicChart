/**
 * FilterButton Component - Renders the floating filter button
 * Single Responsibility: Handle filter button UI and interactions
 */
export class FilterButton {
  constructor(onClick) {
    this.onClick = onClick;
    this.element = null;
  }

  render() {
    const button = document.createElement('button');
    button.className = 'filter-button';
    button.setAttribute('aria-label', 'Filter artists by genre');
    button.innerHTML = `
      <i class="fas fa-filter"></i>
      <span class="filter-text">Filter</span>
    `;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick();
    });

    this.element = button;
    return button;
  }

  updateFilterState(isActive) {
    if (this.element) {
      if (isActive) {
        this.element.classList.add('filter-active');
        this.element.querySelector('.filter-text').textContent = 'Filtered';
      } else {
        this.element.classList.remove('filter-active');
        this.element.querySelector('.filter-text').textContent = 'Filter';
      }
    }
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
} 