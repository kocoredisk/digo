import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LandingPageCreationPage = () => {
  const [url, setUrl] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [landingPages, setLandingPages] = useState([]);

  // 기존 랜딩 페이지 목록 조회
  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      const response = await axios.get('/api/landing-pages');
      setLandingPages(response.data.data || []);
    } catch (error) {
      console.error('랜딩 페이지 목록 조회 실패:', error);
    }
  };

  // URL에서 폴더명 자동 생성
  const generateFolderName = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/\./g, '_');
      const pathname = urlObj.pathname.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      return `${hostname}${pathname}`.toLowerCase();
    } catch {
      return '';
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl) {
      setFolderName(generateFolderName(newUrl));
    }
  };

  const handleCreateLandingPage = async () => {
    if (!url || !folderName) {
      setError('URL과 폴더명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/landing-pages/scrape', {
        url,
        folderName
      });

      setResult(response.data);
      fetchLandingPages(); // 목록 새로고침
    } catch (error) {
      setError(error.response?.data?.message || '랜딩 페이지 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (folderName) => {
    const isLocal = window.location.port === '5176';
    const url = isLocal
      ? `http://localhost:3004/landings/${folderName}`
      : `/landings/${folderName}`;
    window.open(url, '_blank');
  };

  const handleEdit = (folderName) => {
    window.open(`/landing-editor/${folderName}`, '_blank');
  };

  const handleDelete = async (folderName) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/api/landing-pages/${folderName}`);
      fetchLandingPages();
    } catch (error) {
      alert('삭제 실패: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">랜딩페이지 만들기</h1>
        <p className="text-gray-600">외부 사이트를 스크래핑하여 자동으로 랜딩 페이지를 생성합니다.</p>
      </div>

      {/* 입력 폼 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">새 랜딩 페이지 생성</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              스크래핑할 URL
            </label>
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              폴더명 (식별자)
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="example_com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              이 폴더명으로 /landings/{folderName} 형태의 URL이 생성됩니다.
            </p>
          </div>

          <button
            onClick={handleCreateLandingPage}
            disabled={isLoading || !url || !folderName}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '생성 중...' : '랜딩 페이지 생성'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-semibold mb-2">생성 완료!</h3>
            <p>폴더: {result.folderName}</p>
            <p>URL: <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">{result.url}</a></p>
            <p>이미지 개수: {result.imageCount}개</p>
          </div>
        )}
      </div>

      {/* 기존 랜딩 페이지 목록 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">생성된 랜딩 페이지 목록</h2>
        
        {landingPages.length === 0 ? (
          <p className="text-gray-500">생성된 랜딩 페이지가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landingPages.map((page) => (
              <div key={page.folder_name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{page.title}</h3>
                <p className="text-sm text-gray-600 mb-2">폴더: {page.folder_name}</p>
                <p className="text-sm text-gray-600 mb-3">생성일: {new Date(page.created_at).toLocaleDateString()}</p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreview(page.folder_name)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    미리보기
                  </button>
                  <button
                    onClick={() => handleEdit(page.folder_name)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(page.folder_name)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageCreationPage; 