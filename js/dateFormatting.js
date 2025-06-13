export function formatDate(dateString) {
    // Ensure we parse the date correctly by adding time component
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const suffix = getDaySuffix(day);
    return `${monthName} ${day}${suffix}`;
  }
  
  export function formatEndDate(startDate, endDate) {
    // Parse both dates correctly
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    // If dates are in different months, show full date
    if (start.getMonth() !== end.getMonth()) {
      return formatDate(endDate);
    }
    
    // If same month, just show day with suffix
    return `${endDay}${getDaySuffix(endDay)}`;
  }
  
  function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }