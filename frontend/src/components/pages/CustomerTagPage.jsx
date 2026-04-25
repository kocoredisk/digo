import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

const CustomerTagPage = () => {
  const [customers, setCustomers] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(14, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('A'); // A: 태그 부여, B: 태그별 보기
  const [selectedFilterTag, setSelectedFilterTag] = useState(null); // B 탭에서 선택된 태그

  useEffect(() => {
    fetchTags();
    fetchCustomers();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/tags');
      setTags(response.data.tags || []);
    } catch (error) {
      console.error('태그 조회 실패:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      // 기존 고객 API 사용 (카테고리 관계없이 전체 조회)
      const response = await axios.get('/api/customers', { params });
      console.log('고객 데이터:', response.data);
      
      const customersData = Array.isArray(response.data) ? response.data : [];
      setCustomers(customersData);
      
      // 기존 태그 정보로 초기화
      const initialTags = {};
      customersData.forEach(customer => {
        initialTags[customer.id] = customer.tags ? customer.tags.split(',').map(t => t.trim()) : [];
      });
      setSelectedTags(initialTags);
    } catch (error) {
      console.error('고객 조회 실패:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (customerId, tag) => {
    setSelectedTags(prev => {
      const current = prev[customerId] || [];
      const updated = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      return { ...prev, [customerId]: updated };
    });
  };

  const saveTags = async () => {
    try {
      const tagData = Object.entries(selectedTags).map(([customerId, tags]) => ({
        customerId: parseInt(customerId),
        tags: tags.join(',')
      }));
      
      const response = await axios.patch('/api/customers/tags/bulk', { customers: tagData });
      if (response.data.success) {
        alert('태그가 저장되었습니다.');
      } else {
        alert('태그 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('태그 저장 실패:', error);
      alert('태그 저장에 실패했습니다.');
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      const response = await axios.post('/api/tags', { name: newTag.trim() });
      if (response.data.success) {
        setNewTag('');
        await fetchTags();
        alert('태그가 추가되었습니다.');
      } else {
        alert(response.data.message || '태그 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('태그 추가 실패:', error);
      alert('태그 추가에 실패했습니다.');
    }
  };

  const updateTag = async () => {
    if (!editingTag || !newTag.trim()) return;
    
    try {
      const response = await axios.patch(`/api/tags/${editingTag.id}`, { name: newTag.trim() });
      if (response.data.success) {
        setNewTag('');
        setEditingTag(null);
        await fetchTags();
        alert('태그가 수정되었습니다.');
      } else {
        alert('태그 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('태그 수정 실패:', error);
      alert('태그 수정에 실패했습니다.');
    }
  };

  const deleteTag = async (tagId) => {
    if (!confirm('태그를 삭제하시겠습니까?')) return;
    
    try {
      const response = await axios.delete(`/api/tags/${tagId}`);
      if (response.data.success) {
        await fetchTags();
        alert('태그가 삭제되었습니다.');
      } else {
        alert('태그 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('태그 삭제 실패:', error);
      alert('태그 삭제에 실패했습니다.');
    }
  };

  const openEditTag = (tag) => {
    setEditingTag(tag);
    setNewTag(tag.name);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setNewTag('');
  };

  return (
    <div className="flex flex-1 w-full bg-white p-5">
      <div className="w-full">
        {/* 타이틀 섹션 */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">고객 태그 관리</h1>
          <div className="flex gap-3">
            <button 
              onClick={fetchCustomers} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* A/B 섹션 컨테이너 */}
        <div className="flex gap-5">
          {/* A 섹션 (70%) */}
          <div className="w-[70%]">
            {/* 조회 기간 + 태그 관리/저장 버튼 */}
            <div className="bg-gray-50 p-3 rounded-lg mb-5">
              <div className="flex gap-3 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2 h-7 border border-gray-400 rounded text-[12px]"
                  />
                  <span className="text-[12px]">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2 h-7 border border-gray-400 rounded text-[12px]"
                  />
                  <button 
                    onClick={fetchCustomers} 
                    disabled={loading}
                    className="bg-gray-300 border border-gray-400 px-4 h-7 rounded text-[12px] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? '조회중...' : '조회'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => { await fetchTags(); setShowTagModal(true); }} 
                    className="px-3 h-7 bg-purple-500 text-white rounded text-[12px] hover:bg-purple-600 transition-colors"
                  >
                    태그 관리
                  </button>
                  <button 
                    onClick={() => {
                      // 삭제 로직은 나중에 구현
                      alert('삭제 기능은 추후 구현 예정입니다.');
                    }}
                    className="px-3 h-7 bg-red-600 text-white rounded text-[12px] hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                  <button 
                    onClick={saveTags} 
                    className="px-3 h-7 bg-green-600 text-white rounded text-[12px] hover:bg-green-700 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </div>

            {/* A 섹션: 고객 태그 관리 */}
            <div className="bg-white rounded-lg shadow" style={{ height: '640px' }}>
              <div className="overflow-y-auto h-full">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr>
                      <th className="px-0 py-2 text-center font-semibold text-gray-700 text-[12px]" style={{ width: '6%' }}>SN</th>
                      <th className="px-0 py-2 text-center font-semibold text-gray-700 text-[12px]" style={{ width: '20%' }}>상호</th>
                      <th className="px-0 py-2 text-center font-semibold text-gray-700 text-[12px]" style={{ width: '3%' }}></th>
                      <th className="px-0 py-2 text-center font-semibold text-gray-700 text-[12px]" style={{ width: '30%' }}>공고명</th>
                      <th className="px-0 py-2 text-center font-semibold text-gray-700 text-[12px]">태그</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-0 py-2 text-[12px] text-center">{customer.sn || 'N/A'}</td>
                        <td className="px-0 py-2 text-[12px] text-right">
                          {customer.company_name && customer.company_name.length > 20 
                            ? customer.company_name.substring(0, 20) + '...' 
                            : customer.company_name}
                        </td>
                        <td className="px-0 py-2 text-center">
                          <input
                            type="checkbox"
                            className="rounded"
                          />
                        </td>
                        <td className="px-0 py-2 text-[12px]">{customer.title}</td>
                        <td className="px-0 py-2">
                          <div className="flex flex-wrap gap-1 justify-start" style={{ gap: '12px' }}>
                            {tags.map(tag => (
                              <label key={tag.id} className="flex items-center gap-1 text-[11px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedTags[customer.id]?.includes(tag.name) || false}
                                  onChange={() => handleTagToggle(customer.id, tag.name)}
                                  className="rounded"
                                />
                                <span>{tag.name}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* B 섹션 (30%) */}
          <div className="w-[30%]">
            <div className="bg-white rounded-lg shadow">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">태그별 보기</h2>
                
                {/* 태그 탭 */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedFilterTag(null)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedFilterTag === null
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    전체
                  </button>
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setSelectedFilterTag(tag.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedFilterTag === tag.name
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 필터링된 고객 리스트 */}
              <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                <div className="p-3">
                  {customers
                    .filter(customer => {
                      if (selectedFilterTag === null) return true;
                      const customerTags = customer.tags ? customer.tags.split(',').map(t => t.trim()) : [];
                      return customerTags.includes(selectedFilterTag);
                    })
                    .map(customer => (
                      <div key={customer.id} className="border-b border-gray-200 py-3 last:border-b-0">
                        <div className="font-medium text-sm text-gray-800 mb-1">
                          {customer.company_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {customer.title}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showTagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-96 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">태그 관리</h3>
                <button 
                  onClick={() => setShowTagModal(false)}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="p-5">
                <div className="flex gap-3 mb-5">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="새 태그명"
                    onKeyPress={(e) => e.key === 'Enter' && (editingTag ? updateTag() : addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {editingTag ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={updateTag}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      추가
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {tags.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      등록된 태그가 없습니다.
                    </div>
                  ) : (
                    tags.map(tag => (
                      <div key={tag.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-800">{tag.name}</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditTag(tag)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
                          >
                            수정
                          </button>
                          <button 
                            onClick={() => deleteTag(tag.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerTagPage; 