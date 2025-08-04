import React, { useContext, useState } from "react";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const getHolidayDates = (holidays) => holidays.map((h) => new Date(h.date));
const isSameDay = (date1, date2) =>
  date1.getFullYear() === date2.getFullYear() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getDate() === date2.getDate();

const CurrentEmployeeHolidayCalendar = () => {
  const { holidays } = useContext(HolidayCalendarContext);
  const holidayDates = getHolidayDates(holidays);
  const currentYear = new Date().getFullYear();
  const today = new Date();

  const [calendarValues, setCalendarValues] = useState(
    [...Array(12)].map((_, i) => new Date(currentYear, i, 1))
  );

  const [clickedHoliday, setClickedHoliday] = useState(null);


  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const holiday = holidays.find((h) => isSameDay(new Date(h.date), date));
      if (holiday) {
        return (
          <div
            className="flex flex-col items-center justify-start h-16 overflow-hidden text-center leading-tight text-[10px] text-red-600 font-medium px-1"
            title={holiday.name}
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mb-0.5"></span>
            <span className="break-words line-clamp-2 w-full">
              {holiday.name}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isHoliday = holidayDates.some((holidayDate) =>
        isSameDay(holidayDate, date)
      );

      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isHoliday && isToday) {
        return "bg-yellow-300 border-2 border-red-400 font-bold";
      } else if (isHoliday) {
        return "react-calendar__tile--holiday border-2 border-red-400";
      } else if (isToday) {
        return "bg-yellow-300 font-bold";
      }
    }

    return "h-20 flex items-start justify-center pt-1";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2 md:px-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-900 text-center tracking-wide drop-shadow">
          Holiday Calendar - {currentYear}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => {
            const monthStartDate = new Date(currentYear, i, 1);
            const monthName = monthStartDate.toLocaleString("default", {
              month: "long",
            });

            return (
              <div key={i} className="bg-blue-50 rounded-xl p-4 shadow-inner">
                <h3 className="text-center font-semibold mb-2 text-blue-800">
                  {monthName}
                </h3>
                <Calendar
  key={`calendar-${i}`}
  value={null} // 👈 No date should be selected
  activeStartDate={calendarValues[i]}
  onActiveStartDateChange={({ activeStartDate }) => {
    const updated = [...calendarValues];
    updated[i] = new Date(currentYear, i, 1);
    setCalendarValues(updated);
  }}
  defaultActiveStartDate={calendarValues[i]}
  goToRangeStartOnSelect={false}
  tileContent={tileContent}
  tileClassName={tileClassName}
  className="border-0 shadow-none w-full rounded-lg"
  prev2Label={null}
  next2Label={null}
  showNavigation={false}
  onClickDay={(value) => {
  const updated = [...calendarValues];
  updated[i] = new Date(currentYear, i, 1);
  setCalendarValues(updated);

  const clickedDate = value.toLocaleDateString("en-CA");
  const holiday = holidays.find((h) => h.date === clickedDate);

  if (holiday) {
    setClickedHoliday(holiday);
  } else {
    setClickedHoliday(null); // clear if not a holiday
  }
}}
/>
              </div>
            );
          })}
        </div>

{clickedHoliday && (
  <div className="mt-6 text-center text-blue-800 font-semibold text-lg bg-blue-100 p-4 rounded shadow">
    📅 {clickedHoliday.name} – {clickedHoliday.date}
    <p className="text-sm text-gray-600 mt-1">{clickedHoliday.description}</p>
  </div>
)}


        <div className="mt-8 text-xs text-gray-400 text-center">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full align-middle mr-1"></span>
          Holidays are marked with a red dot and their name below the date.
        </div>

        <style>{`
          .react-calendar__tile--holiday {
            background: #fef2f2 !important;
            color: #b91c1c !important;
          }
          .react-calendar__tile--holiday:enabled:hover,
          .react-calendar__tile--holiday:enabled:focus {
            background: #fecaca !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CurrentEmployeeHolidayCalendar;
