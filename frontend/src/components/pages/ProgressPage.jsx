import React, { useState, useEffect } from 'react';
import { FaSpinner, FaLink, FaTrash, FaTimesCircle, FaEnvelope, FaSms, FaCheckCircle, FaPhone } from 'react-icons/fa';

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function getNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const STATUS_OPTIONS = [
  '최초등록',
  '이메일컨택',
  '문자컨택',
  '통화컨택',
  '무관심',
  '거절',
  '컨택성공',
];

// 카테고리 정의
const CATEGORIES = [
  { id: '경리', name: '경리' },
  { id: '세무사', name: '세무사' },
  { id: '노무사', name: '노무사' },
  { id: '스타트업', name: '스타트업' },
];

function getCategoryPrefix(category) {
  switch (category) {
    case '경리': return 'A';
    case '세무사': return 'T';
    case '노무사': return 'W';
    case '스타트업': return 'S';
    default: return 'X';
  }
}

function ProgressPage() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [filter, setFilter] = useState('미발송');
  const [loading, setLoading] = useState(false);
  const [isSending1, setIsSending1] = useState(false);
  const [isSending2, setIsSending2] = useState(false);
  const [isSending3, setIsSending3] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [popupLink, setPopupLink] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('경리'); // 기본값 경리
  const [filterState, setFilterState] = useState({
    status: '전체',
    startDate: getNDaysAgo(7),
    endDate: getToday(),
    search: '',
  });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [period, setPeriod] = useState({
    startDate: getNDaysAgo(7),
    endDate: getToday(),
  });
  const [search, setSearch] = useState('');
  const [allCategoryData, setAllCategoryData] = useState({});

  // 정렬 함수
  const sortCustomers = (data) => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      if (!a.regDate || !b.regDate || a.regDate === b.regDate) {
        return (b.id || 0) - (a.id || 0);
      }
      return new Date(b.regDate) - new Date(a.regDate);
    });
  };

  // 모든 카테고리 데이터 한 번에 fetch
  const fetchCustomers = async () => {
    const result = {};
    for (const cat of CATEGORIES) {
      const params = new URLSearchParams({
        category: cat.id,
        startDate: period.startDate,
        endDate: period.endDate
      });
      const response = await fetch(`/api/customers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        result[cat.id] = data;
      } else {
        result[cat.id] = [];
      }
    }
    setAllCategoryData(result);
    setCustomers(result[selectedCategory] || []);
  };

  useEffect(() => {
    fetchCustomers();
  }, [period.startDate, period.endDate]);

  // 고객 삭제
  const handleDeleteCustomer = async (customerId, customerName) => {
    if (window.confirm(`'${customerName}' 고객 정보를 정말 삭제하시겠습니까?`)) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (result.success) {
          fetchCustomers(); // 목록 새로고침
        } else {
          alert('삭제 실패: ' + result.message);
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 링크 팝업 열기
  const handleOpenLink = (link) => {
    if (!link) {
      alert('링크가 없습니다.');
      return;
    }
    setPopupLink(link);
  };

  // 팝업 닫기
  const handleClosePopup = () => {
    setPopupLink('');
  };

  // 필터별 고객 수 계산 (카테고리별)
  const getFilterCounts = (data) => {
    const filtered = data.filter(c => c.email && c.email.trim() !== '' && c.category === selectedCategory);
    return {
      '미발송': filtered.filter(c => !c.is_excluded && (!c.first_sent_date || c.first_sent_date === '')).length,
      '1차발송': filtered.filter(c => !c.is_excluded && c.first_sent_date && (!c.second_sent_date || c.second_sent_date === '')).length,
      '2차발송': filtered.filter(c => !c.is_excluded && c.first_sent_date && c.second_sent_date && (!c.third_sent_date || c.third_sent_date === '')).length,
      '3차발송': filtered.filter(c => !c.is_excluded && c.first_sent_date && c.second_sent_date && c.third_sent_date).length,
      '대상제외': filtered.filter(c => c.is_excluded === 1).length
    };
  };

  // 필터 적용 (카테고리별)
  const applyFilter = (data, filterType) => {
    let filtered = [...data].filter(c => c.email && c.email.trim() !== '' && c.category === selectedCategory);
    switch (filterType) {
      case '미발송':
        filtered = filtered.filter(c => !c.is_excluded && (!c.first_sent_date || c.first_sent_date === ''));
        break;
      case '1차발송':
        filtered = filtered.filter(c => !c.is_excluded && c.first_sent_date && (!c.second_sent_date || c.second_sent_date === ''));
        break;
      case '2차발송':
        filtered = filtered.filter(c => !c.is_excluded && c.first_sent_date && c.second_sent_date && (!c.third_sent_date || c.third_sent_date === ''));
        break;
      case '3차발송':
        filtered = filtered.filter(c => !c.is_excluded && c.first_sent_date && c.second_sent_date && c.third_sent_date);
        break;
      case '대상제외':
        filtered = filtered.filter(c => c.is_excluded === 1);
        break;
      default:
        break;
    }
    setFilteredCustomers(filtered);
    
    // 선택된 고객들이 현재 필터에 없는 경우 선택 해제
    const filteredIds = filtered.map(c => c.id);
    setSelectedCustomers(prev => prev.filter(id => filteredIds.includes(id)));
  };

  // 필터 변경 시
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // filter, customers, selectedCategory가 바뀔 때마다 자동 필터 적용
  useEffect(() => {
    applyFilter(customers, filter);
  }, [customers, filter, selectedCategory]);

  // 전체 선택/해제
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // 최대 450개 선택 (큰 번호부터 역순으로)
  const handleSelectMax450 = () => {
    if (filteredCustomers.length === 0) return;
    
    const maxSelect = 450;
    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
      // SN 기준으로 정렬 (큰 번호가 먼저)
      const snA = a.sn || '';
      const snB = b.sn || '';
      
      // SN에서 숫자 부분 추출
      const numA = parseInt(snA.replace(/\D/g, '')) || 0;
      const numB = parseInt(snB.replace(/\D/g, '')) || 0;
      
      return numB - numA; // 내림차순 (큰 번호가 먼저)
    });
    
    const selectedIds = sortedCustomers.slice(0, maxSelect).map(c => c.id);
    setSelectedCustomers(selectedIds);
  };

  // 개별 선택/해제
  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, id]);
    } else {
      setSelectedCustomers(prev => prev.filter(_id => _id !== id));
    }
  };

  // 큐 상태 수동 확인
  const checkQueueStatus = async () => {
    try {
      const response = await fetch('/api/email-queue-status');
      const status = await response.json();
      setQueueStatus(status);
      
      let message = `📧 이메일 큐 상태:\n`;
      message += `• 대기중: ${status.pending || 0}건\n`;
      message += `• 오늘 발송 완료: ${status.sent || 0}건\n`;
      message += `• 오늘 발송 실패: ${status.failed || 0}건\n`;
      message += `• 전체: ${status.total || 0}건`;
      
      if (status.pending === 0) {
        message += `\n\n✅ 큐가 비어있습니다.`;
      } else {
        message += `\n\n⏳ ${status.pending}건이 발송 대기중입니다.`;
      }
      
      alert(message);
    } catch (error) {
      console.error('큐 상태 조회 실패:', error);
      alert('큐 상태 조회 중 오류가 발생했습니다.');
    }
  };

  // 일괄 이메일 발송
  const handleBulkEmailSend = async (campaignType, setIsSending) => {
    if (selectedCustomers.length === 0) {
      alert('발송할 고객을 선택해주세요.');
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch('/api/send-bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          campaignType,
          currentFilter: filter // 현재 필터 상태 전달
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(result.message);
        // 즉시 선택 해제
        setSelectedCustomers([]);
        // 데이터 새로고침
        fetchCustomers();
      } else {
        alert('이메일 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  // 선택된 고객들을 대상제외 처리
  const handleBulkExclude = async () => {
    if (selectedCustomers.length === 0) {
      alert('대상제외할 고객을 선택해주세요.');
      return;
    }
    
    if (window.confirm(`선택된 ${selectedCustomers.length}명의 고객을 대상제외로 처리하시겠습니까?`)) {
      try {
        const response = await fetch('/api/customers/exclude', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: selectedCustomers
          }),
        });
        const result = await response.json();
        
        if (result.success) {
          alert(`${result.updated}명의 고객이 대상제외로 처리되었습니다.`);
          setSelectedCustomers([]); // 선택 해제
          fetchCustomers(); // 목록 새로고침
        } else {
          alert('대상 제외 실패: ' + result.message);
        }
      } catch (error) {
        console.error('Error excluding customers:', error);
        alert('대상 제외 중 오류가 발생했습니다.');
      }
    }
  };

  // CustomerList에서 가져온 필터 적용 함수
  const applySearchFilter = () => {
    setSearching(true);
    let result = [...customers];
    
    if (filterState.status !== '전체') {
      result = result.filter(row => row.status === filterState.status);
    }
    
    result = result.filter(row => 
      row.regDate >= filterState.startDate && 
      row.regDate <= filterState.endDate
    );
    
    if (filterState.search.trim() !== '') {
      const q = filterState.search.trim().toLowerCase();
      result = result.filter(row =>
        (row.company_name && row.company_name.toLowerCase().includes(q)) ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.region && row.region.toLowerCase().includes(q)) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.title && row.title.toLowerCase().includes(q))
      );
    }
    
    const sortedResult = sortCustomers(result);
    setFilteredCustomers(sortedResult);
    setSelectedCustomers([]);
    setSelectedIndex(null);
    setSearching(false);
    setSearchMessage('조회가 완료되었습니다.');
    setTimeout(() => setSearchMessage(''), 1500);
  };

  // 첫 마운트 시 미발송+일주일전~오늘로 자동 조회
  useEffect(() => {
    setFilter('미발송');
    setPeriod({ startDate: getNDaysAgo(7), endDate: getToday() });
    setSearch('');
    handlePeriodSearch(getNDaysAgo(7), getToday());
  }, []);

  // 기간 조회
  const handlePeriodSearch = async (start, end) => {
    // 날짜가 변경되었으므로 서버에서 새 데이터를 가져옴
    await fetchCustomers();
    
    // 서버에서 받아온 데이터에서 미발송 필터 적용
    const filteredResult = customers.filter(c => 
      c.email && c.email.trim() !== '' && 
      c.category === selectedCategory && 
      !c.is_excluded && 
      (!c.first_sent_date || c.first_sent_date === '')
    );
    setFilteredCustomers(filteredResult);
    setSelectedCustomers([]);
    setSelectedIndex(null);
  };

  // 검색 조회
  const handleSearch = () => {
    let result = [...customers];
    if (search.trim() !== '') {
      const q = search.trim().toLowerCase();
      result = result.filter(row =>
        (row.company_name && row.company_name.toLowerCase().includes(q)) ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.region && row.region.toLowerCase().includes(q)) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.title && row.title.toLowerCase().includes(q))
      );
    }
    setFilteredCustomers(result);
    setSelectedCustomers([]);
    setSelectedIndex(null);
  };

  // 카테고리별 미발송 개수 계산
  const getCategoryCounts = (data) => {
    const counts = {};
    CATEGORIES.forEach(cat => {
      const catData = data.filter(c => c.email && c.email.trim() !== '' && c.category === cat.id);
      counts[cat.id] = catData.filter(c => !c.is_excluded && (!c.first_sent_date || c.first_sent_date === '')).length;
    });
    return counts;
  };

  // 탭 전환 시 서버 fetch 없이 로컬 데이터만 사용
  const handleTabClick = (catId) => {
    setSelectedCategory(catId);
    setSelectedIndex(null);
    fetchCustomers(); // 탭 클릭 시에도 서버에서 최신 데이터 fetch
  };

  // 카테고리 일괄 변경 함수
  const handleBulkCategoryChange = async (newCategory) => {
    if (selectedCustomers.length === 0) {
      alert('선택된 고객이 없습니다.');
      return;
    }

    console.log('선택된 고객 ID들:', selectedCustomers);
    console.log('현재 필터된 고객들:', filteredCustomers.map(c => ({ id: c.id, name: c.name, category: c.category })));

    if (!window.confirm(`선택된 ${selectedCustomers.length}명의 카테고리를 '${newCategory}'로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/change-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerIds: selectedCustomers,
          category: newCategory
        }),
      });

      const result = await response.json();
      console.log('서버 응답:', result);
      
      if (result.success) {
        alert(`카테고리 변경이 완료되었습니다. (요청: ${result.requestedIds}개, 처리: ${result.existingIds}개)`);
        setSelectedCustomers([]); // 선택 해제
        fetchCustomers(); // 목록 새로고침
      } else {
        alert('카테고리 변경 실패: ' + result.message);
      }
    } catch (error) {
      console.error('Error changing category:', error);
      alert('카테고리 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white font-semibold email-sending-page-container pt-6">
      {/* 상단 타이틀+탭 */}
      <div className="flex items-center border-b border-gray-200 bg-white email-sending-header-section mb-2" style={{minHeight: 36}}>
        <div className="text-2xl font-bold pl-4 flex-shrink-0 email-sending-page-title">이메일 발송</div>
        <div style={{ width: 50, minWidth: 50, flexShrink: 0 }} className="email-sending-header-spacer"></div>
        <div className="flex gap-2 flex-1 email-sending-category-tabs">
          {CATEGORIES.map((category) => {
            const counts = getCategoryCounts(allCategoryData[category.id] || []);
            const count = counts[category.id] || 0;
            return (
              <button
                key={category.id}
                className={`px-20 py-1 rounded-t-lg font-medium transition-colors text-[14px] border-b-2 email-sending-category-tab ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white border-orange-600 email-sending-category-tab-active'
                    : 'bg-gray-100 text-gray-700 border-transparent hover:bg-orange-100 hover:text-orange-700 email-sending-category-tab-inactive'
                }`}
                onClick={() => handleTabClick(category.id)}
              >
                {category.name} ({count})
              </button>
            );
          })}
        </div>
        {/* 경리/세무사/노무사/스타트업 이동 버튼: 우측 끝 */}
        <div className="flex gap-2 px-4 pb-2 email-sending-category-buttons">
          <button
            onClick={() => handleBulkCategoryChange('경리')}
            disabled={selectedCustomers.length === 0}
            className="px-3 h-5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md font-medium hover:bg-blue-100 disabled:bg-blue-50 disabled:text-blue-900 disabled:cursor-not-allowed text-[12px] flex-shrink-0 email-sending-category-button-accounting"
            title="선택된 고객들을 경리로 이동"
          >
            경리로 이동
          </button>
          <button
            onClick={() => handleBulkCategoryChange('세무사')}
            disabled={selectedCustomers.length === 0}
            className="px-3 h-5 bg-green-50 text-green-900 border border-green-200 rounded-md font-medium hover:bg-green-100 disabled:bg-green-50 disabled:text-green-900 disabled:cursor-not-allowed text-[12px] flex-shrink-0 email-sending-category-button-tax"
            title="선택된 고객들을 세무사로 이동"
          >
            세무사로 이동
          </button>
          <button
            onClick={() => handleBulkCategoryChange('노무사')}
            disabled={selectedCustomers.length === 0}
            className="px-3 h-5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md font-medium hover:bg-purple-100 disabled:bg-purple-50 disabled:text-purple-900 disabled:cursor-not-allowed text-[12px] flex-shrink-0 email-sending-category-button-labor"
            title="선택된 고객들을 노무사로 이동"
          >
            노무사로 이동
          </button>
          <button
            onClick={() => handleBulkCategoryChange('스타트업')}
            disabled={selectedCustomers.length === 0}
            className="px-3 h-5 bg-orange-50 text-orange-900 border border-orange-200 rounded-md font-medium hover:bg-orange-100 disabled:bg-orange-50 disabled:text-orange-900 disabled:cursor-not-allowed text-[12px] flex-shrink-0 email-sending-category-button-startup"
            title="선택된 고객들을 스타트업으로 이동"
          >
            스타트업으로 이동
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="border-b border-gray-200 py-2 bg-gray-50 email-sending-control-section"
           style={{ position: 'sticky', top: 0, zIndex: 20, boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between email-sending-control-row">
          <div className="flex items-center gap-4 email-sending-control-left">
            <div className="flex gap-2 email-sending-control-buttons" translate="no">
              {/* 시작일 ~ 종료일 */}
              <div className="flex items-center gap-2 email-sending-date-filter">
                <input
                  type="date"
                  value={period.startDate}
                  onChange={e => setPeriod(p => ({ ...p, startDate: e.target.value }))}
                  className="px-2 h-7 border border-gray-400 rounded text-[12px] email-sending-start-date"
                />
                <span className="text-[12px] email-sending-date-separator">~</span>
                <input
                  type="date"
                  value={period.endDate}
                  onChange={e => setPeriod(p => ({ ...p, endDate: e.target.value }))}
                  className="px-2 h-7 border border-gray-400 rounded text-[12px] email-sending-end-date"
                />
                {/* 기간 조회 버튼 */}
                <button
                  className="bg-gray-300 border border-gray-400 px-4 h-7 rounded text-[12px] email-sending-period-search-button"
                  onClick={() => handlePeriodSearch(period.startDate, period.endDate)}
                >
                  조회
                </button>
              </div>
              {/* 발송 상태 필터 */}
              {['미발송', '1차발송', '2차발송', '3차발송'].map((filterType) => {
                const counts = getFilterCounts(customers);
                return (
                  <button
                    key={filterType}
                    className={`px-3 h-7 rounded-md font-medium transition-colors text-[14px] email-sending-status-filter ${
                      filter === filterType
                        ? 'bg-blue-600 text-white email-sending-status-filter-active'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 email-sending-status-filter-inactive'
                    }`}
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType} ({counts[filterType] || 0})
                  </button>
                );
              })}
              <button
                className={`px-3 h-7 rounded-md font-medium transition-colors text-[14px] email-sending-exclude-filter ${
                  filter === '대상제외'
                    ? 'bg-red-600 text-white email-sending-exclude-filter-active'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 email-sending-exclude-filter-inactive'
                }`}
                onClick={() => {
                  if (selectedCustomers.length > 0) {
                    handleBulkExclude();
                  } else {
                    setFilter('대상제외');
                  }
                }}
              >
                대상제외 ({getFilterCounts(customers)['대상제외'] || 0})
              </button>
              {/* 검색창 */}
              <div className="relative email-sending-search-container">
                <input
                  className="w-[200px] border border-gray-400 rounded px-2 py-1 h-7 text-[12px] pr-6 email-sending-search-input"
                  placeholder="상호, 지역, 이메일, 공고명"
                  value={search}
                  name="search"
                  onChange={e => setSearch(e.target.value)}
                  maxLength={20}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-[10px] email-sending-search-clear-button"
                  >
                    ×
                  </button>
                )}
              </div>
              {/* 검색 조회 버튼 */}
              <button
                className="bg-gray-300 border border-gray-400 px-4 h-7 rounded text-[12px] email-sending-search-button"
                onClick={handleSearch}
              >
                조회
              </button>
              {/* 최대 450개 선택 버튼 */}
              <button
                className="bg-orange-600 text-white border border-orange-700 px-3 h-7 rounded text-[12px] hover:bg-orange-700 email-sending-select-max-button"
                onClick={handleSelectMax450}
                title="최대 450개 선택 (큰 번호부터)"
              >
                450개
              </button>
              {searching && <span style={{marginLeft: 4, color: '#888', fontSize: '11px'}} className="email-sending-loading-text">로딩중...</span>}
              {searchMessage && <span style={{marginLeft: 4, color: 'green', fontSize: '11px'}} className="email-sending-search-message">{searchMessage}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-4 email-sending-control-right">
            {/* 선택된 명수 텍스트를 버튼 왼쪽으로 이동 */}
            <div className="text-[13px] text-gray-700 font-medium email-sending-selected-count">
              선택된 {selectedCustomers.length}명에게
            </div>



            {/* 발송 버튼들을 3개로 분리 */}
            <div className="flex gap-2 email-sending-send-buttons">
              <button
                onClick={() => {
                  if (selectedCustomers.length === 0) return;
                  if (window.confirm(`선택된 ${selectedCustomers.length}명에게 1형 메일을 발송하시겠습니까?`)) {
                    handleBulkEmailSend('1형', setIsSending1);
                  }
                }}
                disabled={selectedCustomers.length === 0 || isSending1}
                className="px-4 h-7 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-600 disabled:cursor-not-allowed text-[13px] flex-shrink-0 email-sending-send-button-1"
              >
                {isSending1 ? '발송 중...' : '꼬심 1형 발송'}
              </button>
              <button
                onClick={() => {
                  if (selectedCustomers.length === 0) return;
                  if (window.confirm(`선택된 ${selectedCustomers.length}명에게 2형 메일을 발송하시겠습니까?`)) {
                    handleBulkEmailSend('2형', setIsSending2);
                  }
                }}
                disabled={selectedCustomers.length === 0 || isSending2}
                className="px-4 h-7 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:bg-green-600 disabled:cursor-not-allowed text-[13px] flex-shrink-0 email-sending-send-button-2"
              >
                {isSending2 ? '발송 중...' : '꼬심 2형 발송'}
              </button>
              <button
                onClick={() => {
                  if (selectedCustomers.length === 0) return;
                  if (window.confirm(`선택된 ${selectedCustomers.length}명에게 3형 메일을 발송하시겠습니까?`)) {
                    handleBulkEmailSend('3형', setIsSending3);
                  }
                }}
                disabled={selectedCustomers.length === 0 || isSending3}
                className="px-4 h-7 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:bg-purple-600 disabled:cursor-not-allowed text-[13px] flex-shrink-0"
              >
                {isSending3 ? '발송 중...' : '꼬심 3형 발송'}
              </button>
              {/* 큐 상태 확인 버튼 */}
              <button
                onClick={checkQueueStatus}
                className="px-4 h-7 bg-gray-500 text-white rounded-md font-medium hover:bg-gray-600 text-[13px] flex-shrink-0"
                title="이메일 큐 상태 확인"
              >
                📧 큐 확인
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 고객 리스트 - CustomerList 컴포넌트를 직접 구현 */}
      <div className="flex-1 overflow-auto">
        <div className="h-full flex flex-col pl-0 pr-0 pb-4 m-0 max-w-[1850px] w-full">
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '650px' }}>
            <table className="w-full text-center border-collapse table-fixed">
              <thead className="sticky top-0 z-10 text-[13px]">
                <tr className="bg-[#1A2346] border-b border-gray-400 h-[36px] text-white text-[13px] font-semibold">
                  <th className="border-r border-gray-400 text-center px-2 py-2 w-8" translate="no">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '4%'}} translate="no">No</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '7%'}} translate="no">SN</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '10%'}} translate="no">등록일</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '15%'}} translate="no">상호</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '30%'}} translate="no">공고명</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '16%'}} translate="no">지역</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '14%'}} translate="no">이메일</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '10%'}} translate="no">전화</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '12%'}} translate="no">1차 발송</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '12%'}} translate="no">2차 발송</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '12%'}} translate="no">3차 발송</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {filteredCustomers.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50 border-b border-gray-100 transition-colors text-[13px] h-[39px]"
                    style={{ backgroundColor: selectedIndex === index ? '#D8F4D3' : undefined }}
                    onMouseEnter={e => { if (selectedIndex !== index) e.currentTarget.style.backgroundColor = '#FFC6B8'; }}
                    onMouseLeave={e => { if (selectedIndex !== index) e.currentTarget.style.backgroundColor = ''; }}
                    onClick={(e) => {
                      // 체크박스 클릭이 아닌 경우에만 고객 선택/해제
                      if (e.target.type !== 'checkbox') {
                        const customerId = row.id;
                        const isSelected = selectedCustomers.includes(customerId);
                        
                        if (isSelected) {
                          // 이미 선택된 경우 해제
                          setSelectedCustomers(prev => prev.filter(id => id !== customerId));
                        } else {
                          // 선택되지 않은 경우 선택
                          setSelectedCustomers(prev => [...prev, customerId]);
                        }
                        setSelectedIndex(index);
                      }
                    }}
                  >
                    <td className="border-b border-gray-200 px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(row.id)}
                        onChange={e => handleSelect(row.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="border-b border-gray-200 px-1 text-center" style={{width: '4%'}}>{filteredCustomers.length - index}</td>
                    <td className="border-b border-gray-200 px-1 text-center" style={{width: '7%'}}>{row.sn || '-'}</td>
                    <td className="border-b border-gray-200 px-1 text-center" style={{width: '10%'}}>{row.regDate || '-'}</td>
                    <td className="border-b border-gray-200 px-1 px-2 text-right truncate" style={{width: '15%'}} title={(row.company_name || row.name || '')}>{(row.company_name || row.name || '').slice(0, 18)}{(row.company_name || row.name || '').length > 18 ? '...' : ''}</td>
                    <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '30%'}} title={row.title || ''}>
                      {row.link && (
                        <button
                          className="mr-1 text-blue-600 hover:text-blue-900"
                          title="공고 링크 열기"
                          onClick={e => { e.stopPropagation(); handleOpenLink(row.link); }}
                        >
                          🔗
                        </button>
                      )}
                      {(row.title || '').slice(0, 40)}{(row.title || '').length > 40 ? '...' : ''}
                    </td>
                    <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '16%'}} title={row.region || ''}>{(row.region || '').length > 16 ? (row.region.slice(0, 16) + '...') : (row.region || '')}</td>
                    <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '14%'}}>{(row.email || '').slice(0, 25)}{(row.email || '').length > 25 ? '...' : ''}</td>
                    <td className="border-b border-gray-200 px-1 text-center" style={{width: '7%'}}>{row.phone || ''}</td>
                    <td className="border-b border-gray-200 px-1 text-center align-middle" style={{width: '7%'}}>
                      {row.first_sent_date && (
                        <div className="flex flex-row items-center justify-center gap-2">
                          <div className="flex items-center justify-center" style={{height:'32px'}}>
                            <span
                              className="inline-block px-2 py-[1px] rounded-lg font-bold"
                              style={{
                                background: row.first_sent_type === '2형' ? '#2563eb' : row.first_sent_type === '3형' ? '#ea580c' : '#22c55e',
                                color: '#fff',
                                minWidth: '32px',
                                textAlign: 'center',
                                lineHeight: '14px',
                                fontSize: '10px',
                                paddingTop: '1px',
                                paddingBottom: '1px',
                              }}
                            >
                              {row.first_sent_type || '1형'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center" style={{minWidth:'60px'}}>
                            <span className="text-[11px] leading-tight text-center">{row.first_sent_date}</span>
                            {row.first_sent_time && (
                              <span className="text-[11px] text-gray-600 leading-tight text-center">{row.first_sent_time}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-gray-200 px-1 text-center align-middle" style={{width: '7%'}}>
                      {row.second_sent_date && (
                        <div className="flex flex-row items-center justify-center gap-2">
                          <div className="flex items-center justify-center" style={{height:'32px'}}>
                            <span
                              className="inline-block px-2 py-[1px] rounded-lg font-bold"
                              style={{
                                background: row.second_sent_type === '1형' ? '#22c55e' : row.second_sent_type === '3형' ? '#ea580c' : '#2563eb',
                                color: '#fff',
                                minWidth: '32px',
                                textAlign: 'center',
                                lineHeight: '14px',
                                fontSize: '10px',
                                paddingTop: '1px',
                                paddingBottom: '1px',
                              }}
                            >
                              {row.second_sent_type || '2형'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center" style={{minWidth:'60px'}}>
                            <span className="text-[11px] leading-tight text-center">{row.second_sent_date}</span>
                            {row.second_sent_time && (
                              <span className="text-[11px] text-gray-600 leading-tight text-center">{row.second_sent_time}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-gray-200 px-1 text-center align-middle" style={{width: '7%'}}>
                      {row.third_sent_date && (
                        <div className="flex flex-row items-center justify-center gap-2">
                          <div className="flex items-center justify-center" style={{height:'32px'}}>
                            <span
                              className="inline-block px-2 py-[1px] rounded-lg font-bold"
                              style={{
                                background: row.third_sent_type === '1형' ? '#22c55e' : row.third_sent_type === '2형' ? '#2563eb' : '#ea580c',
                                color: '#fff',
                                minWidth: '32px',
                                textAlign: 'center',
                                lineHeight: '14px',
                                fontSize: '10px',
                                paddingTop: '1px',
                                paddingBottom: '1px',
                              }}
                            >
                              {row.third_sent_type || '3형'}
                            </span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center" style={{minWidth:'60px'}}>
                            <span className="text-[11px] leading-tight text-center">{row.third_sent_date}</span>
                            {row.third_sent_time && (
                              <span className="text-[11px] text-gray-600 leading-tight text-center">{row.third_sent_time}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 링크 팝업 */}
      {popupLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">링크 미리보기</h3>
              <button
                onClick={() => setPopupLink('')}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={popupLink}
                className="w-full h-full border-0"
                title="링크 미리보기"
              />
            </div>
          </div>
        </div>
      )}

      {/* 화면 중앙 모래시계(스피너) 오버레이 */}
      {(isSending1 || isSending2 || isSending3) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FaSpinner className="animate-spin" style={{ fontSize: 80, color: '#2563eb' }} />
        </div>
      )}
    </div>
  );
}

export default ProgressPage; 