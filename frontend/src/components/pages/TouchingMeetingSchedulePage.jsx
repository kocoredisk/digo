import React, { useState, useEffect } from 'react';

function TouchingMeetingSchedulePage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setMeetings([
        { id: 1, customer: '김철수', type: '상담', date: '2024-01-15', time: '14:30', location: '서울 강남구', status: '확정' },
        { id: 2, customer: '이영희', type: '계약', date: '2024-01-16', time: '10:00', location: '서울 서초구', status: '대기' },
        { id: 3, customer: '박민수', type: '상담', date: '2024-01-17', time: '16:00', location: '서울 마포구', status: '취소' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">미팅 스케줄 관리</h1>
        <p className="text-gray-600">고객과의 미팅 일정 및 장소 관리</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">미팅 일정</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                새 미팅 등록
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">미팅 유형</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">장소</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meeting.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        meeting.status === '확정' ? 'bg-green-100 text-green-800' :
                        meeting.status === '대기' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">수정</button>
                      <button className="text-red-600 hover:text-red-900">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default TouchingMeetingSchedulePage; 