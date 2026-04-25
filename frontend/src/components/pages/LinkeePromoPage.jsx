import React, { useEffect, useState } from 'react';

function LinkeePromoPage() {
  const [mailSets, setMailSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState({});
  const [addingSet, setAddingSet] = useState(false);
  const [dummySent, setDummySent] = useState({});
  const [tab, setTab] = useState('send'); // 'send' or 'optout'
  const [optoutList, setOptoutList] = useState([]);
  const [loadingOptout, setLoadingOptout] = useState(false);
  const [search, setSearch] = useState('');

  // 세트/일차별 데이터 불러오기
  const fetchSets = () => {
    setLoading(true);
    fetch('/api/linkee-mails/sets')
      .then(res => res.json())
      .then(data => {
        setMailSets(data);
        setLoading(false);
      });
  };

  // 수신거부 목록 불러오기
  const fetchOptout = () => {
    setLoadingOptout(true);
    fetch('/api/linkee-mails/optout')
      .then(res => res.json())
      .then(data => {
        setOptoutList(data);
        setLoadingOptout(false);
      });
  };

  useEffect(() => {
    if (tab === 'send') fetchSets();
    if (tab === 'optout') fetchOptout();
  }, [tab]);

  // 더미 메일 발송 버튼 클릭
  const handleSend = (batchNo) => {
    setSending(s => ({ ...s, [batchNo]: true }));
    setTimeout(() => {
      setDummySent(s => ({
        ...s,
        [batchNo]: new Date().toLocaleString('sv-SE', { hour12: false }).replace('T', ' ').slice(0, 19)
      }));
      setSending(s => ({ ...s, [batchNo]: false }));
    }, 1000);
  };

  // 발송 세트 추가 버튼 클릭 (카드에서만)
  const handleAddSet = async () => {
    setAddingSet(true);
    await fetch('/api/linkee-mails/add-set', { method: 'POST' });
    fetchSets();
    setAddingSet(false);
  };

  if (loading && tab === 'send') return <div>로딩 중...</div>;
  if (loadingOptout && tab === 'optout') return <div>로딩 중...</div>;

  return (
    <div style={{ width: 1850, margin: '0 auto', padding: 32 }}>
      {/* 상단 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setTab('send')}
          style={{
            background: tab === 'send' ? '#3958fd' : '#e5e7eb',
            color: tab === 'send' ? '#fff' : '#222',
            fontWeight: 700,
            fontSize: 17,
            border: 'none',
            borderRadius: 8,
            padding: '10px 32px',
            cursor: tab === 'send' ? 'default' : 'pointer',
            boxShadow: tab === 'send' ? '0 2px 8px #dbeafe' : 'none',
            transition: 'background 0.2s'
          }}>
          링키 홍보 메일 발송
        </button>
        <button
          onClick={() => setTab('optout')}
          style={{
            background: tab === 'optout' ? '#3958fd' : '#e5e7eb',
            color: tab === 'optout' ? '#fff' : '#222',
            fontWeight: 700,
            fontSize: 17,
            border: 'none',
            borderRadius: 8,
            padding: '10px 32px',
            cursor: tab === 'optout' ? 'default' : 'pointer',
            boxShadow: tab === 'optout' ? '0 2px 8px #dbeafe' : 'none',
            transition: 'background 0.2s'
          }}>
          수신거부 목록
        </button>
      </div>
      {/* 탭별 화면 */}
      {tab === 'send' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {mailSets.map((set, idx) => {
            const isSent = !!dummySent[set.batch_no];
            const sentAt = dummySent[set.batch_no];
            return (
              <div key={set.range}
                   style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24, minWidth: 320, background: '#fafbff', boxShadow: '0 2px 8px #eee' }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{idx + 1}번 발송</div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{set.range}</div>
                <div style={{ marginBottom: 8 }}>
                  발송상태: {isSent ? '✅ 발송완료' : '⏳ 대기'}
                </div>
                <div style={{ marginBottom: 8 }}>
                  {isSent && <span>발송시각: {sentAt}</span>}
                </div>
                <button
                  disabled={isSent || sending[set.batch_no]}
                  onClick={() => handleSend(set.batch_no)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    background: isSent ? '#d1d5db' : (sending[set.batch_no] ? '#a5b4fc' : '#3958fd'),
                    color: isSent ? '#888' : '#fff',
                    fontWeight: 700,
                    fontSize: 15,
                    border: 'none',
                    cursor: isSent ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}>
                  {isSent ? '발송완료' : (sending[set.batch_no] ? '발송 중...' : '메일 발송')}
                </button>
              </div>
            );
          })}
          {/* 발송 세트 추가 카드 */}
          <div
            onClick={addingSet ? undefined : handleAddSet}
            style={{
              border: '2px dashed #a5b4fc',
              borderRadius: 12,
              padding: 24,
              minWidth: 320,
              background: '#f3f4f6',
              boxShadow: '0 2px 8px #eee',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: addingSet ? 'not-allowed' : 'pointer',
              color: '#3958fd',
              fontWeight: 700,
              fontSize: 20
            }}>
            {addingSet ? '세트 추가 중...' : '+ 발송 세트 추가'}
          </div>
        </div>
      )}
      {tab === 'optout' && (
        <div style={{ marginTop: 24, maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
          <input
            type="text"
            placeholder="이메일 검색"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              marginBottom: 16,
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #ccc',
              fontSize: 15,
              width: 320
            }}
          />
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', boxShadow: '0 2px 8px #eee' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: 10, border: '1px solid #e5e7eb', fontWeight: 700, textAlign: 'left' }}>이메일</th>
                <th style={{ padding: 10, border: '1px solid #e5e7eb', fontWeight: 700, textAlign: 'right' }}>수신거부일</th>
              </tr>
            </thead>
            <tbody>
              {optoutList.filter(row => row.email.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', padding: 20, color: '#888' }}>수신거부 내역이 없습니다.</td>
                </tr>
              ) : (
                optoutList.filter(row => row.email.toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                  <tr key={row.email + i}>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'left' }}>{row.email}</td>
                    <td style={{ padding: 10, border: '1px solid #e5e7eb', textAlign: 'right' }}>{row.optout_at || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LinkeePromoPage; 