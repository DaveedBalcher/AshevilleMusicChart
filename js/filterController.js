import { FilterMenu } from './filterMenu.js';

/**
 * FilterController - Orchestrates the filter system
 * Dependency Inversion: High-level controller doesn't depend on low-level implementations
 */
export class FilterController {
  constructor(filterService, filterButton, onDataUpdate) {
    this.filterService = filterService;
    this.filterButton = filterButton;
    this.onDataUpdate = onDataUpdate;
    this.filterMenu = null;
    this.isMenuOpen = false;
  }

  // Initialize the filter system
  initialize(data) {
    this.filterService.setData(data);
    this.updateFilterButton();
    this.renderFilterButton();
    // Render initial data
    this.onDataUpdate(this.filterService.getFilteredData());
  }

  // Render the filter button
  renderFilterButton() {
    if (window.innerWidth <= 768) {
      // Remove any existing filter button before rendering a new one
      const existing = document.querySelector('.filter-button');
      if (existing) existing.remove();
      const container = document.body;
      container.appendChild(this.filterButton.render());
      // Immediately restore the filter state after rendering
      this.updateFilterButton();
    }
  }

  // Handle filter button click
  handleFilterButtonClick() {
    if (this.isMenuOpen) {
      this.closeFilterMenu();
    } else {
      this.openFilterMenu();
    }
  }

  // Open the filter menu
  openFilterMenu() {
    if (this.isMenuOpen) return;

    const genres = this.filterService.getAvailableGenres();
    const currentFilter = this.filterService.getCurrentFilter();

    this.filterMenu = new FilterMenu(
      genres,
      currentFilter,
      this.handleFilterSelect.bind(this),
      this.closeFilterMenu.bind(this)
    );

    const container = document.body;
    container.appendChild(this.filterMenu.render());
    
    // Trigger animation
    setTimeout(() => {
      if (this.filterMenu.element) {
        this.filterMenu.element.classList.add('open');
      }
    }, 10);

    this.isMenuOpen = true;
  }

  // Close the filter menu
  closeFilterMenu() {
    if (!this.isMenuOpen || !this.filterMenu) return;

    this.filterMenu.close();
    this.isMenuOpen = false;
    
    setTimeout(() => {
      if (this.filterMenu) {
        this.filterMenu.destroy();
        this.filterMenu = null;
      }
    }, 200);
  }

  // Handle filter selection
  handleFilterSelect(genre) {
    const filteredData = this.filterService.applyFilter(genre);
    this.updateFilterButton();
    this.onDataUpdate(filteredData);
  }

  // Update filter button state
  updateFilterButton() {
    const isActive = this.filterService.isFilterActive();
    this.filterButton.updateFilterState(isActive);
  }

  // Get current filtered data
  getFilteredData() {
    return this.filterService.getFilteredData();
  }

  // Clear filter
  clearFilter() {
    const filteredData = this.filterService.clearFilter();
    this.updateFilterButton();
    this.onDataUpdate(filteredData);
  }

  // Handle window resize
  handleResize() {
    if (window.innerWidth > 768) {
      this.closeFilterMenu();
      if (this.filterButton.element) {
        this.filterButton.destroy();
      }
    } else {
      // Only render if button doesn't exist
      if (!this.filterButton.element) {
        this.renderFilterButton();
        // Restore filter state after recreating button
        this.updateFilterButton();
      }
    }
  }

  // Cleanup
  destroy() {
    this.closeFilterMenu();
    if (this.filterButton) {
      this.filterButton.destroy();
    }
  }
} 