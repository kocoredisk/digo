import { useState, useEffect } from 'react';
import { FaLink, FaTrash, FaTimesCircle, FaEnvelope, FaSms, FaCheckCircle, FaPhone } from 'react-icons/fa';

const API_URL = '/api/customers';

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
const SEARCH_STATUS_OPTIONS = ['전체', ...STATUS_OPTIONS];

function CustomerList({ onSelectCustomer, rows, setRows, onLinkClick, selectedIds: externalSelectedIds }) {
  const [filter, setFilter] = useState({
    status: '전체',
    startDate: getNDaysAgo(15),
    endDate: getToday(),
    search: '',
  });
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // 외부에서 전달된 selectedIds가 있으면 사용
  useEffect(() => {
    if (externalSelectedIds) {
      setSelectedIds(externalSelectedIds);
    }
  }, [externalSelectedIds]);

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

  // 데이터베이스에서 고객 데이터 불러오기 및 초기화
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        const sortedData = sortCustomers(data);
        setRows(sortedData);
        setFilteredRows(sortedData);
        // 첫 번째 고객을 자동 선택
        if (sortedData.length > 0 && onSelectCustomer) {
          onSelectCustomer(sortedData[0]);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setRows([]);
        setFilteredRows([]);
      }
    };
    fetchCustomers();
  }, [setRows, onSelectCustomer]);

  useEffect(() => {
    const sortedData = sortCustomers(rows);
    setFilteredRows(sortedData);
  }, [rows]);

  // 필터 적용 함수
  const applyFilter = () => {
    setSearching(true);
    let result = [...rows];
    if (filter.status !== '전체') {
      result = result.filter(row => row.status === filter.status);
    }
    result = result.filter(row => row.regDate >= filter.startDate && row.regDate <= filter.endDate);
    if (filter.search.trim() !== '') {
      const q = filter.search.trim().toLowerCase();
      result = result.filter(row =>
        (row.company_name && row.company_name.toLowerCase().includes(q)) ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.region && row.region.toLowerCase().includes(q)) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.title && row.title.toLowerCase().includes(q))
      );
    }
    const sortedResult = sortCustomers(result);
    setFilteredRows(sortedResult);
    setSearching(false);
    setSearchMessage('조회가 완료되었습니다.');
    setTimeout(() => setSearchMessage(''), 1500);
  };

  const handleDelete = async (customerId, customerName) => {
    if (window.confirm(`'${customerName}' 고객 정보를 정말 삭제하시겠습니까?`)) {
      try {
        const response = await fetch(`${API_URL}/${customerId}`, {
          method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok && result.success) {
          // rows와 filteredRows 모두에서 삭제
          setRows(prevRows => prevRows.filter(row => row.id !== customerId));
          setFilteredRows(prevFilteredRows => prevFilteredRows.filter(row => row.id !== customerId));
          // 선택된 고객 목록에서도 제거
          setSelectedIds(prevIds => prevIds.filter(id => id !== customerId));
        } else {
          alert(`삭제 실패: ${result.message || '알 수 없는 오류'}`);
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = filteredRows.map(row => row.id);
      setSelectedIds(ids);
      if (onSelectCustomer) onSelectCustomer(ids);
    } else {
      setSelectedIds([]);
      if (onSelectCustomer) onSelectCustomer([]);
    }
  };

  // 개별 선택/해제
  const handleSelect = (id, checked) => {
    let ids;
    if (checked) {
      ids = [...selectedIds, id];
    } else {
      ids = selectedIds.filter(_id => _id !== id);
    }
    setSelectedIds(ids);
    if (onSelectCustomer) onSelectCustomer(ids);
  };

  return (
    <div className="h-full flex flex-col pl-0 pr-0 pb-4 m-0 max-w-[1850px] w-full">
      {/* 리스트 */}
      {/* 리스트 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '750px' }}>
        <table className="w-full text-center border-collapse table-fixed">
          <thead className="sticky top-0 z-10 text-[13px]">
            <tr className="bg-[#1A2346] border-b border-gray-400 h-[36px] text-white text-[13px] font-semibold">
              <th className="border-r border-gray-400 text-center px-2 py-2 w-8" translate="no">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRows.length && filteredRows.length > 0}
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
              <th className="border-r border-gray-400 text-center px-1" style={{width: '7%'}} translate="no"></th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {filteredRows.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-blue-50 border-b border-gray-100 transition-colors text-[13px] h-[39px]"
                style={{ backgroundColor: selectedIndex === index ? '#D8F4D3' : undefined }}
                onMouseEnter={e => { if (selectedIndex !== index) e.currentTarget.style.backgroundColor = '#FFC6B8'; }}
                onMouseLeave={e => { if (selectedIndex !== index) e.currentTarget.style.backgroundColor = ''; }}
                onClick={(e) => {
                  if (e.target.type !== 'checkbox') {
                    setSelectedIndex(index);
                    if (onSelectCustomer) onSelectCustomer(row);
                  }
                }}
              >
                <td className="border-b border-gray-200 px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={e => handleSelect(row.id, e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="border-b border-gray-200 px-1 text-center" style={{width: '4%'}}>{filteredRows.length - index}</td>
                <td className="border-b border-gray-200 px-1 text-center" style={{width: '7%'}}>{String(row.id).padStart(6, '0')}</td>
                <td className="border-b border-gray-200 px-1 text-center" style={{width: '10%'}}>{row.regDate || '-'}</td>
                <td className="border-b border-gray-200 px-1 px-2 text-right truncate" style={{width: '15%'}}>{(row.company_name || row.name || '').slice(0, 18)}{(row.company_name || row.name || '').length > 18 ? '...' : ''}</td>
                <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '30%'}}>{(row.title || '').slice(0, 40)}{(row.title || '').length > 40 ? '...' : ''}</td>
                <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '16%'}}>{(row.region || '').length > 10 ? (row.region.slice(0, 16) + '...') : (row.region || '')}</td>
                <td className="border-b border-gray-200 px-1 text-left truncate" style={{width: '14%'}}>{(row.email || '').slice(0, 25)}{(row.email || '').length > 25 ? '...' : ''}</td>
                <td className="border-b border-gray-200 px-1 text-center" style={{width: '7%'}}>{row.phone || ''}</td>
                <td className="border-b border-gray-200 px-1 text-center" style={{width: '7%'}}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); if (onLinkClick) onLinkClick(row); }}><FaLink /></span>
                    <span style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); handleDelete(row.id, row.company_name || row.name); }}><FaTrash /></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerList; 