import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const HOURS = Array.from({ length: 14 }, (_, i) => (8 + i).toString().padStart(2, '0'));
const MINUTES = ['00', '10', '20', '30', '40', '50'];

const CalendarTimeTable = ({ selectedDate, scheduleData, setScheduleData, onScheduleAdded }) => {
  const [showInput, setShowInput] = React.useState(false);
  const [inputHour, setInputHour] = React.useState(HOURS[0]);
  const [inputMinute, setInputMinute] = React.useState(MINUTES[0]);
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [customerName, setCustomerName] = React.useState('');
  const [customerRegion, setCustomerRegion] = React.useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const schedules = scheduleData[dateKey] || [];

  // 서버에서 일정 전체 fetch 후 부모 state 갱신
  const refreshSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/schedules');
      const arr = await res.json();
      const grouped = {};
      arr.forEach(item => {
        if (!grouped[item.date]) grouped[item.date] = [];
        grouped[item.date].push({
          id: item.id,
          time: item.time,
          text: item.text,
          customer_id: item.customer_id,
          customer_name: item.customer_name,
          customer_region: item.customer_region
        });
      });
      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => a.time.localeCompare(b.time));
      });
      setScheduleData(grouped);
    } catch (e) {
      setScheduleData({});
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setShowInput(true);
    setInputHour(HOURS[0]);
    setInputMinute(MINUTES[0]);
    setInputValue('');
    setCustomerName('');
    setCustomerRegion('');
  };

  const handleInputSave = async () => {
    if (!inputValue.trim()) return setShowInput(false);
    setLoading(true);
    const time = `${inputHour}:${inputMinute}`;
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: dateKey, 
          time, 
          text: inputValue.trim(),
          customer_name: customerName.trim(),
          customer_region: customerRegion.trim()
        })
      });
      await refreshSchedules();
      // 상담신청관리 리스트 업데이트 콜백 호출
      if (onScheduleAdded) {
        onScheduleAdded();
      }
    } catch (e) {
      // 실패 시 무시
    }
    setShowInput(false);
    setInputValue('');
    setLoading(false);
  };

  const handleDelete = async (idx) => {
    setLoading(true);
    const item = schedules[idx];
    if (!item || !item.id) return setLoading(false);
    try {
      await fetch(`/api/schedules/${item.id}`, { method: 'DELETE' });
      await refreshSchedules();
    } catch (e) {}
    setLoading(false);
  };

  return (
    <div className="bg-white text-black rounded-t-none rounded-b pt-2 flex-1 overflow-y-auto">
      <h3 className="font-semibold text-sm mb-2">
        {format(selectedDate, 'M월 d일 (eee)', { locale: ko })} 일정
      </h3>
      <div className="mb-3">
        <button
          className="w-full py-0.5 bg-blue-100 text-blue-700 rounded font-semibold text-xs hover:bg-blue-200 transition mb-1"
          style={{ minHeight: 26 }}
          onClick={handleAddClick}
          disabled={loading}
        >
          ＋ 일정 추가
        </button>
        {showInput && (
          <div className="flex flex-col gap-1 items-stretch mb-2 p-1 bg-gray-50 rounded border border-gray-200">
            <div className="flex flex-col gap-1 mb-1">
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-full pr-12"
                  placeholder="상호를 입력하세요"
                  autoFocus
                  tabIndex={1}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-semibold">상호</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={customerRegion}
                  onChange={e => setCustomerRegion(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs w-full pr-12"
                  placeholder="지역을 입력하세요"
                  tabIndex={2}
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs font-semibold">지역</span>
              </div>
            </div>
            <div className="flex gap-1">
              <select
                className="border border-gray-300 rounded px-2 py-0.5 text-xs w-[70px] min-h-[24px]"
                value={inputHour}
                onChange={e => setInputHour(e.target.value)}
                tabIndex={3}
              >
                {HOURS.map(h => <option key={h} value={h}>{h}시</option>)}
              </select>
              <select
                className="border border-gray-300 rounded px-2 py-0.5 text-xs w-[70px] min-h-[24px]"
                value={inputMinute}
                onChange={e => setInputMinute(e.target.value)}
                tabIndex={4}
              >
                {MINUTES.map(m => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
            <input
              className="border border-gray-300 rounded px-2 py-0.5 text-xs flex-1 min-h-[24px]"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInputSave()}
              placeholder="일정 내용 입력"
              tabIndex={5}
              style={{ minHeight: 24 }}
            />
            <div className="flex gap-2 mt-1">
              <button
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-0.5 rounded text-xs font-semibold hover:bg-gray-300 min-h-[28px]"
                onClick={() => setShowInput(false)}
                type="button"
                disabled={loading}
              >
                닫기
              </button>
              <button
                className="flex-1 bg-blue-500 text-white px-3 py-0.5 rounded text-xs font-semibold hover:bg-blue-600 min-h-[28px]"
                onClick={handleInputSave}
                type="button"
                disabled={loading}
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="text-gray-400 text-xs text-center py-8">로딩 중...</div>
        ) : schedules.length === 0 ? (
          <div className="text-gray-400 text-xs text-center py-8">일정이 없습니다</div>
        ) : (
          schedules.map((item, idx) => (
            <span key={item.id || idx} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs h-6 min-w-[40px]">
              <span className="font-semibold mr-2">{item.time}</span>
              {item.customer_name && <span className="mr-1 text-blue-600">[{item.customer_name}]</span>}
              {item.customer_region && <span className="mr-1 text-blue-600">({item.customer_region})</span>}
              <span>{item.text}</span>
              <button
                className="ml-2 text-[11px] text-blue-600 hover:text-red-500 h-5 w-5 flex items-center justify-center"
                onClick={() => handleDelete(idx)}
                disabled={loading}
              >✕</button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarTimeTable;
