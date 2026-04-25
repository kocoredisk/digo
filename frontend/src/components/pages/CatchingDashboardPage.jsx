import React from 'react';

function CatchingDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">📥</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Catching 대시보드</h1>
        <p className="text-lg text-gray-600 mb-6">신청 현황 요약, 랜딩페이지 성과, 유입 경로 분석</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">준비중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">
            이 페이지에서는 신청 현황 요약, 랜딩페이지 성과, 유입 경로 분석을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CatchingDashboardPage; 