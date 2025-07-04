/**
 * FilterService - Handles filter logic and state management
 * Follows SOLID principles for extensibility and maintainability
 */
export class FilterService {
  constructor() {
    this.currentFilter = null;
    this.availableGenres = new Set();
    this.filteredData = [];
    this.originalData = [];
  }

  // Single Responsibility: Manage filter data
  setData(data) {
    this.originalData = [...data];
    this.filteredData = [...data];
    this.extractAvailableGenres();
  }

  // Single Responsibility: Extract unique genres
  extractAvailableGenres() {
    this.availableGenres.clear();
    this.originalData.forEach(artist => {
      if (artist.artist.high_level_genre) {
        this.availableGenres.add(artist.artist.high_level_genre);
      }
    });
  }

  // Single Responsibility: Get available genres
  getAvailableGenres() {
    return Array.from(this.availableGenres).sort();
  }

  // Single Responsibility: Apply filter
  applyFilter(genre) {
    this.currentFilter = genre;
    if (!genre || genre === 'All') {
      this.filteredData = [...this.originalData];
    } else {
      this.filteredData = this.originalData.filter(artist => 
        artist.artist.high_level_genre === genre
      );
    }
    return this.filteredData;
  }

  // Single Responsibility: Get current filter
  getCurrentFilter() {
    return this.currentFilter;
  }

  // Single Responsibility: Get filtered data
  getFilteredData() {
    return this.filteredData;
  }

  // Single Responsibility: Clear filter
  clearFilter() {
    this.currentFilter = null;
    this.filteredData = [...this.originalData];
    return this.filteredData;
  }

  // Single Responsibility: Check if filter is active
  isFilterActive() {
    return this.currentFilter !== null;
  }
} 