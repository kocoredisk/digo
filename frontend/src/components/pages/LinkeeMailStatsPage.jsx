import React, { useState, useEffect } from 'react';

function LinkeeMailStatsPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  // 통계 데이터 조회
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/linkee-mails/stats?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('통계 조회 실패:', data.message);
      }
    } catch (error) {
      console.error('통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">링키홍보 발송 현황</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
            </select>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin h-8 w-8 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-gray-600">통계를 불러오는 중...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6">
          {/* 전체 통계 */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">전체 대상</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalTargets)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">발송완료</p>
                  <p className="text-3xl font-bold text-green-600">{formatNumber(stats.sentCount)}</p>
                  <p className="text-sm text-gray-500">
                    {formatPercentage(stats.sentCount, stats.totalTargets)} 성공률
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">실패</p>
                  <p className="text-3xl font-bold text-red-600">{formatNumber(stats.failedCount)}</p>
                  <p className="text-sm text-gray-500">
                    {formatPercentage(stats.failedCount, stats.totalTargets)} 실패률
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">수신거부</p>
                  <p className="text-3xl font-bold text-gray-600">{formatNumber(stats.optoutCount)}</p>
                  <p className="text-sm text-gray-500">
                    {formatPercentage(stats.optoutCount, stats.totalTargets)} 거부률
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-full">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* 캠페인별 통계 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">캠페인별 통계</h2>
              </div>
              <div className="p-6">
                {stats.campaignStats ? (
                  <div className="space-y-4">
                    {Object.entries(stats.campaignStats).map(([campaign, data]) => (
                      <div key={campaign} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{campaign}</h3>
                          <span className="text-sm text-gray-500">
                            {formatNumber(data.total)}개 대상
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{formatNumber(data.sent)}</div>
                            <div className="text-sm text-gray-600">발송완료</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">{formatNumber(data.failed)}</div>
                            <div className="text-sm text-gray-600">실패</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">{formatNumber(data.pending)}</div>
                            <div className="text-sm text-gray-600">대기</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>진행률</span>
                            <span>{formatPercentage(data.sent + data.failed, data.total)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((data.sent + data.failed) / data.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    캠페인 데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 발송 계정별 통계 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">발송 계정별 통계</h2>
              </div>
              <div className="p-6">
                {stats.providerStats ? (
                  <div className="space-y-4">
                    {Object.entries(stats.providerStats).map(([provider, data]) => (
                      <div key={provider} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {provider === 'gmail' ? 'Gmail' : 
                             provider === 'daum' ? 'Daum' : 
                             provider === 'naver' ? 'Naver' : provider}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {formatNumber(data.total)}개 발송
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-green-600">{formatNumber(data.sent)}</div>
                            <div className="text-sm text-gray-600">성공</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-red-600">{formatNumber(data.failed)}</div>
                            <div className="text-sm text-gray-600">실패</div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>성공률</span>
                            <span>{formatPercentage(data.sent, data.total)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(data.sent / data.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    발송 계정 데이터가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 일별 트렌드 */}
          {stats.dailyStats && stats.dailyStats.length > 0 && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">일별 발송 트렌드</h2>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발송완료</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실패</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수신거부</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성공률</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.dailyStats.map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatNumber(day.sent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {formatNumber(day.failed)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatNumber(day.optout)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatPercentage(day.sent, day.sent + day.failed)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LinkeeMailStatsPage; 