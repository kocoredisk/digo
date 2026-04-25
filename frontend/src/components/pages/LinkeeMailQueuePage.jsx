import React, { useState, useEffect } from 'react';

function LinkeeMailQueuePage() {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [queueStatus, setQueueStatus] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleHours, setScheduleHours] = useState('1');
  const [selectCount, setSelectCount] = useState('');

  // 큐 목록 조회
  const fetchQueueItems = async () => {
    try {
      console.log('링키홍보 큐 상태 조회 시작...');
      const response = await fetch('/api/linkee-mails/queue-status');
      const result = await response.json();
      console.log('링키홍보 큐 상태 응답:', result);
      if (result.success) {
        setQueueStatus(result.status);
      }

      console.log('링키홍보 큐 상세 목록 조회 시작...');
      const detailResponse = await fetch('/api/linkee-mails/queue-list');
      const detailResult = await detailResponse.json();
      console.log('링키홍보 큐 상세 목록 응답:', detailResult);
      if (detailResult.success) {
        setQueueItems(detailResult.items);
        console.log('링키홍보 큐 아이템 설정:', detailResult.items);
      }
    } catch (error) {
      console.error('링키홍보 큐 조회 실패:', error);
    }
  };

  // 큐 발송 처리
  const handleProcessQueue = async (emailProvider) => {
    if (selectedItems.length === 0) {
      alert('발송할 이메일을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedItems.length}개의 이메일을 ${emailProvider.toUpperCase()} 계정으로 발송하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/linkee-mails/process-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailProvider,
          selectedIds: selectedItems
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedItems([]);
        fetchQueueItems();
      } else {
        alert('큐 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('큐 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 순환 발송 처리 (구글→다음→네이버 순환)
  const handleRotatingProcessQueue = async () => {
    if (selectedItems.length === 0) {
      alert('발송할 이메일을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedItems.length}개의 이메일을 구글→다음→네이버 순환으로 발송하시겠습니까?\n\n각 포털마다 3초 간격으로 메일이 발송됩니다.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/linkee-mails/process-queue-rotating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIds: selectedItems
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedItems([]);
        fetchQueueItems();
      } else {
        alert('순환 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('순환 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 예약 순환 발송 처리 (5시간 후 구글→다음→네이버 순환)
  const handleDelayedRotatingProcessQueue = async () => {
    if (selectedItems.length === 0) {
      alert('발송할 이메일을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedItems.length}개의 이메일을 ${scheduleHours}시간 후 구글→다음→네이버 순환으로 예약발송하시겠습니까?\n\n${scheduleHours}시간 후에 자동으로 발송이 시작됩니다.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/linkee-mails/process-queue-delayed-rotating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIds: selectedItems,
          delayHours: parseInt(scheduleHours)
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelectedItems([]);
        fetchQueueItems();
      } else {
        alert('예약 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('예약 발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(queueItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 선택/해제
  const handleSelectItem = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 번호로 일괄 선택
  const handleSelectByCount = () => {
    const count = parseInt(selectCount);
    if (isNaN(count) || count <= 0) {
      alert('유효한 숫자를 입력해주세요.');
      return;
    }
    if (count > queueItems.length) {
      alert(`전체 ${queueItems.length}개 중에서 선택할 수 있습니다.`);
      return;
    }
    
    // 상위 N개 선택 (번호가 큰 것부터)
    const topItems = queueItems.slice(0, count);
    setSelectedItems(topItems.map(item => item.id));
    setSelectCount('');
  };

  useEffect(() => {
    fetchQueueItems();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">링키홍보 이메일 발송(Q)</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              대기: {queueStatus?.pending || 0} | 
              발송완료: {queueStatus?.sent || 0} | 
              실패: {queueStatus?.failed || 0}
            </div>
            <button
              onClick={fetchQueueItems}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              새로고침
            </button>
            
            {/* 번호로 일괄 선택 */}
            <input
              type="number"
              value={selectCount}
              onChange={e => setSelectCount(e.target.value)}
              placeholder="개수"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              min="1"
              max={queueItems.length}
            />
            <button
              onClick={handleSelectByCount}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              선택
            </button>
          </div>
        </div>
      </div>

      {/* 발송 버튼 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-700">
            선택된 {selectedItems.length}개
          </div>
          <button
            onClick={() => handleProcessQueue('gmail')}
            disabled={selectedItems.length === 0 || loading}
            className="px-6 h-8 py-0 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            style={{ minHeight: 32, height: 32 }}
          >
            {loading ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>발송 중...</span>
            ) : '구글계정으로 보내기'}
          </button>
          <button
            onClick={() => handleProcessQueue('daum')}
            disabled={selectedItems.length === 0 || loading}
            className="px-6 h-8 py-0 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            style={{ minHeight: 32, height: 32 }}
          >
            {loading ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>발송 중...</span>
            ) : '다음계정으로 보내기'}
          </button>
          <button
            onClick={() => handleProcessQueue('naver')}
            disabled={selectedItems.length === 0 || loading}
            className="px-6 h-8 py-0 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            style={{ minHeight: 32, height: 32 }}
          >
            {loading ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>발송 중...</span>
            ) : '네이버계정으로 보내기'}
          </button>
          <button
            onClick={() => handleRotatingProcessQueue()}
            disabled={selectedItems.length === 0 || loading}
            className="px-6 h-8 py-0 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            style={{ minHeight: 32, height: 32 }}
          >
            {loading ? (
              <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>순환 발송 중...</span>
            ) : '순환 발송 (구글→다음→네이버)'}
          </button>
          <button
            onClick={async () => {
              if (selectedItems.length === 0) {
                alert('삭제할 이메일을 선택하세요.');
                return;
              }
              if (!window.confirm('정말 삭제하시겠습니까?')) return;
              for (const id of selectedItems) {
                try {
                  const res = await fetch(`/api/linkee-mails/queue-item/${id}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (!data.success) {
                    alert('삭제 실패: ' + (data.message || '오류'));
                  }
                } catch (err) {
                  alert('삭제 중 오류 발생');
                }
              }
              fetchQueueItems();
              setSelectedItems([]);
            }}
            className="px-6 h-8 py-0 bg-gray-400 text-white rounded-md hover:bg-red-500 hover:text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-medium text-sm"
            style={{ minHeight: 32, height: 32 }}
            disabled={selectedItems.length === 0 || loading}
          >
            삭제
          </button>
          
          {/* 예약발송 (우측 끝) */}
          <div className="flex items-center space-x-2 ml-auto">
            <select
              value={scheduleHours}
              onChange={(e) => setScheduleHours(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: 32, height: 32 }}
            >
              <option value="1">1시간 후</option>
              <option value="2">2시간 후</option>
              <option value="3">3시간 후</option>
              <option value="4">4시간 후</option>
              <option value="5">5시간 후</option>
              <option value="6">6시간 후</option>
              <option value="7">7시간 후</option>
              <option value="8">8시간 후</option>
              <option value="9">9시간 후</option>
              <option value="10">10시간 후</option>
              <option value="11">11시간 후</option>
              <option value="12">12시간 후</option>
            </select>
            <button
              onClick={() => handleDelayedRotatingProcessQueue()}
              disabled={selectedItems.length === 0 || loading}
              className="px-6 h-8 py-0 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
              style={{ minHeight: 32, height: 32 }}
            >
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>예약 발송 중...</span>
              ) : '순환메일로 예약발송'}
            </button>
          </div>
        </div>
      </div>

      {/* 큐 목록 */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-white rounded-lg shadow" style={{ height: 600 }}>
          <div className="overflow-auto" style={{ height: '100%' }}>
            <table className="w-full">
              <thead className="bg-blue-900 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === queueItems.length && queueItems.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-white">번호</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">고객명</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">이메일</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">캠페인</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">등록일</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">상태</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {queueItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={e => handleSelectItem(item.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-center">{queueItems.length - index}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.campaign_round}-{item.extraction_number}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-2">
                      {item.status === 'pending' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">대기</span>
                      )}
                      {item.status === 'failed' && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">실패</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-red-500 hover:text-white text-xs"
                        onClick={async () => {
                          if (window.confirm('정말 삭제하시겠습니까?')) {
                            try {
                              const res = await fetch(`/api/linkee-mails/queue-item/${item.id}`, { method: 'DELETE' });
                              const data = await res.json();
                              if (data.success) {
                                fetchQueueItems();
                              } else {
                                alert('삭제 실패: ' + (data.message || '오류'));
                              }
                            } catch (err) {
                              alert('삭제 중 오류 발생');
                            }
                          }
                        }}
                      >삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {queueItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                큐에 대기 중인 이메일이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkeeMailQueuePage; 