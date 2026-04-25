import React from 'react';

function CatchingApplicantStatusPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        <div className="text-6xl mb-4">📋</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">신청자 현황</h1>
        <p className="text-lg text-gray-600 mb-6">신청 리스트 보기, 유입경로/성과 분석</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-medium">준비중입니다...</p>
          <p className="text-blue-600 text-sm mt-2">
            이 페이지에서는 신청 리스트 보기와 유입경로/성과 분석을 할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CatchingApplicantStatusPage; 