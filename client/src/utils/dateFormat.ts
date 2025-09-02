// Ghana date formatting utilities
// Ghana uses DD/MM/YYYY format

export const formatGhanaDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Ghana format: DD/MM/YYYY
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatGhanaDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Ghana format: DD/MM/YYYY at HH:MM
    const dateStr = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const timeStr = dateObj.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatGhanaMonthYear = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    // Ghana format: Month YYYY
    return dateObj.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};
