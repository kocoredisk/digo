import React, { useState, useEffect } from 'react';
import CalendarSection from '@/components/CalendarSection/CalendarSection';

function ConsultationManagementPage() {
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  
  // 고객 검색 관련 상태 추가
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  
  const [form, setForm] = useState({
    serialNumber: '',
    regDate: '',
    name: '',
    region: '',
    contactName: '',
    email: '',
    phone: '',
    content: '',
    specialNote: '',
    consultationType: '',
    serviceType: '',
    source: '',
    status: '신규',
    assignedTo: '',
    registeredDate: '',
    memo: '',
    priority: '보통'
  });

  // 실제 데이터 로드
  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/consultations');
      const data = await response.json();
      
      // 데이터 형식 변환 (기존 UI와 맞추기 위해)
      const transformedData = data.map(item => ({
        id: item.id,
        serialNumber: String(item.id).padStart(6, '0'),
        regDate: item.created_at,
        name: item.name,
        region: '', // 상담신청에는 지역 정보가 없으므로 빈 값
        contactName: item.name,
        phone: item.phone,
        email: item.email || '',
        consultationType: '', // 상담신청에는 상담유형이 없으므로 빈 값
        serviceType: item.service_type || '',
        source: item.source || '',
        status: item.status === 'new' ? '신규' : 
                item.status === 'contacted' ? '상담중' : 
                item.status === 'converted' ? '완료' : 
                item.status === 'lost' ? '취소' : item.status,
        assignedTo: '', // 상담신청에는 담당자 정보가 없으므로 빈 값
        registeredDate: item.created_at.split(' ')[0],
        memo: item.notes || '',
        priority: '보통', // 상담신청에는 우선순위가 없으므로 기본값
        content: item.notes || '',
        specialNote: ''
      }));
      
      setConsultations(transformedData);
      setFilteredConsultations(transformedData);
    } catch (error) {
      console.error('상담신청 목록 조회 실패:', error);
      setConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터 상태
  const [filter, setFilter] = useState({
    status: '전체',
    startDate: getNDaysAgo(15),
    endDate: getToday(),
    search: '',
  });

  function getToday() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function getNDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  const STATUS_OPTIONS = ['신규', '상담중', '완료', '취소'];
  const SEARCH_STATUS_OPTIONS = ['전체', ...STATUS_OPTIONS];

  // 필터 적용 함수
  const applyFilter = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== '전체') {
        params.append('status', filter.status === '신규' ? 'new' : 
                              filter.status === '상담중' ? 'contacted' : 
                              filter.status === '완료' ? 'converted' : 
                              filter.status === '취소' ? 'lost' : filter.status);
      }
      if (filter.startDate && filter.endDate) {
        params.append('startDate', filter.startDate);
        params.append('endDate', filter.endDate);
      }
      if (filter.search.trim() !== '') {
        params.append('search', filter.search.trim());
      }
      
      const response = await fetch(`/api/consultations?${params.toString()}`);
      const data = await response.json();
      
      // 데이터 형식 변환 (기존 UI와 맞추기 위해)
      const transformedData = data.map(item => ({
        id: item.id,
        serialNumber: String(item.id).padStart(6, '0'),
        regDate: item.created_at,
        name: item.name,
        region: '', // 상담신청에는 지역 정보가 없으므로 빈 값
        contactName: item.name,
        phone: item.phone,
        email: item.email || '',
        consultationType: '', // 상담신청에는 상담유형이 없으므로 빈 값
        serviceType: item.service_type || '',
        source: item.source || '',
        status: item.status === 'new' ? '신규' : 
                item.status === 'contacted' ? '상담중' : 
                item.status === 'converted' ? '완료' : 
                item.status === 'lost' ? '취소' : item.status,
        assignedTo: '', // 상담신청에는 담당자 정보가 없으므로 빈 값
        registeredDate: item.created_at.split(' ')[0],
        memo: item.notes || '',
        priority: '보통', // 상담신청에는 우선순위가 없으므로 기본값
        content: item.notes || '',
        specialNote: ''
      }));
      
      setFilteredConsultations(transformedData);
      setSearchMessage('조회가 완료되었습니다.');
      setTimeout(() => setSearchMessage(''), 1500);
    } catch (error) {
      console.error('필터 적용 실패:', error);
      setSearchMessage('조회 중 오류가 발생했습니다.');
      setTimeout(() => setSearchMessage(''), 1500);
    } finally {
      setSearching(false);
    }
  };

  const handleConsultationSelect = (consultation, index) => {
    setSelectedConsultation(consultation);
    setSelectedIndex(index);
    setForm(consultation);
  };

  const handleNew = () => {
    const newConsultation = {
      serialNumber: '',
      regDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
      name: '',
      region: '',
      contactName: '',
      email: '',
      phone: '',
      content: '',
      specialNote: '',
      consultationType: '',
      serviceType: '',
      source: '',
      status: '신규',
      assignedTo: '',
      registeredDate: getToday(),
      memo: '',
      priority: '보통'
    };
    setForm(newConsultation);
    setSelectedConsultation(newConsultation);
  };

  const handleDelete = async () => {
    if (!selectedConsultation || !selectedConsultation.id) {
      alert('삭제할 상담신청을 선택해주세요.');
      return;
    }

    if (!confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/consultations/${selectedConsultation.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('삭제에 실패했습니다.');
      }

      alert('삭제되었습니다.');
      setSelectedConsultation(null);
      setForm({
        serialNumber: '',
        regDate: '',
        name: '',
        region: '',
        contactName: '',
        email: '',
        phone: '',
        content: '',
        specialNote: '',
        consultationType: '',
        serviceType: '',
        source: '',
        status: '신규',
        assignedTo: '',
        registeredDate: '',
        memo: '',
        priority: '보통'
      });
      
      // 목록 새로고침
      await fetchConsultations();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      alert('이름은 필수 입력 항목입니다.');
      return;
    }

    if (!form.phone) {
      alert('전화번호는 필수 입력 항목입니다.');
      return;
    }

    try {
      const consultationData = {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        company: form.company || null,
        service_type: form.serviceType || null,
        source: form.source || null,
        status: form.status === '신규' ? 'new' : 
                form.status === '상담중' ? 'contacted' : 
                form.status === '완료' ? 'converted' : 
                form.status === '취소' ? 'lost' : 'new',
        notes: form.memo || null
      };

      if (form.id) {
        // 수정
        const response = await fetch(`/api/consultations/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultationData)
        });
        
        if (!response.ok) {
          throw new Error('수정에 실패했습니다.');
        }
        
        alert('수정되었습니다.');
      } else {
        // 신규
        const response = await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultationData)
        });
        
        if (!response.ok) {
          throw new Error('등록에 실패했습니다.');
        }
        
        const result = await response.json();
        alert('등록되었습니다.');
        
        // 새로 등록된 상담신청을 선택 상태로 설정
        const newConsultation = { ...form, id: result.id };
        setSelectedConsultation(newConsultation);
      }
      
      // 목록 새로고침
      await fetchConsultations();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '신규': return '#a78bfa';      // 보라 (violet-400)
      case '상담중': return '#06b6d4';    // 청록 (cyan-500)
      case '완료': return '#eab308';      // 어두운 노랑 (yellow-500)
      case '취소': return '#64748b';      // 진한 회색 (slate-500)
      default: return '#d1d5db';          // 연한 회색
    }
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePhoneInput = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 3 && val.length <= 7) formatted = val.slice(0, 3) + '-' + val.slice(3);
    else if (val.length > 7) formatted = val.slice(0, 3) + '-' + val.slice(3, 7) + '-' + val.slice(7, 11);
    setForm(f => ({ ...f, phone: formatted }));
  };

  const handleContentChange = e => {
    setForm(f => ({ ...f, content: e.target.value }));
  };

  // 고객 검색 함수들
  const handleSearchCustomer = async () => {
    if (!searchKeyword.trim()) {
      alert('검색어를 입력해주세요.');
      return;
    }

    setSearchingCustomers(true);
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('고객 데이터를 불러오는데 실패했습니다.');
      const customers = await response.json();
      
      // 상호나 이름으로 검색
      const filtered = customers.filter(customer => 
        (customer.company_name && customer.company_name.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (customer.contactName && customer.contactName.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
      
      setSearchResults(filtered);
      setShowSearchPopup(true);
    } catch (error) {
      console.error('고객 검색 오류:', error);
      alert('고객 검색 중 오류가 발생했습니다.');
    } finally {
      setSearchingCustomers(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    // 현재 시각을 YYYY-MM-DD HH:mm:ss 포맷으로 생성
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const regDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    // 마지막 메일 발송일이 있으면 특이사항에 추가
    let specialNote = customer.content || '';
    if (customer.last_email_sent_date) {
      const date = new Date(customer.last_email_sent_date);
      const mailSentText = `${pad(date.getMonth() + 1)}월 ${pad(date.getDate())}일 메일 발송`;
      specialNote = specialNote ? `${specialNote}\n${mailSentText}` : mailSentText;
    }
    setForm(prev => ({
      ...prev,
      regDate,
      serviceType: '탄탄',
      name: customer.company_name || '',
      contactName: customer.contactName || '',
      region: customer.region || '',
      email: customer.email || '',
      phone: customer.phone || '',
      specialNote,
    }));
    setShowSearchPopup(false);
    setSearchKeyword('');
    setSearchResults([]);
  };

  const handleCloseSearchPopup = () => {
    setShowSearchPopup(false);
    setSearchKeyword('');
    setSearchResults([]);
  };

  // 일정 추가 시 상담신청관리 리스트 새로고침
  const handleScheduleAdded = () => {
    // 현재 선택된 상담 정보 유지
    const currentSelected = selectedConsultation;
    const currentIndex = selectedIndex;
    
    // 현재 필터 조건으로 다시 조회
    applyFilter();
    
    // 선택된 상담 정보 복원
    if (currentSelected) {
      setSelectedConsultation(currentSelected);
      setForm(currentSelected);
      // 인덱스 재설정
      const newIndex = filteredConsultations.findIndex(c => c.id === currentSelected.id);
      setSelectedIndex(newIndex >= 0 ? newIndex : null);
    }
  };

  // 꼬심1형 이메일 발송
  const handleSendEmail1 = async () => {
    if (!selectedConsultation || !selectedConsultation.email) {
      alert('이메일을 발송할 상담을 선택해주세요.');
      return;
    }

    if (!selectedConsultation.name) {
      alert('상호명이 없어 이메일을 발송할 수 없습니다.');
      return;
    }

    const confirmMessage = `${selectedConsultation.name} ${selectedConsultation.contactName || ''}님에게 꼬심1형 메일을 발송하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/send-consultation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId: selectedConsultation.id,
          emailType: '1형',
          email: selectedConsultation.email,
          name: selectedConsultation.name,
          contactName: selectedConsultation.contactName
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('꼬심1형 이메일이 성공적으로 발송되었습니다.');
        // 상담 상태를 '상담중'으로 변경
        setForm(prev => ({ ...prev, status: '상담중' }));
        handleSave();
      } else {
        alert('이메일 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    }
  };

  // 꼬심2형 이메일 발송
  const handleSendEmail2 = async () => {
    if (!selectedConsultation || !selectedConsultation.email) {
      alert('이메일을 발송할 상담을 선택해주세요.');
      return;
    }

    if (!selectedConsultation.name) {
      alert('상호명이 없어 이메일을 발송할 수 없습니다.');
      return;
    }

    const confirmMessage = `${selectedConsultation.name} ${selectedConsultation.contactName || ''}님에게 꼬심2형 메일을 발송하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/send-consultation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId: selectedConsultation.id,
          emailType: '2형',
          email: selectedConsultation.email,
          name: selectedConsultation.name,
          contactName: selectedConsultation.contactName
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('꼬심2형 이메일이 성공적으로 발송되었습니다.');
        // 상담 상태를 '상담중'으로 변경
        setForm(prev => ({ ...prev, status: '상담중' }));
        handleSave();
      } else {
        alert('이메일 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    }
  };

  // 꼬심3형 이메일 발송
  const handleSendEmail3 = async () => {
    if (!selectedConsultation || !selectedConsultation.email) {
      alert('이메일을 발송할 상담을 선택해주세요.');
      return;
    }

    if (!selectedConsultation.name) {
      alert('상호명이 없어 이메일을 발송할 수 없습니다.');
      return;
    }

    const confirmMessage = `${selectedConsultation.name} ${selectedConsultation.contactName || ''}님에게 꼬심3형 메일을 발송하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/send-consultation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultationId: selectedConsultation.id,
          emailType: '3형',
          email: selectedConsultation.email,
          name: selectedConsultation.name,
          contactName: selectedConsultation.contactName
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('꼬심3형 이메일이 성공적으로 발송되었습니다.');
        // 상담 상태를 '상담중'으로 변경
        setForm(prev => ({ ...prev, status: '상담중' }));
        handleSave();
      } else {
        alert('이메일 발송 실패: ' + result.message);
      }
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    }
  };

  return (
            <div className="flex flex-1 w-full bg-white gap-4 pt-6" style={{ minHeight: 0, height: 760 }}>
      {/* Left (65%) - 리스트 */}
      <div className="w-[65%] h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-md overflow-hidden relative">
        <div className="border-b border-gray-200 py-2 px-4 m-0 bg-gray-50 min-h-[32px] flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">상담 신청 리스트</span>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleSendEmail1}
              disabled={!selectedConsultation || !selectedConsultation.email}
              className="bg-blue-500 text-white border border-blue-600 py-1 px-5 rounded text-xs font-semibold hover:bg-blue-600 transition-colors min-w-[110px] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              꼬심 1형 발송
            </button>
            <button 
              type="button" 
              onClick={handleSendEmail2}
              disabled={!selectedConsultation || !selectedConsultation.email}
              className="bg-green-500 text-white border border-green-600 py-1 px-5 rounded text-xs font-semibold hover:bg-green-600 transition-colors min-w-[110px] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              꼬심 2형 발송
            </button>
            <button 
              type="button" 
              onClick={handleSendEmail3}
              disabled={!selectedConsultation || !selectedConsultation.email}
              className="bg-purple-500 text-white border border-purple-600 py-1 px-5 rounded text-xs font-semibold hover:bg-purple-600 transition-colors min-w-[110px] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              꼬심 3형 발송
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              disabled={!selectedConsultation || !selectedConsultation.id}
              className="bg-red-500 text-white py-1 px-3 rounded text-xs font-semibold hover:bg-red-600 transition-colors min-w-[70px] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              삭제
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col p-4 bg-white text-[15px] text-gray-800 overflow-y-auto">
          {/* 조회 조건 */}
          <div className="flex items-center border-b border-gray-400 pb-2 gap-2 mb-4">
            <select
              name="status"
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              className="border border-gray-400 rounded px-2 py-1 h-8 text-[14px]"
              style={{ minWidth: 90 }}
            >
              {SEARCH_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <input
              type="date"
              name="startDate"
              className="border border-gray-400 rounded px-2 py-1 w-[120px] h-8 text-[14px]"
              value={filter.startDate || ''}
              onChange={e => setFilter(f => ({ ...f, startDate: e.target.value }))}
            />
            <span className="mx-1">-</span>
            <input
              type="date"
              name="endDate"
              className="border border-gray-400 rounded px-2 py-1 w-[120px] h-8 text-[14px]"
              value={filter.endDate || ''}
              onChange={e => setFilter(f => ({ ...f, endDate: e.target.value }))}
            />
            <div className="relative flex-1">
              <input
                className="w-full border border-gray-400 rounded px-2 py-1 h-8 text-[14px] pr-8"
                placeholder="상호, 지역, 이름, 연락처, 이메일, 담당자"
                value={filter.search || ''}
                name="search"
                onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <button className="bg-gray-300 border border-gray-400 px-6 h-8 rounded ml-2 text-[14px]" onClick={applyFilter}>조회</button>
            <button 
              className="bg-blue-500 text-white border border-blue-600 px-4 h-8 rounded ml-2 text-[14px] hover:bg-blue-600" 
              onClick={fetchConsultations}
            >
              새로고침
            </button>
            {searching && <span style={{marginLeft: 8, color: '#888'}}>로딩중...</span>}
            {searchMessage && <span style={{marginLeft: 8, color: 'green'}}>{searchMessage}</span>}
          </div>

          {/* 리스트 테이블 */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            <table className="w-full text-center border-collapse table-fixed">
              <thead className="sticky top-0 z-10 text-[13px]">
                <tr className="bg-[#1A2346] border-b border-gray-400 h-[36px] text-white text-[13px]">
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '3%'}}>
                    <input type="checkbox" className="w-3 h-3 rounded" />
                  </th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '5%'}}>No</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '8%'}}>접수일</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '8%'}}>서비스</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '10%'}}>지역</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '12%'}}>상호</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '6%'}}>이름</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '30%'}}>특이사항</th>
                  <th className="border-r border-gray-400 text-center px-1" style={{width: '8%'}}>상태</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {filteredConsultations.map((consultation, i) => (
                  <tr
                    key={consultation.id || i}
                    className={`cursor-pointer ${selectedIndex === i ? 'bg-[#D8F4D3]' : ''} h-[39px]`}
                    style={{ backgroundColor: selectedIndex === i ? '#D8F4D3' : undefined }}
                    onMouseEnter={e => { if (selectedIndex !== i) e.currentTarget.style.backgroundColor = '#FFC6B8'; }}
                    onMouseLeave={e => { if (selectedIndex !== i) e.currentTarget.style.backgroundColor = ''; }}
                    onClick={() => handleConsultationSelect(consultation, i)}
                  >
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '3%'}}>
                      <input type="checkbox" className="w-3 h-3 rounded" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '5%'}}>{String(filteredConsultations.length - i).padStart(4, '0')}</td>
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '8%'}}>{consultation.registeredDate}</td>
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '8%'}}>
                      <span style={{
                        background: consultation.serviceType === '탄탄' ? '#3b82f6' : consultation.serviceType === '캐시맵' ? '#10b981' : '#f59e0b',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '11px',
                        display: 'inline-block',
                        width: '60px',
                        textAlign: 'center'
                      }}>
                        {consultation.serviceType === '탄탄' ? '탄탄' : consultation.serviceType === '캐시맵' ? '캐시맵' : '링키  '}
                      </span>
                    </td>
                    <td className="border-r border-gray-200 px-1 text-left truncate" style={{width: '10%'}}>{consultation.region}</td>
                    <td className="border-r border-gray-200 px-1 text-left truncate" style={{width: '12%'}}>{consultation.name}</td>
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '6%'}}>{consultation.contactName}</td>
                    <td className="border-r border-gray-200 px-1 text-left truncate" style={{width: '30%'}}>{consultation.specialNote}</td>
                    <td className="border-r border-gray-200 px-1 text-center" style={{width: '8%'}}>
                      <span style={{
                        background: getStatusColor(consultation.status),
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '11px',
                        display: 'inline-block',
                        width: '60px',
                        textAlign: 'center'
                      }}>
                        {consultation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Center (18%) - 상세 정보 */}
      <div className="w-[18%] h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-md overflow-hidden">
        <div className="border-b border-gray-200 py-2 px-4 m-0 bg-gray-50 min-h-[32px] flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900">상세 정보</span>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setShowSearchPopup(true)} 
              className="bg-green-500 text-white py-1 px-3 rounded text-xs font-semibold hover:bg-green-600 transition-colors"
            >
              검색
            </button>
            <button type="button" onClick={handleNew} className="bg-blue-500 text-white py-1 px-3 rounded text-xs font-semibold hover:bg-blue-600 transition-colors">신규추가</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col p-0 bg-white text-[15px] text-gray-800 overflow-y-auto">
          <div className="h-full flex flex-col pr-[2px]">
            <form className="flex-1 flex flex-col overflow-y-auto pl-4 pr-4 pt-4 pb-4 m-0">
              {/* 크롤링된 데이터 - 읽기 전용 */}
              <div className="space-y-2">
                <div className="relative">
                  <input 
                    name="regDate" 
                    value={form.regDate || ''} 
                    readOnly 
                    className="border border-gray-400 rounded px-2 py-1 bg-gray-100 w-full text-[13px] pr-20" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">접수일</span>
                </div>
                
                <div className="relative">
                  <select 
                    name="serviceType" 
                    value={form.serviceType || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px]" 
                    style={{
                      background: form.serviceType === '탄탄' ? '#3b82f6' : form.serviceType === '캐시맵' ? '#10b981' : form.serviceType === '링키' ? '#f59e0b' : 'white',
                      color: form.serviceType ? '#fff' : '#000',
                      appearance: 'none',
                      backgroundImage: 'none'
                    }}
                  >
                    <option value="">서비스 선택</option>
                    <option value="탄탄">탄탄</option>
                    <option value="캐시맵">캐시맵</option>
                    <option value="링키">링키</option>
                  </select>
                </div>
                
                <div className="relative">
                  <input 
                    name="region" 
                    value={form.region || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-12" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">지역</span>
                </div>
                
                <div className="relative">
                  <input 
                    name="name" 
                    value={form.name || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-16" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">상호</span>
                </div>
                
                <div className="relative">
                  <input 
                    name="contactName" 
                    value={form.contactName || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-12" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">이름</span>
                </div>
                
                <div className="relative">
                  <input 
                    name="phone" 
                    value={form.phone || ''} 
                    onChange={handlePhoneInput}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-20" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">휴대폰</span>
                </div>
                
                <div className="relative">
                  <input 
                    name="email" 
                    value={form.email || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-16" 
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold">이메일</span>
                </div>
                
                <div className="relative">
                  <textarea 
                    name="specialNote" 
                    value={form.specialNote || ''} 
                    onChange={handleChange}
                    className="border border-gray-400 rounded px-2 py-1 bg-white w-full resize-none text-[13px] pr-20" 
                    placeholder="특이사항을 입력하세요..."
                    style={{ height: '90px' }}
                  />
                  <span className="absolute right-2 top-2 text-gray-500 text-xs font-semibold">특이사항</span>
                </div>
                
                <div className="relative">
                  <textarea 
                    name="content" 
                    maxLength={400} 
                    value={form.content || ''} 
                    onChange={handleContentChange} 
                    className="border border-gray-400 rounded px-2 py-1 w-full resize-none text-[13px] pr-16 m-0" 
                    placeholder="코멘트를 입력하세요..." 
                    style={{ height: '200px' }}
                  />
                  <span className="absolute right-2 top-2 text-gray-500 text-xs font-semibold">내용</span>
                </div>
              </div>

              {/* 상태(신규) 및 삭제/저장 버튼 */}
              <div className="mt-2">
                <div className="grid grid-cols-6 gap-x-2 gap-y-2 items-center">
                  <div className="col-span-6">
                    <select 
                      name="status" 
                      value={form.status || '신규'} 
                      onChange={handleChange}
                      className="border border-gray-400 rounded px-2 py-1 w-full text-[13px]"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2 px-3 bg-red-500 text-white rounded font-semibold text-xs hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 py-2 px-3 bg-blue-500 text-white rounded font-semibold text-xs hover:bg-blue-600 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right (17%) - 캘린더 */}
      <div className="w-[17%] h-full flex flex-col border border-gray-300 rounded-lg bg-white shadow-md overflow-hidden">
        <h2 className="border-b border-gray-200 py-2 px-4 m-0 bg-gray-50 font-bold text-lg min-h-[32px] text-left text-gray-900">캘린더</h2>
        <div className="flex-1 flex flex-col p-0 bg-white text-[15px] text-gray-800 overflow-y-auto">
          <div className="h-full flex flex-col pr-[2px]">
            <div className="flex-1 flex flex-col overflow-y-auto pl-4 pr-4 pt-4 pb-4 m-0">
              <CalendarSection 
                customerName={form.name || ''}
                customerRegion={form.region || ''}
                onScheduleAdded={handleScheduleAdded}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 고객 검색 팝업 */}
      {showSearchPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
            {/* 팝업 헤더 */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">고객 검색</h3>
              <button
                onClick={handleCloseSearchPopup}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* 검색 입력 영역 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="상호 또는 이름으로 검색하세요"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSearchCustomer}
                  disabled={searchingCustomers}
                  className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {searchingCustomers ? '검색중...' : '확인'}
                </button>
              </div>
            </div>

            {/* 검색 결과 */}
            <div className="flex-1 overflow-y-auto px-6 py-4" style={{ overflowY: 'auto' }}>
              {searchResults.length === 0 && !searchingCustomers && (
                <div className="text-center text-gray-500 py-8">
                  검색 결과가 없습니다.
                </div>
              )}
              
              {searchingCustomers && (
                <div className="text-center text-gray-500 py-8">
                  검색중...
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 mb-3">
                    검색 결과: {searchResults.length}건
                  </div>
                  {searchResults.map((customer, index) => (
                    <div
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {customer.company_name || '상호명 없음'}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>담당자: {customer.contactName || '이름 없음'}</div>
                            <div>지역: {customer.region || '지역 없음'}</div>
                            <div>연락처: {customer.phone || '연락처 없음'}</div>
                            <div>이메일: {customer.email || '이메일 없음'}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomer(customer);
                          }}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-600 ml-2"
                        >
                          선택
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 팝업 푸터 */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseSearchPopup}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultationManagementPage; 