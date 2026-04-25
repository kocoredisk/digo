import React, { useEffect, useState } from 'react';

const API = '/api/landing-sources';

const CommonFormManagementPage = () => {
  const [services, setServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    service_id: '',
    company_id: '',
    title: '',
    description: '',
    location: ''
  });
  const [sources, setSources] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchServices();
    fetchCompanies();
    fetchSources();
  }, []);

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };
  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    const data = await res.json();
    setCompanies(data);
  };
  const fetchSources = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setSources(data.data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ service_id: '', company_id: '', title: '', description: '', location: '' });
    fetchSources();
  };

  return (
    <div className="pt-6 pb-6 flex flex-col items-center">
      <div className="mb-6 w-full">
        <h1 className="text-2xl font-semibold text-gray-800 pl-2">공통 신청 폼 관리</h1>
      </div>
      {/* 등록 폼 파란 테두리 박스 */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-600 mb-8 p-6 w-full">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
          <div>
            <label className="block text-xs mb-1">서비스</label>
            <select name="service_id" value={form.service_id} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-36">
              <option value="">선택</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.identifier})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">제휴사</label>
            <select name="company_id" value={form.company_id} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-36">
              <option value="">선택</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.identifier})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">타이틀</label>
            <input name="title" value={form.title} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-48" placeholder="타이틀" />
          </div>
          <div>
            <label className="block text-xs mb-1">설명</label>
            <input name="description" value={form.description} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-96" placeholder="설명" />
          </div>
          <div>
            <label className="block text-xs mb-1">공통폼 탑재 위치</label>
            <input name="location" value={form.location} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-96" placeholder="경로" />
          </div>
          <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded text-sm hover:bg-blue-700 transition-colors w-24 ml-auto flex-shrink-0">등록</button>
        </form>
      </div>
      {/* 목록 박스 (파란 테두리, 등록 박스와 동일 가로폭) */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-600 p-0 w-full">
        <div className="flex w-full gap-0" style={{ minHeight: 400 }}>
          {/* A: 리스트 (왼쪽 50%) */}
          <div className="flex-1 min-w-0 p-6" style={{ flexBasis: '50%' }}>
            <table className="w-full text-sm border border-blue-200 rounded">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-2 px-3 border-b border-blue-200 text-left">서비스ID</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-left">제휴사ID</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-left">타이틀</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center">공통폼 탑재 위치</th>
                  <th className="py-2 px-3 border-b border-blue-200 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {sources.map(src => (
                  <tr key={src.id}>
                    <td className="py-2 px-3 border-b border-blue-100">{src.service_id || '-'}</td>
                    <td className="py-2 px-3 border-b border-blue-100">{src.company_id || '-'}</td>
                    <td className="py-2 px-3 border-b border-blue-100">{src.title}</td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center">
                      <button type="button" className="text-xs text-blue-700 underline" onClick={() => setSelectedLocation(src.location)}>{src.location}</button>
                    </td>
                    <td className="py-2 px-3 border-b border-blue-100 text-center">
                      <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded">복사</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* B: 공통폼 미리보기 (오른쪽 50%) */}
          <div className="flex-1 min-w-0 flex items-start justify-center p-6" style={{ flexBasis: '50%' }}>
            {selectedLocation ? (
              <iframe
                src={selectedLocation}
                width={600}
                height={600}
                className="border border-blue-300 rounded shadow"
                title="공통 신청폼 미리보기"
              />
            ) : (
              <div className="text-gray-400 text-center w-full py-24">공통폼 탑재 위치를 클릭하면 미리보기가 표시됩니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonFormManagementPage; 