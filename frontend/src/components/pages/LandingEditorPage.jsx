import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

const LandingEditorPage = () => {
  const { folderName } = useParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadLandingPage();
  }, [folderName]);

  const loadLandingPage = async () => {
    try {
      const response = await axios.get(`/api/landing-pages/${folderName}/content`);
      setHtmlContent(response.data.content);
    } catch (error) {
      console.error('랜딩 페이지 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('저장 중...');

    try {
      await axios.put(`/api/landing-pages/${folderName}/content`, {
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
    window.open(`/landings/${folderName}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">랜딩 페이지 편집기</h1>
            <p className="text-sm text-gray-600">폴더: {folderName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreview}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              미리보기
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
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
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">HTML 편집</h2>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="w-full h-full p-4 border border-gray-300 rounded font-mono text-sm resize-none"
              placeholder="HTML 내용을 입력하세요..."
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>

        {/* 실시간 프리뷰 */}
        <div className="w-1/2">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">실시간 프리뷰</h2>
            <div className="border border-gray-300 rounded bg-white" style={{ minHeight: '500px' }}>
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0"
                title="Preview"
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingEditorPage; 