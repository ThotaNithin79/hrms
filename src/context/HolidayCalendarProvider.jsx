import React, { useState, useCallback, useMemo } from "react";
import { HolidayCalendarContext } from "./HolidayCalendarContext";

// Helper function to generate all Sundays for a given year
const generateSundaysForYear = (year) => {
  const sundays = [];
  let currentDate = new Date(year, 0, 5); // Start from January 5th, 2025 (which is a Sunday)
  
  // Ensure we start with a Sunday
  while (currentDate.getDay() !== 0) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  let sundayId = 1000; // Start Sunday IDs from 1000 to avoid conflicts
  
  // Generate all Sundays for the year
  while (currentDate.getFullYear() === year) {
    // Use local date formatting to avoid timezone issues
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    sundays.push({
      id: sundayId++,
      name: "Sunday",
      date: dateStr,
      description: "Weekly holiday - Sunday",
      isSunday: true
    });
    currentDate.setDate(currentDate.getDate() + 7); // Move to next Sunday
  }
  
  return sundays;
};

const initialHolidays = [
  { id: 1, name: "New Year's Day", date: "2025-01-01", description: "First day of the year" },
  { id: 2, name: "Republic Day", date: "2025-01-26", description: "National holiday" },
  { id: 3, name: "Maha Shivaratri", date: "2025-02-26", description: "Hindu festival honoring Lord Shiva" },
  { id: 4, name: "Holi", date: "2025-03-14", description: "Festival of colors" },
  { id: 5, name: "Good Friday", date: "2025-04-18", description: "Christian religious holiday" },
  { id: 6, name: "Ambedkar Jayanti", date: "2025-04-14", description: "Birth anniversary of Dr. B.R. Ambedkar" },
  { id: 7, name: "May Day", date: "2025-05-01", description: "International Labour Day" },
  { id: 8, name: "Bakrid / Eid al-Adha", date: "2025-06-06", description: "Islamic festival of sacrifice" },
  { id: 9, name: "Independence Day", date: "2025-08-15", description: "Indian Independence Day" },
  { id: 10, name: "Raksha Bandhan", date: "2025-08-18", description: "Festival celebrating sibling bond" },
  { id: 11, name: "Janmashtami", date: "2025-08-25", description: "Birth of Lord Krishna" },
  { id: 12, name: "Gandhi Jayanti", date: "2025-10-02", description: "Birth anniversary of Mahatma Gandhi" },
  { id: 13, name: "Dussehra", date: "2025-10-02", description: "Victory of good over evil" },
  { id: 14, name: "Diwali", date: "2025-10-20", description: "Festival of lights" },
  { id: 15, name: "Christmas", date: "2025-12-25", description: "Celebration of the birth of Jesus Christ" },
  
  // Strategic holidays for sandwich leave scenarios
  { id: 16, name: "Special Holiday", date: "2025-07-13", description: "Strategic holiday for sandwich leave demo" },
  { id: 17, name: "Mid-Week Festival", date: "2025-08-13", description: "Wednesday holiday for sandwich leave" },
  { id: 18, name: "Company Foundation Day", date: "2025-09-17", description: "Company anniversary - Wednesday holiday" },
  { id: 19, name: "Regional Festival", date: "2025-11-12", description: "Regional celebration - Wednesday holiday" },
  { id: 20, name: "Cultural Day", date: "2025-12-10", description: "Cultural celebration - Wednesday holiday" },
  
  // Add all Sundays for 2025
  ...generateSundaysForYear(2025)
];

const HolidayCalendarProvider = ({ children }) => {
  const [holidays, setHolidays] = useState(initialHolidays);

  // Add holiday: only for future dates, prevent duplicate date
  const addHoliday = useCallback((holiday) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (holiday.date <= todayStr) return; // Restrict past/present
    if (holidays.some(h => h.date === holiday.date)) return; // Prevent duplicate
    setHolidays((prev) => [
      ...prev,
      // { ...holiday, id: Date.now() }
    ]);
  }, [holidays]);

  // Edit holiday: only for future dates, prevent duplicate date
  const editHoliday = useCallback((id, updated) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (updated.date <= todayStr) return; // Restrict past/present
    if (holidays.some(h => h.date === updated.date && h.id !== id)) return; // Prevent duplicate
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
    );
  }, [holidays]);

  // Delete holiday: only for future dates
  const deleteHoliday = useCallback((id) => {
    const holiday = holidays.find(h => h.id === id);
    const todayStr = new Date().toISOString().slice(0, 10);
    if (holiday?.date <= todayStr) return; // Restrict past/present
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }, [holidays]);

  // Utility: get all holiday dates as array of YYYY-MM-DD strings - memoized for efficiency
  const getHolidayDates = useCallback(() => {
    return holidays.map(h => h.date).sort();
  }, [holidays]);

  // Get holidays for a specific month
  const getHolidaysForMonth = useCallback((monthStr) => {
    return holidays.filter(h => h.date.startsWith(monthStr));
  }, [holidays]);

  // Get holidays for a specific year
  const getHolidaysForYear = useCallback((year) => {
    return holidays.filter(h => h.date.startsWith(year.toString()));
  }, [holidays]);

  // Check if a specific date is a holiday
  const isHoliday = useCallback((dateStr) => {
    return holidays.some(h => h.date === dateStr);
  }, [holidays]);

  // Get holiday by date
  const getHolidayByDate = useCallback((dateStr) => {
    return holidays.find(h => h.date === dateStr);
  }, [holidays]);

  // Get upcoming holidays (next 30 days)
  const getUpcomingHolidays = useCallback(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return holidays.filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate >= today && holidayDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [holidays]);

  return (
    <HolidayCalendarContext.Provider
      value={{
        holidays,
        addHoliday,
        editHoliday,
        deleteHoliday,
        getHolidayDates,
        getHolidaysForMonth,
        getHolidaysForYear,
        isHoliday,
        getHolidayByDate,
        getUpcomingHolidays,
      }}
    >
      {children}
    </HolidayCalendarContext.Provider>
  );
};

export default HolidayCalendarProvider;