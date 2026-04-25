import React, { useState, useRef, useEffect } from 'react';

function EmailTemplatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmailError, setTestEmailError] = useState('');
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  const defaultTemplates = [
    { id: 'A1', name: 'A1 - 메일로 꼬시기 1형', content: '' },
    { id: 'A2', name: 'A2 - 메일로 꼬시기 2형', content: '' },
    { id: 'A3', name: 'A3 - 메일로 꼬시기 3형', content: '' },
    { id: 'B1', name: 'B1 - 상담신청관리 1형', content: '' },
    { id: 'B2', name: 'B2 - 상담신청관리 2형', content: '' },
    { id: 'B3', name: 'B3 - 상담신청관리 3형', content: '' },
    { id: 'C1', name: 'C1 - 링키 세무사 제안 메일', content: '' }
  ];

  const templates = [
    { id: 'A1', name: 'A1 - 메일로 꼬시기 1형' },
    { id: 'A2', name: 'A2 - 메일로 꼬시기 2형' },
    { id: 'A3', name: 'A3 - 메일로 꼬시기 3형' },
    { id: 'B1', name: 'B1 - 상담신청관리 1형' },
    { id: 'B2', name: 'B2 - 상담신청관리 2형' },
    { id: 'B3', name: 'B3 - 상담신청관리 3형' }
  ];

  // 템플릿 로드
  const loadTemplate = async (templateId) => {
    if (!templateId) {
      setSubject('');
      setHtmlContent('');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/email-templates/${templateId}`);
      const data = await response.json();
      if (data.success) {
        setSubject(data.subject || '');
        setHtmlContent(data.html || '');
      } else {
        setSubject('');
        setHtmlContent('');
      }
    } catch (error) {
      setSubject('');
      setHtmlContent('');
    } finally {
      setLoading(false);
    }
  };

  // 템플릿 선택 시 상태 변경 및 내용 로드
  const handleTemplateChange = (e) => {
    const value = e.target.value;
    setSelectedTemplate(value);
  };

  // selectedTemplate이 바뀔 때마다 서버에서 내용 로드
  useEffect(() => {
    loadTemplate(selectedTemplate);
    // eslint-disable-next-line
  }, [selectedTemplate]);

  // 템플릿 저장
  const saveTemplate = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/email-templates/${selectedTemplate}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, html: htmlContent })
      });
      const data = await response.json();
      if (data.success) {
        alert('템플릿이 저장되었습니다.');
      } else {
        alert('템플릿 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('템플릿 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 이메일 형식 검증 함수
  const validateEmails = (emails) => {
    const emailList = emails.split(',').map(e => e.trim()).filter(Boolean);
    if (emailList.length === 0) return false;
    const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    return emailList.every(email => emailRegex.test(email));
  };

  // 입력값 변경 시 검증
  useEffect(() => {
    if (!testEmail) {
      setTestEmailError('');
      return;
    }
    if (!validateEmails(testEmail)) {
      setTestEmailError('올바른 이메일 주소를 입력하세요. (여러 개는 ,로 구분)');
    } else {
      setTestEmailError('');
    }
  }, [testEmail]);

  // 테스트 메일 발송 핸들러 (실제 발송)
  const handleSendTestMail = async () => {
    if (!testEmail || sendingTest) return; // 이미 발송 중이면 즉시 리턴
    setSendingTest(true);
    setTestEmailError('');
    const emailList = testEmail.split(',').map(e => e.trim()).filter(Boolean);
    let successCount = 0;
    let failCount = 0;
    for (const email of emailList) {
      try {
        const response = await fetch('/api/send-campaign-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailType: selectedTemplate.replace('A','').replace('B','') + '형',
            email,
            companyName: '테스트',
            subject,
            html: htmlContent
          })
        });
        const data = await response.json();
        if (data.success) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
    }
    alert(`테스트 메일 발송 완료: 성공 ${successCount}건, 실패 ${failCount}건`);
    setSendingTest(false);
    // 이메일 입력창 초기화 제거 - 브라우저 자동완성 유지
  };

  // 스크롤바 스타일 적용
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .modern-scrollbar::-webkit-scrollbar { width: 7px; background: #f3f4f6; }
      .modern-scrollbar::-webkit-scrollbar-thumb { background: #bdbdbd; border-radius: 6px; }
      .modern-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
      .modern-scrollbar { scrollbar-width: thin; scrollbar-color: #bdbdbd #f3f4f6; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="pt-6 pb-6">
      <div className="mb-3">
        <div className="flex gap-3 justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 pl-2">이메일 템플릿 관리</h1>
          <div className="flex items-center gap-2">
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-56 px-3 py-1 h-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ fontSize: '15px' }}
            >
              <option value="">템플릿 선택</option>
              {defaultTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <button
              type="button"
              disabled
              className="px-3 py-1 h-8 text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
              style={{ background: '#e0f2fe', color: '#2563eb', fontWeight: 500, border: 'none', pointerEvents: 'none', cursor: 'default' }}
            >
              테스트 메일 보내기
            </button>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              className="px-3 py-1 h-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ width: '600px', fontSize: '15px' }}
              placeholder="받을 이메일(여러 개는 ,로 구분)"
              autoComplete="email"
              name="test-email"
            />
            <button
              onClick={handleSendTestMail}
              disabled={sendingTest || !testEmail || !!testEmailError}
              className="px-3 py-1 h-8 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
            >
              테스트 발송
            </button>
          </div>
        </div>
      </div>
      {/* 컨텐츠 카드/그리드 영역 */}
      <div className="bg-white rounded-lg shadow">
        {/* 이하 컨텐츠 영역은 기존대로 유지 */}
        {/* 편집/미리보기 영역 */}
        <div className="flex gap-4" style={{ width: '100%', minWidth: 0, height: 640, minHeight: 640 }}>
          {/* 왼쪽: 편집 영역 */}
          <div ref={editorRef} className="flex-1 bg-white border border-gray-200 rounded-lg p-4 flex flex-col" style={{ minWidth: 0, height: '700px', minHeight: 0, maxWidth: '50%' }}>
            {loading ? (
              <div className="flex-1 flex justify-center items-center text-gray-500">템플릿을 불러오는 중...</div>
            ) : (
              <div className="flex-1 flex flex-col gap-3">
                {/* 제목 입력: 한 줄에 라벨+입력칸+저장버튼 */}
                <div className="flex items-center gap-2 mb-2" style={{ width: '100%' }}>
                  <label className="block text-sm font-medium text-gray-700 mb-0" style={{ minWidth: 48 }}>제목</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이메일 제목을 입력하세요..."
                    disabled={!selectedTemplate}
                  />
                  <button
                    onClick={saveTemplate}
                    disabled={saving || !selectedTemplate}
                    className="px-3 py-1 h-8 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    style={{ minHeight: 0, fontWeight: 500, opacity: saving || !selectedTemplate ? 0.5 : 1 }}
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
                {/* 본문 편집기: 소타이틀 없이 바로 textarea */}
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full flex-1 p-3 border border-gray-300 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none modern-scrollbar"
                  placeholder="HTML 코드를 입력하세요..."
                  disabled={!selectedTemplate}
                  style={{ minWidth: 0, overflowY: 'auto', height: '620px', maxHeight: '620px' }}
                />
              </div>
            )}
          </div>
          {/* 오른쪽: 실시간 미리보기 */}
          <div ref={previewRef} className="flex-1 bg-white border border-gray-200 rounded-lg p-4 overflow-auto modern-scrollbar" style={{ minWidth: 0, height: '700px', minHeight: 0, maxWidth: '50%' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-3">미리보기</h3>
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-500">미리보기를 불러오는 중...</div>
            ) : (
              <div
                className="border border-gray-300 rounded p-4 bg-white modern-scrollbar"
                style={{ width: '100%', minWidth: 0, height: '620px', maxHeight: '620px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailTemplatePage; 