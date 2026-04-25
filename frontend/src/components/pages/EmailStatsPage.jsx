import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


function EmailStatsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  // 현재 월의 첫날과 마지막날 계산
  const getMonthRange = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // 월별 통계 조회
  const fetchMonthStats = async (date) => {
    setLoading(true);
    try {
      const { firstDay, lastDay } = getMonthRange(date);
      
      // 한국 시간 기준으로 날짜 계산
      const startDate = firstDay.getFullYear() + '-' + 
        String(firstDay.getMonth() + 1).padStart(2, '0') + '-' + 
        String(firstDay.getDate()).padStart(2, '0');
      const endDate = lastDay.getFullYear() + '-' + 
        String(lastDay.getMonth() + 1).padStart(2, '0') + '-' + 
        String(lastDay.getDate()).padStart(2, '0');
      
      const response = await axios.get('/api/email-stats', {
        params: {
          startDate,
          endDate
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('통계 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 월 변경
  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  // 캘린더 날짜 생성
  const generateCalendarDays = () => {
    const { firstDay, lastDay } = getMonthRange(currentMonth);
    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonthLastDay = new Date(firstDay);
    prevMonthLastDay.setDate(0);
    const prevMonthDays = prevMonthLastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, day),
        isCurrentMonth: false,
        stats: null
      });
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.getFullYear() + '-' + 
        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
        String(date.getDate()).padStart(2, '0');
      days.push({
        date,
        isCurrentMonth: true,
        stats: stats[dateStr] || null
      });
    }
    
    // 다음 달의 첫날들
    const remainingDays = 42 - days.length; // 6주 고정
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, day),
        isCurrentMonth: false,
        stats: null
      });
    }
    
    return days;
  };

  useEffect(() => {
    fetchMonthStats(currentMonth);
  }, [currentMonth]);

  const days = generateCalendarDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">발송 현황</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeMonth('prev')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ◀
            </button>
            <span className="text-lg font-medium">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </span>
            <button
              onClick={() => changeMonth('next')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 컨테이너 A, B 분할 */}
      <div className="flex-1 p-6 flex gap-6">
        {/* A 영역: 캘린더 (70%) */}
        <div className="w-[70%]">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 bg-blue-900">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center font-medium text-white">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-medium px-3 py-1 ${
                    day.isCurrentMonth ? 'text-gray-900 bg-gray-50' : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {day.isCurrentMonth && day.stats && (
                    <div className="mt-2 space-y-1 px-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-semibold">
                          발송: {day.stats.sent || 0}
                        </span>
                        <span className="text-blue-600 font-semibold">
                          개봉율: {day.stats.sent > 0 ? Math.round((day.stats.opened / day.stats.sent) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="text-gray-700">
                          G: {day.stats.gmail || 0}
                        </div>
                        <div className="text-gray-700">
                          D: {day.stats.daum || 0}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* B 영역: 월 총계 (30%) */}
        <div className="w-[30%]">
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">월 총계</h2>
            
            {/* 첫 번째 박스: 총계 한 줄 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.values(stats).reduce((sum, day) => sum + (day.sent || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">총 발송</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(stats).reduce((sum, day) => sum + (day.opened || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600">총 오픈</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const totalSent = Object.values(stats).reduce((sum, day) => sum + (day.sent || 0), 0);
                      const totalOpened = Object.values(stats).reduce((sum, day) => sum + (day.opened || 0), 0);
                      return totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
                    })()}%
                  </div>
                  <div className="text-xs text-gray-600">개봉률</div>
                </div>
              </div>
            </div>

            {/* 두 번째 박스: 입체 Bar 차트 */}
            <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">발송 통계</h3>
              <div className="space-y-4">
                {(() => {
                  const totalGmail = Object.values(stats).reduce((sum, day) => sum + (day.gmail || 0), 0);
                  const totalDaum = Object.values(stats).reduce((sum, day) => sum + (day.daum || 0), 0);
                  const totalOpened = Object.values(stats).reduce((sum, day) => sum + (day.opened || 0), 0);
                  const gmailOpened = Math.round(totalOpened * 0.5);
                  const daumOpened = Math.round(totalOpened * 0.5);
                  const gmailRate = totalGmail > 0 ? Math.round((gmailOpened / totalGmail) * 100) : 0;
                  const daumRate = totalDaum > 0 ? Math.round((daumOpened / totalDaum) * 100) : 0;
                  
                  return (
                    <>
                      {/* Gmail */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Gmail</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">shot</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${Math.min((totalGmail / Math.max(totalGmail, totalDaum)) * 100, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{totalGmail}건</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">open</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${Math.min((gmailOpened / Math.max(totalGmail, totalDaum)) * 100, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{gmailOpened}건</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">rate</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${gmailRate}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{gmailRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Daum */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900">Daum</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">shot</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${Math.min((totalDaum / Math.max(totalGmail, totalDaum)) * 100, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{totalDaum}건</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">open</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${Math.min((daumOpened / Math.max(totalGmail, totalDaum)) * 100, 100)}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{daumOpened}건</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-600 w-12">rate</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-lg h-3 shadow-inner">
                                <div 
                                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-lg shadow-md" 
                                  style={{width: `${daumRate}%`}}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-semibold w-16 text-right">{daumRate}%</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 세 번째 박스: 도넛 차트 */}
            <div className="bg-white shadow-lg rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">발송 비율</h3>
              <div className="h-48 flex items-center justify-center">
                {(() => {
                  const totalGmail = Object.values(stats).reduce((sum, day) => sum + (day.gmail || 0), 0);
                  const totalDaum = Object.values(stats).reduce((sum, day) => sum + (day.daum || 0), 0);
                  const totalOpened = Object.values(stats).reduce((sum, day) => sum + (day.opened || 0), 0);
                  const gmailOpened = Math.round(totalOpened * 0.5);
                  const daumOpened = Math.round(totalOpened * 0.5);
                  
                  const chartData = {
                    labels: ['Gmail', 'Daum'],
                    datasets: [
                      {
                        data: [totalGmail, totalDaum],
                        backgroundColor: [
                          'rgba(239, 68, 68, 0.8)',
                          'rgba(59, 130, 246, 0.8)'
                        ],
                        borderColor: [
                          'rgba(239, 68, 68, 1)',
                          'rgba(59, 130, 246, 1)'
                        ],
                        borderWidth: 3,
                        cutout: '60%',
                      },
                      {
                        data: [gmailOpened, daumOpened],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.6)',
                          'rgba(34, 197, 94, 0.6)'
                        ],
                        borderColor: [
                          'rgba(34, 197, 94, 1)',
                          'rgba(34, 197, 94, 1)'
                        ],
                        borderWidth: 2,
                        cutout: '80%',
                      }
                    ],
                  };

                  const options = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          font: {
                            size: 11
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            if (context.datasetIndex === 0) {
                              return `${context.label} 발송: ${context.parsed}건`;
                            } else {
                              return `${context.label} 오픈: ${context.parsed}건`;
                            }
                          }
                        }
                      }
                    }
                  };

                  return <Doughnut data={chartData} options={options} />;
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-center">로딩 중...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailStatsPage; 