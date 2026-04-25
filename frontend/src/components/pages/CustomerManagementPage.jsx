import { useState, useEffect } from 'react';
import CustomerList from './CustomerList';
import DetailView from '@/components/DetailView';
import CalendarSection from '@/components/CalendarSection/CalendarSection';

function CustomerManagementPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rows, setRows] = useState([]); // 전체 고객 리스트 상태 추가
  const [form, setForm] = useState({
    regDate: '',
    status: '최초등록',
    name: '',
    jobTitle: '',
    region: '',
    contactName: '',
    email: '',
    phone: '',
    content: '',
    link: '',
  });
  const [linkedUrl, setLinkedUrl] = useState(null); // 링크 미리보기 상태 추가
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    search: '',
  });

  // 컴포넌트 마운트 시 고객 데이터 로드
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) {
          throw new Error('데이터를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // 리스트에서 고객 선택 시 상세 폼에 값 반영
  useEffect(() => {
    if (selectedCustomer) {
      setForm({
        ...selectedCustomer,
        name: selectedCustomer.company_name || selectedCustomer.name || '',
      });
    } else {
      // 선택이 해제되면 폼 초기화
      setForm({
        regDate: '', status: '최초등록', name: '', jobTitle: '', region: '', contactName: '', email: '', phone: '', content: '', link: '',
      });
    }
  }, [selectedCustomer]);

  // 저장 시 리스트에도 반영
  const handleSave = async () => {
    if (!form || !form.name) {
      alert('상호는 필수 입력 항목입니다.');
      return;
    }

    try {
      let savedCustomer;
      if (form.id) {
        // 수정
        const response = await fetch(`/api/customers/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('고객 정보 수정에 실패했습니다.');
        savedCustomer = await response.json();
        setRows(prev => prev.map(row => row.id === savedCustomer.id ? savedCustomer : row));
      } else {
        // 신규
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) throw new Error('고객 정보 추가에 실패했습니다.');
        savedCustomer = await response.json();
        setRows(prev => [savedCustomer, ...prev]);
      }
      setSelectedCustomer(savedCustomer);
      alert('저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert(`오류가 발생했습니다: ${error.message}`);
    }
  };

  const handleNew = () => {
    const newCustomer = {
      regDate: new Date().toISOString(), status: '최초등록', name: '', jobTitle: '', region: '', contactName: '', email: '', phone: '', content: '', link: '',
    };
    setForm(newCustomer);
    setSelectedCustomer(newCustomer);
  };

  const applyFilter = () => {
    // 필터링 로직을 구현해야 합니다.
    console.log('Filter applied:', filter);
  };

  return (
    <div className="pt-6 pb-6 customer-management-page-container">
      <div className="mb-2 customer-management-header-section">
        <div className="flex gap-3 customer-management-title-row">
          <div className="w-[50%] customer-management-title-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 pl-2 customer-management-page-title">더미 고객 리스트</h1>
          </div>
          <div className="w-[50%] flex justify-end items-center customer-management-title-right">
            <div className="flex flex-row items-center gap-3 flex-wrap customer-management-filter-container">
              <div className="flex flex-row items-center gap-2 customer-management-date-filter">
                <input
                  type="date"
                  value={filter.startDate}
                  onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))}
                  className="border rounded px-2 py-1 text-[13px] customer-management-start-date"
                  style={{width:'130px'}} />
                <span className="mx-1 customer-management-date-separator">~</span>
                <input
                  type="date"
                  value={filter.endDate}
                  onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))}
                  className="border rounded px-2 py-1 text-[13px] customer-management-end-date"
                  style={{width:'130px'}} />
              </div>
              <input
                type="text"
                placeholder="상호, 지역, 이메일, 공고명"
                value={filter.search}
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                className="border rounded px-2 py-1 text-[13px] customer-management-search-input"
                style={{width:'220px'}} />
              <button
                onClick={applyFilter}
                className="ml-2 px-3 py-1 bg-gray-400 text-white rounded text-[13px] hover:bg-gray-500 customer-management-search-button"
              >조회</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 customer-management-content-section" style={{ minHeight: 0, height: 680 }}>
        {/* Left (70%) - 리스트 전체 영역 */}
        <div className="w-[70%] h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden relative ListContainer customer-management-list-container" style={{padding: 8}}>
          <div className="flex flex-col bg-white text-[15px] text-gray-800 overflow-y-auto customer-management-list-wrapper" style={{margin: 0}}>
            <CustomerList onSelectCustomer={setSelectedCustomer} rows={rows} setRows={setRows} onLinkClick={setLinkedUrl} />
          </div>
          {linkedUrl && (
            <div className="absolute inset-0 bg-gray-100 flex flex-col z-20 customer-management-link-preview">
              <button
                className="absolute top-2 right-2 text-xl text-gray-500 hover:text-red-500 z-30 customer-management-link-close-button"
                onClick={() => setLinkedUrl(null)}
                aria-label="닫기"
              >
                ×
              </button>
              <iframe src={linkedUrl} className="w-full h-full border-none rounded-b customer-management-link-iframe" title="링크 미리보기" />
            </div>
          )}
        </div>
        {/* Right (30%) - 상세정보 전체 영역 */}
        <div className="w-[30%] h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-sm overflow-hidden DetailContainer customer-management-detail-container" style={{padding: 8}}>
          <div className="border-b border-gray-200 bg-gray-50 flex items-center justify-between customer-management-detail-header" style={{minHeight: 45, padding: '8px 16px'}}>
            <span className="font-bold text-lg text-gray-900 customer-management-detail-title" translate="no">상세 정보</span>
            <button type="button" onClick={handleNew} className="bg-blue-500 text-white py-1 px-3 rounded text-xs font-semibold hover:bg-blue-600 transition-colors customer-management-new-button" style={{height: 28, width: 74}} translate="no">신규추가</button>
          </div>
          <div className="flex-1 flex flex-col bg-white text-[15px] text-gray-800 overflow-y-auto customer-management-detail-content" style={{margin: 0}}>
            <DetailView form={form} setForm={setForm} handleSave={handleSave} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerManagementPage; 