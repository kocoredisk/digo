import React, { useEffect, useState, useRef } from 'react';

const LandingPageManagementPage = () => {
  const [mappings, setMappings] = useState([]);
  const [services, setServices] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [form, setForm] = useState({
    service_id: '',
    folder_file: '',
    thumbnail: '',
    salesperson_ids: []
  });
  const [showSalespersonModal, setShowSalespersonModal] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailModal, setThumbnailModal] = useState(null);
  const [serviceFilter, setServiceFilter] = useState('');
  const [copiedUrl, setCopiedUrl] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetchMappings();
    fetchServices();
    fetchSalespersons();
  }, []);

  const fetchMappings = async () => {
    const res = await fetch('/api/landing-mappings');
    const data = await res.json();
    setMappings(data);
  };
  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };
  const fetchSalespersons = async () => {
    const res = await fetch('/api/salespersons');
    const data = await res.json();
    setSalespersons(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalespersonSelect = (id) => {
    setForm((prev) => {
      const exists = prev.salesperson_ids.includes(id);
      return {
        ...prev,
        salesperson_ids: exists
          ? prev.salesperson_ids.filter((sid) => sid !== id)
          : [...prev.salesperson_ids, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_id || !form.folder_file || form.salesperson_ids.length === 0) {
      alert('필수값을 입력하세요.');
      return;
    }
    for (const salesperson_id of form.salesperson_ids) {
      const service = services.find(s => s.id === form.service_id);
      const salesperson = salespersons.find(p => p.id === salesperson_id);
      const url_path = `${form.folder_file.replace(/\/+$/, '')}/${salesperson.identifier}`;
      const [folder, ...fileParts] = form.folder_file.split('/');
      const landing_folder = folder;
      await fetch('/api/landing-mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landing_folder,
          service_id: form.service_id,
          salesperson_id,
          url_path,
          thumbnail: form.thumbnail
        })
      });
    }
    setForm({ service_id: '', folder_file: '', thumbnail: '', salesperson_ids: [] });
    fetchMappings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await fetch(`/api/landing-mappings/${id}`, { method: 'DELETE' });
    fetchMappings();
  };

  const handlePreview = (mapping) => {
    window.open(`/landings/${mapping.landing_folder}/${mapping.url_path}`, '_blank');
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(''), 1200);
  };

  const handleThumbnailFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const folder = form.folder_file.split('/')[0];
    if (!folder) {
      alert('폴더/파일명을 먼저 입력하세요.');
      return;
    }
    const formData = new FormData();
    formData.append('thumbnail', file);
    formData.append('landing_folder', folder);
    const res = await fetch('/api/landing-thumbnail-upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url) setForm(f => ({ ...f, thumbnail: data.url }));
  };

  const filteredMappings = serviceFilter
    ? mappings.filter(m => m.service_id === serviceFilter)
    : mappings;

  return (
    <div className="pt-6 pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 pl-2">랜딩 페이지 관리</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-600 mb-8 p-6">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
          <div>
            <label className="block text-xs mb-1">서비스</label>
            <select name="service_id" value={form.service_id} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-36">
              <option value="">선택</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.identifier})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">폴더/파일명</label>
            <input name="folder_file" value={form.folder_file} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-[400px]" placeholder="예: sky/SkyLanding.jsx" />
          </div>
          <div>
            <label className="block text-xs mb-1">썸네일</label>
            <div className="relative">
              <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className="px-3 py-2 border border-blue-400 rounded text-sm w-[400px] pr-12" placeholder="이미지 URL" />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-200 rounded" onClick={() => fileInputRef.current && fileInputRef.current.click()}>찾기</button>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleThumbnailFile} />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1">영업자</label>
            <button type="button" onClick={() => setShowSalespersonModal(true)} className="px-3 py-2 border border-blue-400 rounded text-sm w-36 bg-gray-50">{form.salesperson_ids.length ? `${form.salesperson_ids.length}명 선택됨` : '선택'}</button>
          </div>
          <div className="flex-1 w-full max-w-[900px] min-h-[40px] max-h-[80px] overflow-y-auto bg-gray-50 rounded px-2 py-1 flex flex-wrap items-center gap-1 border border-blue-400">
            {form.salesperson_ids.map(id => {
              const p = salespersons.find(x => x.id === id);
              return p ? <span key={id} className="px-2 py-1 bg-gray-100 rounded text-xs whitespace-nowrap">{p.name} ({p.identifier})</span> : null;
            })}
          </div>
          <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded text-sm hover:bg-blue-700 transition-colors w-24 ml-auto flex-shrink-0">생성</button>
        </form>
        {thumbnailPreview && (
          <div className="mt-2"><img src={thumbnailPreview} alt="썸네일 미리보기" className="w-32 h-20 object-cover border rounded" /></div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold">매핑 목록</h2>
          <select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value="">전체</option>
            {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.identifier})</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">서비스</th>
                <th className="px-3 py-2 text-left">영업자</th>
                <th className="px-3 py-2 text-left">URL</th>
                <th className="px-3 py-2 text-left">썸네일</th>
                <th className="px-3 py-2 text-center">삭제</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.map(m => {
                const url = `/landings/${m.landing_folder}/${m.url_path}`;
                return (
                  <tr key={m.id} className="border-b">
                    <td className="px-3 py-2">{m.service_name} ({m.service_identifier})</td>
                    <td className="px-3 py-2">{m.salesperson_name} ({m.salesperson_identifier})</td>
                    <td className="px-3 py-2 flex gap-2 items-center">
                      <span className="truncate max-w-[220px]">{url}</span>
                      <button onClick={()=>handleCopy(window.location.origin+url)} className="text-gray-500 hover:text-blue-600" title="복사"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/><rect width="12" height="12" x="2" y="10" rx="2" stroke="currentColor" strokeWidth="2"/></svg></button>
                      {copiedUrl===window.location.origin+url && <span className="text-green-600 text-xs ml-1">복사됨!</span>}
                      <button onClick={()=>handlePreview(m)} className="text-blue-600 underline text-xs ml-2">미리보기</button>
                    </td>
                    <td className="px-3 py-2">
                      {m.thumbnail && (
                        <button onClick={() => setThumbnailModal(m.thumbnail)} className="underline text-blue-600">보기</button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center"><button onClick={() => handleDelete(m.id)} className="text-red-600 underline">삭제</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {showSalespersonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">영업자 선택</h3>
            <div className="space-y-2 mb-4">
              {salespersons.map(p => (
                <label key={p.id} className="flex items-center gap-2">
                  <input type="checkbox" checked={form.salesperson_ids.includes(p.id)} onChange={() => handleSalespersonSelect(p.id)} />
                  <span>{p.name} ({p.identifier})</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setShowSalespersonModal(false)}>확인</button>
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowSalespersonModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
      {thumbnailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={()=>setThumbnailModal(null)}>
          <img src={thumbnailModal} alt="썸네일 원본" className="max-w-[80vw] max-h-[80vh] border-4 border-white rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default LandingPageManagementPage; 