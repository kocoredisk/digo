import React, { useState, useEffect } from 'react';
import CalendarMonth from './CalendarMonth';
import CalendarTimeTable from './CalendarTimeTable';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const CalendarSection = ({ customerName, customerRegion, onScheduleAdded }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState({});

  // 서버에서 일정 전체 조회
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch('/api/schedules');
        const arr = await res.json();
        // 날짜별로 그룹화
        const grouped = {};
        arr.forEach(item => {
          if (!grouped[item.date]) grouped[item.date] = [];
          grouped[item.date].push({
            id: item.id,
            time: item.time,
            text: item.text,
            customer_id: item.customer_id
          });
        });
        // 시간순 정렬
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a, b) => a.time.localeCompare(b.time));
        });
        setScheduleData(grouped);
      } catch (e) {
        setScheduleData({});
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div className="w-full bg-blue-900 text-white p-0 flex flex-col" style={{ height: 380 }}>
      <CalendarMonth selectedDate={selectedDate} onChange={setSelectedDate} scheduleData={scheduleData} />
      <CalendarTimeTable 
        selectedDate={selectedDate} 
        scheduleData={scheduleData} 
        setScheduleData={setScheduleData}
        onScheduleAdded={onScheduleAdded}
      />
    </div>
  );
};

export default CalendarSection;