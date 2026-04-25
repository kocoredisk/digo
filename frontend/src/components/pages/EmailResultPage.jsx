import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'success', label: '성공' },
  { value: 'failed', label: '실패' },
  { value: 'pending', label: '대기' },
];

function EmailResultPage() {
  const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  // 조회 함수
  const fetchResults = async () => {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
      status: status,
      search: search,
    });
    const res = await fetch(`/api/email-results?${params.toString()}`);
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
  const success = results.filter(r => r.status === '성공').length;
  const failed = results.filter(r => r.status === '실패').length;
  const pending = results.filter(r => r.status === '대기' || r.status === '진행중').length;
  const opened = results.filter(r => r.status === '성공' && r.opened_date).length;
  const openRate = success > 0 ? Math.round((opened / success) * 100) : 0;

  // provider별 통계 계산
  const providerStats = ['Gmail', 'Daum'].map(provider => {
    const rows = results.filter(r => (r.email_provider || 'Gmail').toLowerCase() === provider.toLowerCase());
    return {
      provider,
      total: rows.length,
      success: rows.filter(r => r.status === '성공').length,
      failed: rows.filter(r => r.status === '실패').length,
      pending: rows.filter(r => r.status === '대기' || r.status === '진행중').length,
      opened: rows.filter(r => r.status === '성공' && r.opened_date).length,
    };
  });

  // 결과를 최신순(큰 번호가 위)으로 역순 정렬
  const displayResults = results;

  return (
    <div style={{ width: 1850, minWidth: 1850 }}>
      <div style={{ height: 16 }} />
      <h2 className="pl-2 text-xl font-bold mb-2">3. 발송 결과</h2>
      {/* 조회 조건: 라벨 없이 compact */}
      <div className="flex gap-2 mb-2 items-end">
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border px-2 py-1 rounded text-sm" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border px-2 py-1 rounded text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="border px-2 py-1 rounded text-sm">
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="이메일/고객명" className="border px-2 py-1 rounded text-sm" />
        <button onClick={fetchResults} className="bg-blue-600 text-white px-2 py-1 rounded font-semibold text-sm ml-2">조회</button>
        {/* 통계 요약: 우측 끝 */}
        <div className="flex-1"></div>
        <div className="flex gap-4 items-center text-xs font-semibold text-gray-700">
          <span>총 <span className="text-blue-700">{total}</span>건</span>
          <span>성공 <span className="text-green-700">{success}</span></span>
          <span>실패 <span className="text-red-700">{failed}</span></span>
          <span>진행중 <span className="text-yellow-700">{pending}</span></span>
          <span>수신확인 <span className="text-blue-600">{opened}</span></span>
          <span>개봉률 <span className="text-blue-900">{openRate}%</span></span>
          {providerStats.map(stat => (
            <span key={stat.provider} className="ml-4">
              [{stat.provider}] {stat.total}건 / 성공 {stat.success} / 실패 {stat.failed} / 진행중 {stat.pending} / 수신확인 {stat.opened}
            </span>
          ))}
        </div>
      </div>
      <div className="w-full" style={{ maxWidth: '100%', width: 1850, minWidth: 1850, overflowX: 'auto' }}>
        <div style={{ maxHeight: 650, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20">
              <tr className="bg-blue-900">
                <th className="border px-2 py-1 sticky left-0 bg-blue-900 text-white z-30">번호</th>
                <th className="border px-2 py-1 text-white">발송일시</th>
                <th className="border px-2 py-1 text-white">이메일</th>
                <th className="border px-2 py-1 text-white">고객명</th>
                <th className="border px-2 py-1 text-white">캠페인</th>
                <th className="border px-2 py-1 text-white">실패사유</th>
                <th className="border px-2 py-1 text-white">발송계정</th>
                <th className="border px-2 py-1 text-white">상태</th>
                <th className="border px-2 py-1 sticky right-0 bg-blue-900 text-white z-30">수신확인</th>
              </tr>
            </thead>
            <tbody>
              {displayResults.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">데이터 없음</td></tr>
              ) : (
                displayResults.map((row, idx) => {
                  // 상태 배지 색상
                  let statusColor = 'bg-gray-200 text-gray-700';
                  let statusLabel = row.status;
                  if (row.status === '성공') {
                    statusColor = 'bg-green-100 text-green-700';
                  } else if (row.status === '실패') {
                    statusColor = 'bg-red-100 text-red-700';
                  } else if (row.status === '대기' || row.status === '진행중') {
                    statusColor = 'bg-yellow-100 text-yellow-800';
                    statusLabel = '진행중';
                  }
                  // 수신확인 로직
                  let opened = '-';
                  if (row.status === '성공' && row.opened_date) {
                    opened = <span className="text-blue-600 font-bold">{row.opened_date}</span>;
                  } else if (row.status === '성공') {
                    opened = <span className="text-gray-400">미개봉</span>;
                  }
                  return (
                    <tr key={row.id}>
                      <td className="border px-2 py-1 text-center sticky left-0 bg-white z-10">{displayResults.length - idx}</td>
                      <td className="border px-2 py-1">{row.sent_at || row.created_at}</td>
                      <td className="border px-2 py-1">{row.email}</td>
                      <td className="border px-2 py-1">{row.name}</td>
                      <td className="border px-2 py-1">{row.send_order}</td>
                      <td className="border px-2 py-1">{row.error_message || '-'}</td>
                      <td className="border px-2 py-1">{row.email_provider ? row.email_provider.charAt(0).toUpperCase() + row.email_provider.slice(1) : '-'}</td>
                      <td className={`border px-2 py-1`}><span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>{statusLabel}</span></td>
                      <td className="border px-2 py-1 text-center sticky right-0 bg-white z-10">{opened}</td>
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

export default EmailResultPage; 