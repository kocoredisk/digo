import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaTimes, FaPlay, FaStop, FaSync } from 'react-icons/fa';

const JobKoreaCrawlingPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logContent, setLogContent] = useState('');

  // 크롤링 기록 조회
  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/crawl/jobkorea-history');
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (error) {
      console.error('기록 조회 실패:', error);
    }
  };

  // 크롤링 실행
  const startCrawling = async () => {
    setIsRunning(true);
    try {
      await axios.post('/api/crawl/jobkorea');
      setTimeout(fetchHistory, 1000);
    } catch (error) {
      setIsRunning(false);
    }
  };

  // 크롤링 종료
  const stopCrawling = async () => {
    try {
      await axios.post('/api/crawl/jobkorea-stop');
      setIsRunning(false);
    } catch (error) {
      console.error('크롤링 종료 실패:', error);
    }
  };

  // 크롤러 상태 폴링
  useEffect(() => {
    fetchHistory();
    let interval = setInterval(async () => {
      try {
        const res = await axios.get('/api/crawl/jobkorea-status');
        setIsRunning(!!res.data.running);
        if (!res.data.running) {
          fetchHistory(); // 종료 시 기록 갱신
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusText = (record) => {
    if (record.status === '진행 중') return '진행 중';
    if (record.exitCode === 0) return '완료';
    return '오류';
  };

  const getStatusColor = (record) => {
    if (record.status === '진행 중') return 'text-blue-600';
    if (record.exitCode === 0) return 'text-green-600';
    return 'text-red-600';
  };

  // 시간 형식 변환
  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // 로그 파일 내용 조회 (기존 로그 파일 API 사용)
  const fetchLogContent = async (record) => {
    try {
      // 로그 파일명 생성 (날짜 기반)
      const date = new Date(record.startTime);
      const filename = `jobkorea_${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}.log`;
      const response = await axios.get(`/api/crawl/jobkorea-logfile/${filename}?content=true`);
      if (response.data.success) {
        setLogContent(response.data.content || '로그 내용을 불러올 수 없습니다.');
        setSelectedLog(filename);
      }
    } catch (error) {
      console.error('로그 파일 내용 조회 실패:', error);
      setLogContent('로그 파일을 불러오는데 실패했습니다.');
      setSelectedLog('로그');
    }
  };

  // 로그 팝업 닫기
  const closeLogPopup = () => {
    setSelectedLog(null);
    setLogContent('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">잡코리아 크롤링 관리</h1>
      
      {/* 크롤링 제어 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold">크롤링 제어</h2>
            <div className="text-sm text-gray-600 mt-1">크롤링 상태: <span className={isRunning ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{isRunning ? '크롤링 중' : '대기 중'}</span></div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={startCrawling}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <FaPlay className="text-sm" />
              <span>크롤링 시작</span>
            </button>
            <button
              onClick={stopCrawling}
              disabled={!isRunning}
              className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                !isRunning
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              <FaStop className="text-sm" />
              <span>종료</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* 크롤링 기록 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">크롤링 기록</h2>
          <button
            onClick={fetchHistory}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <FaSync className="text-sm" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 font-semibold">일자</th>
                <th className="px-3 py-2 font-semibold">시작시간</th>
                <th className="px-3 py-2 font-semibold">종료시간</th>
                <th className="px-3 py-2 font-semibold">상태</th>
                <th className="px-3 py-2 font-semibold">조회수</th>
                <th className="px-3 py-2 font-semibold">수집수</th>
                <th className="px-3 py-2 font-semibold">로그</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{record.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatTime(record.startTime)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatTime(record.endTime)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={getStatusColor(record)}>{getStatusText(record)}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.tried ?? '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{record.found ?? '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      onClick={() => fetchLogContent(record)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      로그
                    </button>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">크롤링 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 로그 상세 팝업 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">로그 상세 - {selectedLog}</h3>
              <button
                onClick={closeLogPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
              {logContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobKoreaCrawlingPage; 
export default JobKoreaCrawlingPage; 