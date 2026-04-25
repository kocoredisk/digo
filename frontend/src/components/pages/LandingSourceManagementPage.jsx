import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = '/api/landing-sources';

const getFormUrl = (source) => `https://digo.kr/common-application-form.html?source=${encodeURIComponent(source)}`;
const getIframeCode = (source) => `<iframe src="${getFormUrl(source)}" width="420" height="600" style="border:none"></iframe>`;

const LandingSourceManagementPage = () => {
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState({ source: '', title: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setSources(res.data.data || []);
    } catch (e) {
      setError('목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSources(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
      } else {
        await axios.post(API, form);
      }
      setForm({ source: '', title: '', description: '' });
      setEditingId(null);
      fetchSources();
    } catch (e) {
      setError('저장 실패');
    }
  };

  const handleEdit = (src) => {
    setForm({ source: src.source, title: src.title, description: src.description });
    setEditingId(src.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchSources();
    } catch (e) {
      setError('삭제 실패');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('복사되었습니다!');
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>랜딩 소스 관리</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label>소스명(source)</label>
          <input name="source" value={form.source} onChange={handleChange} required disabled={!!editingId} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ flex: 2, minWidth: 180 }}>
          <label>타이틀(title)</label>
          <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ flex: 3, minWidth: 220 }}>
          <label>설명(description)</label>
          <input name="description" value={form.description} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ padding: '10px 18px', borderRadius: 6, background: '#3958fd', color: '#fff', fontWeight: 700, border: 'none', minWidth: 80 }}>{editingId ? '수정' : '등록'}</button>
        {editingId && <button type="button" onClick={() => { setForm({ source: '', title: '', description: '' }); setEditingId(null); }} style={{ padding: '10px 18px', borderRadius: 6, background: '#eee', color: '#333', fontWeight: 700, border: 'none', minWidth: 80 }}>취소</button>}
      </form>
      {error && <div style={{ color: '#e11d48', marginBottom: 16 }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc' }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 8 }}>소스명</th>
            <th style={{ padding: 8 }}>타이틀</th>
            <th style={{ padding: 8 }}>설명</th>
            <th style={{ padding: 8 }}>URL/코드</th>
            <th style={{ padding: 8 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {sources.map(src => (
            <tr key={src.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{src.source}</td>
              <td style={{ padding: 8 }}>{src.title}</td>
              <td style={{ padding: 8 }}>{src.description}</td>
              <td style={{ padding: 8, fontSize: 12 }}>
                <div style={{ marginBottom: 4 }}>
                  <input value={getFormUrl(src.source)} readOnly style={{ width: 180, fontSize: 12, marginRight: 4 }} />
                  <button type="button" onClick={() => handleCopy(getFormUrl(src.source))} style={{ fontSize: 12, padding: '2px 8px', marginRight: 2 }}>URL복사</button>
                </div>
                <div>
                  <input value={getIframeCode(src.source)} readOnly style={{ width: 260, fontSize: 12, marginRight: 4 }} />
                  <button type="button" onClick={() => handleCopy(getIframeCode(src.source))} style={{ fontSize: 12, padding: '2px 8px' }}>코드복사</button>
                </div>
              </td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleEdit(src)} style={{ fontSize: 12, padding: '2px 8px', marginRight: 4 }}>수정</button>
                <button onClick={() => handleDelete(src.id)} style={{ fontSize: 12, padding: '2px 8px', color: '#e11d48' }}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LandingSourceManagementPage; 