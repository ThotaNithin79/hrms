import React, { useContext } from "react";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Helper to get dates as Date objects from holiday data
const getHolidayDates = (holidays) => holidays.map((h) => new Date(h.date));

const isSameDay = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const CurrentEmployeeHolidayCalendar = () => {
  const { holidays } = useContext(HolidayCalendarContext);
  const holidayDates = getHolidayDates(holidays);

  // Highlight holiday tiles with a dot and tooltip
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = holidays.find((h) => isSameDay(new Date(h.date), date));
      if (holiday) {
        return (
          <div className="flex flex-col items-center justify-center">
            <span className="block w-1.5 h-1.5 bg-red-500 rounded-full mt-0.5 mb-0.5" title={holiday.name}></span>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (
      view === "month" &&
      holidayDates.some((holidayDate) => isSameDay(holidayDate, date))
    ) {
      return "react-calendar__tile--holiday border-2 border-red-400";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-900 text-center tracking-wide drop-shadow">Holiday Calendar</h2>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 flex justify-center items-start">
            <div className="bg-blue-50 rounded-xl p-4 shadow-inner w-full max-w-md">
              <Calendar
                tileClassName={tileClassName}
                tileContent={tileContent}
                className="border-0 shadow-none w-full max-w-md rounded-lg"
                prev2Label={null}
                next2Label={null}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-blue-50 rounded-xl shadow-inner p-4">
              <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-800">Upcoming Holidays</h3>
              <ul className="divide-y divide-gray-200">
                {holidays.length === 0 && (
                  <li className="py-2 text-gray-500">No holidays found.</li>
                )}
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-blue-100 rounded transition">
                    <span className="font-medium text-blue-900 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                      {holiday.name}
                    </span>
                    <span className="text-sm text-gray-700 font-mono">{holiday.date}</span>
                    <span className="text-xs text-gray-500 italic">{holiday.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full align-middle mr-1"></span>
          Holidays are marked with a red dot on the calendar. You can only view holidays.
        </div>
        <style>{`
          .react-calendar__tile--holiday {
            background: #fef2f2 !important;
            color: #b91c1c !important;
          }
          .react-calendar__tile--holiday:enabled:hover, .react-calendar__tile--holiday:enabled:focus {
            background: #fecaca !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CurrentEmployeeHolidayCalendar;
