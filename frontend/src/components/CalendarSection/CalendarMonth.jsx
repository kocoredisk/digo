import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';

const CalendarMonth = ({ selectedDate, onChange, scheduleData }) => {
  // 날짜 숫자만 보이게 formatDay 커스텀
  const formatDay = (locale, date) => date.getDate().toString();

  // 오늘 날짜
  const today = new Date();

  return (
    <div className="bg-white text-black overflow-hidden mb-0 border-b" style={{borderBottom: '1.5px solid #e0f2ff'}}>
      <Calendar
        onChange={onChange}
        value={selectedDate}
        locale="ko-KR"
        calendarType="gregory"
        next2Label={null}
        prev2Label={null}
        formatDay={formatDay}
        tileContent={({ date, view }) => {
          if (view === 'month') {
            const key = format(date, 'yyyy-MM-dd');
            const count = Array.isArray(scheduleData[key]) ? scheduleData[key].length : 0;
            return count > 0 ? (
              <div className="absolute right-0 top-0 mt-0.5 mr-0.5">
                <span className="inline-flex items-center justify-center bg-blue-500 text-white text-[8px] w-2.5 h-2.5 rounded-full text-center">
                  {count}
                </span>
              </div>
            ) : null;
          }
        }}
        tileClassName={({ date }) => {
          // 오늘 날짜: 빨강, 선택된 날짜: 흰색, 나머지: 검정
          if (isSameDay(date, selectedDate)) {
            return 'relative bg-blue-500 text-white font-bold';
          } else if (isSameDay(date, today)) {
            return 'relative text-red-500 font-bold';
          } else {
            return 'relative text-gray-900';
          }
        }}
      />
    </div>
  );
};

export default CalendarMonth;
