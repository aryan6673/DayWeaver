
import type { ImportantDate } from '@/types';

const IMPORTANT_DATES_STORAGE_KEY = 'dayWeaverImportantDates';

export function getImportantDatesFromLocalStorage(): ImportantDate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const datesJson = localStorage.getItem(IMPORTANT_DATES_STORAGE_KEY);
    if (datesJson) {
      const parsedDates = JSON.parse(datesJson) as ImportantDate[];
      if (Array.isArray(parsedDates) && parsedDates.every(date => typeof date.id === 'string' && date.type === 'importantDate')) {
        return parsedDates;
      }
      console.warn("Invalid important date data found in localStorage, returning empty array.");
      localStorage.removeItem(IMPORTANT_DATES_STORAGE_KEY); // Clear invalid data
      return [];
    }
    return [];
  } catch (error) {
    console.error("Error reading important dates from localStorage:", error);
    try {
      localStorage.removeItem(IMPORTANT_DATES_STORAGE_KEY);
    } catch (removeError) {
      console.error("Error removing corrupted important dates from localStorage:", removeError);
    }
    return [];
  }
}

export function saveImportantDatesToLocalStorage(dates: ImportantDate[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(IMPORTANT_DATES_STORAGE_KEY, JSON.stringify(dates));
  } catch (error) {
    console.error("Error saving important dates to localStorage:", error);
  }
}
