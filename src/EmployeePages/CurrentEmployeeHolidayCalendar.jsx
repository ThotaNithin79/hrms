import React, { useContext, useState } from "react";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";



const CurrentEmployeeHolidayCalendar = () => {
  const { holidays } = useContext(HolidayCalendarContext);

  const currentYear = new Date().getFullYear();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  // Only show upcoming holidays (date > today)
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-900 text-center tracking-wide drop-shadow">
          Holiday Calendar - {currentYear}
        </h2>

        <div className="flex flex-col items-center">
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            className="border-0 shadow w-full rounded-lg calendar-custom"
            tileClassName={({ date, view }) => {
              const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              return isToday ? "bg-yellow-200 font-bold" : "";
            }}
            prev2Label={null}
            next2Label={null}
            showNavigation={true}
            minDetail="year"
            maxDetail="month"
          />
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 text-center">Upcoming Holidays</h3>
          {upcomingHolidays.length === 0 ? (
            <div className="text-center text-gray-500">No upcoming holidays.</div>
          ) : (
            <ul className="divide-y divide-blue-100 rounded-lg overflow-hidden shadow-md bg-blue-50">
              {upcomingHolidays.map((h) => (
                <li key={h.date} className="flex flex-col md:flex-row md:items-center gap-2 px-4 py-3 hover:bg-blue-100 transition">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-bold text-blue-700 text-base md:text-lg">{h.name}</span>
                    <span className="text-gray-500 text-sm md:ml-4">{new Date(h.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {h.description && (
                    <span className="text-xs text-gray-600 md:ml-4">{h.description}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-400 text-center">
          Use the calendar above to browse months. Upcoming holidays are listed below.
        </div>

        <style>{`
          .calendar-custom {
            font-size: 1rem;
            background: #f8fafc;
          }
          .react-calendar__tile {
            min-height: 3.5rem;
            border-radius: 0.5rem;
            margin: 2px;
            transition: background 0.2s;
          }
          .react-calendar__tile:enabled:hover,
          .react-calendar__tile:enabled:focus {
            background: #dbeafe;
          }
          .bg-yellow-200 {
            background: #fef9c3 !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CurrentEmployeeHolidayCalendar;
