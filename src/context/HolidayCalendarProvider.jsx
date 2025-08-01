import React, { useState, useCallback } from "react";
import { HolidayCalendarContext } from "./HolidayCalendarContext";

const initialHolidays = [
  { id: 1, name: "New Year's Day", date: "2025-01-01", description: "First day of the year" },
  { id: 2, name: "Republic Day", date: "2025-01-26", description: "National holiday" },
];

const HolidayCalendarProvider = ({ children }) => {
  const [holidays, setHolidays] = useState(initialHolidays);

  const addHoliday = useCallback((holiday) => {
    setHolidays((prev) => [
      ...prev,
      { ...holiday, id: Date.now() }
    ]);
  }, []);

  const editHoliday = useCallback((id, updated) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
    );
  }, []);

  const deleteHoliday = useCallback((id) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  }, []);

  return (
    <HolidayCalendarContext.Provider
      value={{ holidays, addHoliday, editHoliday, deleteHoliday }}
    >
      {children}
    </HolidayCalendarContext.Provider>
  );
};

export default HolidayCalendarProvider;