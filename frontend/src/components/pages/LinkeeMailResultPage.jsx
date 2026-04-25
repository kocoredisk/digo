import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'sent', label: '성공' },
  { value: 'failed', label: '실패' },
  { value: 'pending', label: '대기' },
];

function LinkeeMailResultPage() {
  const [fromDate, setFromDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  // 조회 함수
  const fetchResults = async () => {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
      status: status,
      search: search,
    });
    const res = await fetch(`/api/linkee-mails/results?${params.toString()}`);
    const data = await res.json();
    if (data.success) setResults(data.items);
    else setResults([]);
  };

  // 페이지 로드 시 자동 조회
  useEffect(() => {
    fetchResults();
  }, []);

  // 통계 계산
  const total = results.length;
  const success = results.filter(r => r.status === 'sent').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const pending = results.filter(r => r.status === 'pending').length;

  // provider별 통계 계산
  const providerStats = ['Gmail', 'Daum', 'Naver'].map(provider => {
    const rows = results.filter(r => (r.email_provider || 'Gmail').toLowerCase() === provider.toLowerCase());
    return {
      provider,
      total: rows.length,
      success: rows.filter(r => r.status === 'sent').length,
      failed: rows.filter(r => r.status === 'failed').length,
    };
  });

  // 실패 항목만 필터링
  const filteredResults = showFailedOnly ? results.filter(item => item.status === 'failed') : results;
  
  // 결과를 최신순(큰 번호가 위)으로 역순 정렬
  const displayResults = filteredResults;

  // 전체 선택/해제
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(displayResults.map(item => item.id));
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

  // 실패 항목 재시도
  const handleRetryFailed = async () => {
    if (selectedItems.length === 0) {
      alert('재시도할 실패 항목을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedItems.length}개의 실패 항목을 다시 대기 상태로 변경하시겠습니까?`)) {
      return;
    }
    try {
      const res = await fetch('/api/linkee-mails/retry-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds: selectedItems })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.updated}개 항목이 대기 상태로 변경되었습니다.`);
        setSelectedItems([]);
        fetchResults();
      } else {
        alert('재시도 실패: ' + (data.message || '오류'));
      }
    } catch (err) {
      alert('재시도 중 오류 발생');
    }
  };

  // 선택 항목 제거
  const handleRemoveFailed = async () => {
    if (selectedItems.length === 0) {
      alert('제거할 항목을 선택해주세요.');
      return;
    }
    if (!window.confirm(`선택한 ${selectedItems.length}개의 항목을 완전히 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    try {
      const res = await fetch('/api/linkee-mails/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIds: selectedItems })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${data.removed}개 항목이 제거되었습니다.`);
        setSelectedItems([]);
        fetchResults();
      } else {
        alert('제거 실패: ' + (data.message || '오류'));
      }
    } catch (err) {
      alert('제거 중 오류 발생');
    }
  };

  return (
    <div style={{ width: 1850, minWidth: 1850 }}>
      <div style={{ height: 16 }} />
      <h2 className="pl-2 text-xl font-bold mb-2">3. 링키홍보 발송 결과</h2>
      {/* 조회 조건: 라벨 없이 compact */}
      <div className="flex gap-2 mb-2 items-end">
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border px-2 py-1 rounded text-sm" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border px-2 py-1 rounded text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border px-2 py-1 rounded text-sm">
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이메일/고객명" className="border px-2 py-1 rounded text-sm" />
        <button onClick={fetchResults} className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm ml-2">조회</button>
        
        {/* 필터 및 작업 버튼 */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setShowFailedOnly(!showFailedOnly)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              showFailedOnly 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showFailedOnly ? '전체 보기' : '실패만 보기'}
          </button>
          
          {/* 선택된 항목에 대한 작업 버튼 */}
          <button
            onClick={handleRetryFailed}
            disabled={selectedItems.length === 0}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            선택 재시도 ({selectedItems.length})
          </button>
          <button
            onClick={handleRemoveFailed}
            disabled={selectedItems.length === 0}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            선택 항목 삭제 ({selectedItems.length})
          </button>
        </div>
        
        {/* 통계 요약: 우측 끝 */}
        <div className="flex-1"></div>
        <div className="flex gap-4 items-center text-xs font-semibold text-gray-700">
          <span>총 <span className="text-blue-700">{total}</span>건</span>
          <span>성공 <span className="text-green-700">{success}</span></span>
          <span>실패 <span className="text-red-700">{failed}</span></span>
          {providerStats.map(stat => (
            <span key={stat.provider} className="ml-4">
              [{stat.provider}] {stat.total}건 / 성공 {stat.success} / 실패 {stat.failed}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full" style={{ maxWidth: '100%', width: 1850, minWidth: 1850, overflowX: 'auto' }}>
        <div style={{ maxHeight: 650, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="bg-blue-900">
                <th className="border px-2 py-1 sticky left-0 bg-blue-900 text-white z-30">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === displayResults.length && displayResults.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="border px-2 py-1 text-white">번호</th>
                <th className="border px-2 py-1 text-white">발송일시</th>
                <th className="border px-2 py-1 text-white">이메일</th>
                <th className="border px-2 py-1 text-white">고객명</th>
                <th className="border px-2 py-1 text-white">캠페인</th>
                <th className="border px-2 py-1 text-white">추출번호</th>
                <th className="border px-2 py-1 text-white">실패사유</th>
                <th className="border px-2 py-1 text-white">발송계정</th>
                <th className="border px-2 py-1 text-white">상태</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-gray-400">데이터 없음</td></tr>
              ) : (
                displayResults.map((row, idx) => {
                  // 상태 배지 색상
                  let statusColor = 'bg-gray-200 text-gray-700';
                  let statusLabel = row.status;
                  if (row.status === 'sent') {
                    statusColor = 'bg-green-100 text-green-700';
                    statusLabel = '성공';
                  } else if (row.status === 'failed') {
                    statusColor = 'bg-red-100 text-red-700';
                    statusLabel = '실패';
                  } else if (row.status === 'pending') {
                    statusColor = 'bg-yellow-100 text-yellow-800';
                    statusLabel = '진행중';
                  }
                  
                  return (
                    <tr key={row.id}>
                      <td className="border px-2 py-1 text-center sticky left-0 bg-white z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(row.id)}
                          onChange={e => handleSelectItem(row.id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="border px-2 py-1 text-center">{displayResults.length - idx}</td>
                      <td className="border px-2 py-1">{row.sent_at || row.created_at}</td>
                      <td className="border px-2 py-1">{row.email}</td>
                      <td className="border px-2 py-1">{row.name}</td>
                      <td className="border px-2 py-1">{row.campaign_round}</td>
                      <td className="border px-2 py-1">{row.extraction_number}</td>
                                                      <td className="border px-2 py-1">-</td>
                      <td className="border px-2 py-1">{row.email_provider ? row.email_provider.charAt(0).toUpperCase() + row.email_provider.slice(1) : '-'}</td>
                      <td className={`border px-2 py-1`}><span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>{statusLabel}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LinkeeMailResultPage; 