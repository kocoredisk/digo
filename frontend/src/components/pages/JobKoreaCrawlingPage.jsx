import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaTimes, FaPlay, FaStop, FaSync, FaSpinner, FaCheck } from 'react-icons/fa';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { v4 as uuidv4 } from 'uuid';
dayjs.extend(utc);
dayjs.extend(timezone);

// 카테고리 정의
const CATEGORIES = [
  { id: 'account', name: '경리', script: '1-account-scrap.js', defaultPages: '1-10' },
  { id: 'tax', name: '세무사', script: '2-tax-scrap.js', defaultPages: '1-50' },
  { id: 'work', name: '노무사', script: '3-work-scrap.js', defaultPages: '1-20' },
  { id: 'startup', name: '스타트업', script: '4-startup-scrap.js', defaultPages: '1-15' },
];

const JobKoreaCrawlingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('account');
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logContent, setLogContent] = useState('');
  const [pageRange, setPageRange] = useState({ start: 1, end: 10 });
  
  // 타이머 관련 상태
  const [startTime, setStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentCrawlId, setCurrentCrawlId] = useState(null);
  const [resultPopup, setResultPopup] = useState(null);
  const [crawlerStatus, setCrawlerStatus] = useState({ isRunning: false, jobs: [] });

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

  // 크롤링 실행 - 오류 처리 개선
  const startCrawling = async () => {
    setIsRunning(true);
    setStartTime(new Date());
    try {
      const selectedCat = CATEGORIES.find(cat => cat.id === selectedCategory);
      const crawlId = uuidv4();
      // 1. 기록 생성 + 크롤러 실행까지 서버에서 처리
      const response = await axios.post('/api/crawl/jobkorea-start', {
        id: crawlId,
        category: selectedCat.name,
        keyword: selectedCat.keyword || '',
        startTime: new Date().toISOString(),
        status: '진행중',
        user_id: '',
        script: selectedCat.script,
        startPage: pageRange.start,
        endPage: pageRange.end
      });
      
      if (response.data.success) {
        setCurrentCrawlId(crawlId);
        // 크롤링 시작 성공 시 기록 새로고침
        fetchHistory();
      } else {
        // 이미 실행 중인 경우
        if (response.data.currentJob) {
          alert(`이미 크롤러가 실행 중입니다.\n카테고리: ${response.data.currentJob.category}\n시작시간: ${new Date(response.data.currentJob.startTime).toLocaleString()}`);
          // 현재 실행 중인 작업 정보로 상태 업데이트
          setCurrentCrawlId(response.data.currentJob.id);
          setStartTime(new Date(response.data.currentJob.startTime));
        } else {
          alert('크롤러 시작에 실패했습니다.');
        }
        setIsRunning(false);
        setStartTime(null);
        setCurrentCrawlId(null);
      }
    } catch (error) {
      setIsRunning(false);
      setStartTime(null);
      setCurrentCrawlId(null);
      
      if (error.response?.data?.message) {
        alert('크롤러 시작 에러: ' + error.response.data.message);
      } else {
        alert('크롤러 시작 에러: ' + (error?.message || error));
      }
    }
  };

  // 크롤링 종료
  const stopCrawling = async () => {
    try {
      await axios.post('/api/crawl/jobkorea-stop');
      setIsRunning(false);
      setStartTime(null);
      setCurrentCrawlId(null);
      // 크롤링 종료 시 기록 새로고침
      fetchHistory();
    } catch (error) {
      console.error('크롤링 종료 실패:', error);
    }
  };

  // 결과 확인
  const checkResult = async () => {
    try {
      const response = await axios.get('/api/crawl/jobkorea-history');
      if (response.data.success) {
        const records = response.data.history;
        let currentRecord;
        if (currentCrawlId) {
          currentRecord = records.find(r => r.id === currentCrawlId);
        } else {
          currentRecord = records.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))[0];
        }
        if (!currentRecord) {
          setResultPopup('크롤링 기록을 찾을 수 없습니다.');
          return;
        }
        let message = `📄 잡코리아 크롤링 결과\n`;
        message += `• 카테고리: ${currentRecord.category}\n`;
        message += `• 상태: ${currentRecord.status}\n`;
        message += `• 시작: ${currentRecord.startTime ? dayjs(currentRecord.startTime).format('YYYY-MM-DD HH:mm:ss') : '-'}\n`;
        message += `• 종료: ${currentRecord.endTime ? dayjs(currentRecord.endTime).format('YYYY-MM-DD HH:mm:ss') : '-'}\n`;
        message += `• 페이지: ${currentRecord.startPage || '-'} ~ ${currentRecord.endPage || '-'}\n`;
        message += `• 총조회: ${currentRecord.tried || 0}건\n`;
        message += `• 수집: ${currentRecord.found || 0}건`;
        if (currentRecord.endTime) {
          message += `\n\n✅ 크롤링이 종료되었습니다! (상태: ${currentRecord.status})`;
        } else {
          message += `\n\n⏳ 크롤링이 아직 진행 중입니다.`;
        }
        setResultPopup(message);
        // 상태가 종료(완료/중단/오류)이면 자동으로 대기 상태로 전환
        if (["완료", "중단됨", "오류"].includes(currentRecord.status) || currentRecord.endTime) {
          setIsRunning(false);
        }
      } else {
        setResultPopup('크롤링 기록을 불러오지 못했습니다.');
      }
    } catch (error) {
      console.error('결과 확인 실패:', error);
      setResultPopup('결과 확인 중 오류가 발생했습니다.');
    }
  };

  // 크롤링 상태 확인 함수 - DB 기반으로 변경
  const checkCrawlerStatus = async () => {
    try {
      const response = await axios.get('/api/crawl/jobkorea-status');
      const status = response.data;
      setCrawlerStatus(status);
      console.log('크롤링 상태:', status);
      
      // DB에서 크롤링이 실행 중이면 로컬 상태도 업데이트
      if (status.running && status.currentJob) {
        setIsRunning(true);
        setCurrentCrawlId(status.currentJob.id);
        // 시작 시간 설정
        if (status.currentJob.startTime) {
          setStartTime(new Date(status.currentJob.startTime));
        }
      } else {
        setIsRunning(false);
        setCurrentCrawlId(null);
        setStartTime(null);
      }
    } catch (error) {
      console.error('크롤링 상태 조회 실패:', error);
      // 오류 시 안전하게 false로 설정
      setIsRunning(false);
      setCurrentCrawlId(null);
      setStartTime(null);
    }
  };

  // 타이머 업데이트
  useEffect(() => {
    fetchHistory();
    // 페이지 로드 시 크롤링 상태 확인
    checkCrawlerStatus();
    
    // 타이머는 경과 시간만 갱신
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 의존성 배열을 빈 배열로 되돌림

  // 경과 시간 계산
  const getElapsedTime = () => {
    if (!startTime) return '00:00:00';
    
    const elapsed = currentTime - startTime;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 시작 시간 포맷
  const getStartTimeString = () => {
    if (!startTime) return '-';
    return startTime.toLocaleString('ko-KR');
  };

  const getStatusText = (record) => {
    if (record.status === '진행중') return '진행 중';
    if (record.status === '완료') return '완료';
    if (record.status === '중단됨') return '중단됨';
    if (record.status === '오류') return '오류';
    return record.status || '알 수 없음';
  };

  const getStatusColor = (record) => {
    if (record.status === '진행중') return 'text-blue-600';
    if (record.status === '완료') return 'text-green-600';
    if (record.status === '중단됨') return 'text-yellow-600';
    if (record.status === '오류') return 'text-red-600';
    return 'text-gray-600';
  };

  // 시간 형식 변환 (KST)
  const formatTime = (isoString) => {
    if (!isoString) return '-';
    return dayjs(isoString).tz('Asia/Seoul').format('A hh:mm:ss');
  };

  // 날짜만 추출 (KST)
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return dayjs(isoString).tz('Asia/Seoul').format('YYYY-MM-DD');
  };

  // 총 소요 시간 계산
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '-';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${seconds}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds}초`;
    } else {
      return `${seconds}초`;
    }
  };

  // 로그 파일 내용 조회
  const fetchLogContent = async (record) => {
    try {
      // log_file이 절대경로면 파일명만 추출
      let filename = record.realtimeLogFile || record.logFile || 'allkeep0_final_result.md';
      if (filename.includes('/')) {
        filename = filename.split('/').pop();
      }
      const response = await axios.get(`/api/crawl/jobkorea-log/${encodeURIComponent(filename)}`);
      if (response.data.success) {
        setLogContent(response.data.content || '로그 내용을 불러올 수 없습니다.');
        setSelectedLog(filename);
      } else {
        setLogContent('로그 파일을 불러올 수 없습니다.');
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

  // 카테고리 변경 시 페이지 범위 업데이트
  useEffect(() => {
    const selectedCat = CATEGORIES.find(cat => cat.id === selectedCategory);
    if (selectedCat) {
      const [start, end] = selectedCat.defaultPages.split('-').map(Number);
      setPageRange({ start, end });
    }
  }, [selectedCategory]);

  const filteredRecords = history.filter(r => r.category === CATEGORIES.find(cat => cat.id === selectedCategory)?.name);

  // 총처리페이지 추출
  const getPageRange = (record) => {
    if (record.pageRange) return record.pageRange;
    if (record.startPage && record.endPage) return `${record.startPage}~${record.endPage}`;
    if (record.logFile) {
      // 로그 파일명에서 추출 불가, 기록에 없으면 '-'
      return '-';
    }
    return '-';
  };

  // 시간만 추출 (KST, 오전/오후 표기)
  const formatOnlyTime = (isoString) => {
    if (!isoString) return '-';
    return dayjs(isoString).tz('Asia/Seoul').format('A hh:mm:ss');
  };

  return (
    <div className="pt-6 pb-6">
      <h1 className="text-2xl font-bold mb-6 pl-2">잡코리아 크롤링 관리</h1>
      
      {/* 카테고리 탭 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              className={`px-24 py-3 rounded-t-lg font-medium transition-colors text-[16px] border-b-2 ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-orange-100 hover:text-orange-700'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 크롤링 제어 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">크롤링 시작</h2>
        
        {!isRunning ? (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium">페이지 범위:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pageRange.start}
                  onChange={(e) => setPageRange(prev => ({ ...prev, start: parseInt(e.target.value) || 1 }))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  min="1"
                />
                <span>~</span>
                <input
                  type="number"
                  value={pageRange.end}
                  onChange={(e) => setPageRange(prev => ({ ...prev, end: parseInt(e.target.value) || 1 }))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                  min="1"
                />
              </div>
              <span className="text-gray-500">
                (기본값: {CATEGORIES.find(cat => cat.id === selectedCategory)?.defaultPages})
              </span>
            </div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={startCrawling}
                disabled={isRunning}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <FaPlay />
                크롤링 시작
              </button>
              
              <button
                onClick={stopCrawling}
                disabled={!isRunning}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  !isRunning
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                <FaStop />
                크롤링 종료
              </button>
              
              {/* 크롤링 상태 표시 */}
              {crawlerStatus.isRunning && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-700 text-sm font-medium">
                    크롤링 실행 중 ({crawlerStatus.jobs.length}개 작업)
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {/* 시작 시간 */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">시작 시간</span>
              <span className="text-base font-semibold">{getStartTimeString()}</span>
            </div>
            {/* 페이지 범위 */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">페이지</span>
              <span className="text-base font-semibold">{pageRange.start}~{pageRange.end}페이지</span>
            </div>
            {/* 경과 시간 */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500">경과 시간</span>
              <span className="text-2xl font-mono text-blue-600 font-bold">{getElapsedTime()}</span>
            </div>
            {/* 스피너 - 경과 시간과 결과 확인 사이 */}
            <div className="flex flex-col items-center mx-8">
              <FaSpinner className="animate-spin text-blue-600" style={{ width: 40, height: 40 }} />
            </div>
            {/* 버튼들 */}
            <div className="flex items-center gap-3">
              <button onClick={checkResult} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center space-x-2">
                <FaCheck className="text-sm" />
                <span>결과 확인</span>
              </button>
              <button onClick={stopCrawling} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center space-x-2">
                <FaStop className="text-sm" />
                <span>중지</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 크롤링 기록 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">크롤링 기록</h2>
          <button
            onClick={fetchHistory}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-blue-100 text-blue-600 border border-gray-300 text-sm font-medium"
            title="새로고침"
            style={{ height: 32, minWidth: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            새로고침
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 text-center font-medium">날짜</th>
                <th className="px-3 py-2 text-center font-medium">시작 시간</th>
                <th className="px-3 py-2 text-center font-medium">종료 시간</th>
                <th className="px-3 py-2 text-center font-medium">페이지</th>
                <th className="px-3 py-2 text-center font-medium">총조회</th>
                <th className="px-3 py-2 text-center font-medium">수집</th>
                <th className="px-3 py-2 text-center font-medium">소요시간</th>
                <th className="px-3 py-2 text-center font-medium">로그</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.slice(0, 5).map((record) => (
                <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-center">{formatDate(record.startTime)}</td>
                  <td className="px-3 py-2 text-center">{formatOnlyTime(record.startTime)}</td>
                  <td className="px-3 py-2 text-center">{formatOnlyTime(record.endTime)}</td>
                  <td className="px-3 py-2 text-center">{getPageRange(record)}</td>
                  <td className="px-3 py-2 text-center">{Number.isFinite(record.tried) ? record.tried : 0}</td>
                  <td className="px-3 py-2 text-center">{Number.isFinite(record.found) ? record.found : 0}</td>
                  <td className="px-3 py-2 text-center">{calculateDuration(record.startTime, record.endTime)}</td>
                  <td className="px-3 py-2 text-center">
                    {(record.realtimeLogFile || record.logFile) && (
                      <button
                        onClick={() => fetchLogContent(record)}
                        className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                      >
                        로그
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">크롤링 기록이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 로그 팝업 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">로그 내용: {selectedLog}</h3>
              <button
                onClick={closeLogPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="overflow-auto max-h-[60vh] bg-gray-100 p-4 rounded">
              <pre className="text-sm whitespace-pre-wrap">{logContent}</pre>
            </div>
          </div>
        </div>
      )}

      {resultPopup && (
        <div style={{
          position: 'fixed', top: 80, left: 0, right: 0, margin: '0 auto',
          width: 420, minHeight: 260, background: '#fff', borderRadius: 16,
          boxShadow: '0 4px 24px #0002', zIndex: 9999, padding: 24, whiteSpace: 'pre-line',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{maxHeight: 420, overflowY: 'auto', width: '100%', fontSize: 16, marginBottom: 24}}>{resultPopup}</div>
          <button onClick={()=>setResultPopup(null)} style={{marginTop: 8, padding: '8px 32px', borderRadius: 8, background: '#0a6', color: '#fff', fontWeight: 600, fontSize: 16, border: 'none'}}>확인</button>
        </div>
      )}
    </div>
  );
};

export default JobKoreaCrawlingPage; 