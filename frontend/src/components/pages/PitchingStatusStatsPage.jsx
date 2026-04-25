import React, { useEffect, useState, useMemo } from 'react';

function getTwoWeekDatesSundayStart() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0(일)~6(토)
  // 오늘이 포함된 주의 일요일
  const thisSunday = new Date(today);
  thisSunday.setDate(today.getDate() - dayOfWeek);
  // 전 주 일요일
  const lastSunday = new Date(thisSunday);
  lastSunday.setDate(thisSunday.getDate() - 7);
  // week1: 전주 일~토, week2: 이번주 일~토
  const week1 = [];
  const week2 = [];
  for (let i = 0; i < 7; i++) {
    const d1 = new Date(lastSunday);
    d1.setDate(lastSunday.getDate() + i);
    week1.push(new Date(d1));
    const d2 = new Date(thisSunday);
    d2.setDate(thisSunday.getDate() + i);
    week2.push(new Date(d2));
  }
  return [week1, week2];
}

function isToday(dateStr) {
  const today = new Date();
  return dateStr === today.toISOString().slice(0,10);
}

export default function PitchingStatusStatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [week1, week2] = useMemo(() => getTwoWeekDatesSundayStart(), []);
  const weekDays = ['일','월','화','수','목','금','토','합계'];
  const today = new Date();

  const [refreshKey, setRefreshKey] = useState(0);
  const from = useMemo(() => week1[0].toISOString().slice(0,10), [week1]);
  const to = useMemo(() => week2[6].toISOString().slice(0,10), [week2]);
  const fetchStats = () => {
    setLoading(true);
    fetch(`/api/email-sending-stats?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
        else setError('데이터 조회 실패');
        setLoading(false);
      })
      .catch(() => { setError('네트워크 오류'); setLoading(false); });
  };
  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  // 날짜별로 stats 매핑
  const statsMap = Object.fromEntries(stats.map(s => [s.date, s]));

  // 각 주의 합계 계산
  function getWeekSum(week) {
    let first = 0, second = 0, third = 0;
    week.forEach(d => {
      const dateStr = d.toISOString().slice(0,10);
      const stat = statsMap[dateStr] || { first: 0, second: 0, third: 0 };
      first += stat.first;
      second += stat.second;
      third += stat.third;
    });
    return { first, second, third, total: first+second+third };
  }

  return (
    <div style={{width:1850, margin:0, padding:0}}>
      <div className="bg-white" style={{width:1850, minHeight:400, margin:0, padding:0}}>
            <div className="flex items-center gap-2" style={{marginTop:8, marginLeft:8, marginBottom:6, padding:0}}>
              <h2 className="text-2xl font-bold" style={{margin:0, padding:0}}>발송현황 (최근 2주)</h2>
              <button
                className="px-2 py-0 text-xs rounded bg-gray-100 border border-gray-300 hover:bg-blue-100 text-gray-600 flex items-center h-[32px] align-middle"
                style={{verticalAlign:'middle'}}
                onClick={fetchStats}
                title="새로고침"
              >
                &#x21bb; 새로고침
              </button>
            </div>
            <div className="grid grid-cols-8 mb-2" style={{borderBottom: '1px solid #9ca3af', height: 36}}>
              {weekDays.map((d, i) => (
                <div
                  key={d}
                  className={`bg-[#1A2346] text-white font-semibold text-[13px] text-center px-2 py-2 flex items-center justify-center ${i < 7 ? 'border-r border-gray-400' : ''}`}
                  style={{height: 36}}
                >
                  {d}
                </div>
              ))}
            </div>
            {loading ? (
              <div className="text-center text-gray-500">로딩중...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              [week1, week2].map((week, widx) => {
                const weekSum = getWeekSum(week);
                return (
                  <div key={widx} className="grid grid-cols-8 gap-4 mb-4">
                    {week.map((d, idx) => {
                      const dateStr = d.toISOString().slice(0,10);
                      const isFuture = d > today;
                      const stat = statsMap[dateStr] || { first: 0, second: 0, third: 0 };
                      const total = stat.first + stat.second + stat.third;
                      const isSunday = idx === 0;
                      const isSaturday = idx === 6;
                      return (
                        <div
                          key={dateStr}
                          className={`rounded-lg shadow p-3 flex flex-col items-center border transition-all
                            ${(isSunday || isSaturday)
                              ? (total >= 480 ? 'bg-red-50 border-red-400 border-2' : 'bg-red-50 border-gray-200')
                              : (total >= 480 ? 'bg-red-100 border-red-400 border-2' : 'bg-white border-gray-200')}
                            ${isToday(dateStr) ? 'ring-2 ring-blue-400' : ''}
                          `}
                        >
                          {/* 날짜 - 더 길고 얇은 연파랑 배경, 슬림하고 날렵하게, 연파랑 테두리 추가 */}
                          <div className={`font-semibold mb-1 ${isFuture ? 'text-gray-400' : ''} bg-blue-50 border border-blue-200 rounded-full px-5 py-0.5 text-[15px] shadow-sm w-[96%] text-center`} style={{marginLeft:'auto',marginRight:'auto'}}>{dateStr.slice(5)}</div>
                          {!isFuture && <>
                            <div className="text-blue-600">1차: {stat.first}</div>
                            <div className="text-green-600">2차: {stat.second}</div>
                            <div className="text-purple-600">3차: {stat.third}</div>
                            {/* 총 수량 - 더 길고 얇은 연노랑 배경, 슬림하고 날렵하게 */}
                            <div className={`mt-1 font-bold ${total >= 480 ? 'text-red-600' : ''} bg-yellow-50 rounded-full px-5 py-0.5 shadow-sm w-[96%] text-center`} style={{marginLeft:'auto',marginRight:'auto'}}>총: {total}</div>
                          </>}
                        </div>
                      );
                    })}
                    {/* 합계 카드 */}
                    <div className={`rounded-lg shadow p-3 flex flex-col items-center border transition-all bg-yellow-50 border-yellow-400 border-2`}>
                      <div className="font-semibold mb-1 text-yellow-700">합계</div>
                      <div className="text-blue-600">1차: {weekSum.first}</div>
                      <div className="text-green-600">2차: {weekSum.second}</div>
                      <div className="text-purple-600">3차: {weekSum.third}</div>
                      <div className={`mt-1 font-bold ${weekSum.total >= 480*7 ? 'text-red-600' : 'text-yellow-700'}`}>총: {weekSum.total}</div>
                    </div>
                  </div>
                );
              })
            )}
      </div>
    </div>
  );
} 