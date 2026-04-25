import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LandingPageEditorPage = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // 랜딩 페이지 목록 조회
  useEffect(() => {
    fetchLandingPages();
  }, []);

  // 선택된 페이지의 HTML 내용 로드
  useEffect(() => {
    if (selectedPage) {
      loadPageContent(selectedPage);
    }
  }, [selectedPage]);

  const fetchLandingPages = async () => {
    try {
      const response = await axios.get('/api/landing-pages');
      setLandingPages(response.data.data || []);
    } catch (error) {
      console.error('랜딩 페이지 목록 조회 실패:', error);
    }
  };

  const loadPageContent = async (folderName) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/landing-pages/${folderName}/content`);
      setHtmlContent(response.data.content);
    } catch (error) {
      console.error('페이지 내용 로드 실패:', error);
      setHtmlContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPage) return;

    setIsSaving(true);
    setSaveStatus('저장 중...');

    try {
      await axios.put(`/api/landing-pages/${selectedPage}/content`, {
        content: htmlContent
      });
      setSaveStatus('저장 완료!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('저장 실패');
      console.error('저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (selectedPage) {
      window.open(`/landings/${selectedPage}`, '_blank');
    }
  };

  const handlePageChange = (e) => {
    setSelectedPage(e.target.value);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">랜딩페이지 편집</h1>
            <p className="text-sm text-gray-600">생성된 랜딩 페이지를 선택하여 편집하세요</p>
          </div>
          <div className="flex items-center gap-4">
            {/* 랜딩 페이지 선택 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">랜딩 페이지:</label>
              <select
                value={selectedPage}
                onChange={handlePageChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {landingPages.map((page) => (
                  <option key={page.folder_name} value={page.folder_name}>
                    {page.title} ({page.folder_name})
                  </option>
                ))}
              </select>
            </div>
            
            {/* 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={handlePreview}
                disabled={!selectedPage}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                미리보기
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedPage || isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
        
        {/* 상태 메시지 */}
        {saveStatus && (
          <div className={`mt-2 p-2 rounded text-sm ${
            saveStatus.includes('실패') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {saveStatus}
          </div>
        )}
      </div>

      {/* 편집기와 프리뷰 */}
      <div className="flex-1 flex">
        {/* HTML 편집기 */}
        <div className="w-1/2 border-r border-gray-200">
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">HTML 편집</h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">로딩 중...</div>
              </div>
            ) : (
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="w-full h-full p-4 border border-gray-300 rounded font-mono text-sm resize-none"
                placeholder={selectedPage ? "HTML 내용을 편집하세요..." : "랜딩 페이지를 선택하세요"}
                disabled={!selectedPage}
                style={{ minHeight: '500px' }}
              />
            )}
          </div>
        </div>

        {/* 실시간 프리뷰 */}
        <div className="w-1/2">
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">실시간 프리뷰</h2>
            <div className="border border-gray-300 rounded bg-white h-full">
              {selectedPage ? (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full h-full border-0"
                  title="Preview"
                  style={{ minHeight: '500px' }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  랜딩 페이지를 선택하면 프리뷰가 표시됩니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageEditorPage; 