import { useState, useEffect, useMemo, useCallback, memo } from 'react';

const initialSmsTemplates = [
  {
    id: 1,
    name: '스타트업용',
    text: '스타트업 사장님, 안녕하세요! 아래 유튜브 영상을 꼭 보시기 바랍니다.\n\nhttps://youtu.be/startup-link',
  },
  {
    id: 2,
    name: '3년차 이상 기업용',
    text: '대표님, 정리를 구하기 힘드시죠? 아래 영상을 참고해 주세요.\n\nhttps://youtu.be/mature-link',
  },
];

const initialMailTemplates = [
  {
    id: 1,
    name: '탄탄경리 도입 제안',
    subject: '{{상호}} 대표님, 탄탄경리 서비스 도입 제안드립니다.',
    body: `안녕하세요, {{상호}} 대표님.<br/><br/>
    
    저희는 초기 창업 기업 및 중소기업을 위한 **경리 아웃소싱 서비스 '탄탄경리'**를 운영하고 있습니다.<br/><br/>

    탄탄경리 서비스는 사업 초기의 복잡한 경리 체계 셋업, 실무에 가까운 자금관리, 급여, 세무 대응, 연차/근태 관리 등을 전문 경리 인력과 노무사와 함께 원격으로 처리해 드리는 서비스입니다.<br/><br/>

    📌 최근 근로기준법의 강화에 따라 연차 관리, 근태 관리 등 노무적 이슈가 많이 발생하고 있습니다. 이러한 부분에 대해서도 노무사와 함께 탄탄경리 서비스를 제공하고 있습니다.<br/><br/>

    📌 지금도 많은 스타트업과 2~3년차 기업들이 저희 서비스를 이용하며 **"경리에 대한 고민 없이 사업에 집중할 수 있었다"**는 피드백을 주고 계십니다.<br/><br/>

    ✅ 실제 도입 사례<br/><br/>

    🚀 서울 소재, SNS 광고 스타트업 (8인 규모)<br/>
    "대표가 직접 경리 엑셀을 하다 어려움을 겪었는데, 탄탄경리가 전체 체계를 잡아줬습니다."<br/><br/>

    🌐 인천 소재, 수출입 스타트업<br/>
    "해외 출장이 잦아 사무실 비우는 일이 많았는데, 탄탄경리 덕분에 직원도 줄고 4년째 잘 쓰고 있어요."<br/><br/>

    👀 1분 정도의 영상으로 서비스 개요를 간단히 확인하실 수 있습니다:<br/>
    👉 <a href="https://youtu.be/서비스링크">https://youtu.be/서비스링크</a><br/><br/>

    혹시 1시간 정도만 편하신 시간을 내주신다면 서비스의 주요 구성과 활용 사례를 직접 안내해드릴 수 있습니다. 메일 또는 전화로 회신 주시면 담당자가 일정을 조율드리겠습니다.<br/><br/>

    감사합니다.<br/><br/>

    탄탄경리 서비스팀 드림
    `,
    youtube: 'https://youtu.be/서비스링크',
  },
];

const initialLogs = [
  { id: 1, type: 'sms', text: '문자 발송(스타트업용)', date: '2024-06-19 10:23' },
  { id: 2, type: 'mail', text: '메일 발송(3년차)', date: '2024-06-19 10:25' },
  { id: 3, type: 'call', text: '전화 통화(긍정)', date: '2024-06-19 10:30' },
  { id: 4, type: 'comment', text: '코멘트: 추가 문의 예정', date: '2024-06-19 10:35' },
  { id: 5, type: 'sms', text: '문자 발송(3년차)', date: '2024-06-18 09:10' },
];

// SMS 템플릿 추가/수정 모달 컴포넌트
const SmsTemplateModal = memo(({ isOpen, onClose, onSave, editingTemplate = null, templateType = 'sms' }) => {
  console.log('SmsTemplateModal 렌더링 - isOpen:', isOpen);
  
  const [template, setTemplate] = useState({ 
    name: '', 
    text: '',
    type: 'sms',
    body: ''
  });

  // 편집 모드일 때 템플릿 데이터 설정
  useEffect(() => {
    console.log('SmsTemplateModal useEffect - isOpen:', isOpen, 'editingTemplate:', editingTemplate);
    if (isOpen) {
      if (editingTemplate) {
        setTemplate({
          name: editingTemplate.name || '',
          text: editingTemplate.text || '',
          type: editingTemplate.type || 'sms',
          body: editingTemplate.body || ''
        });
      } else {
        setTemplate({ name: '', text: '', type: templateType, body: '' });
      }
    }
  }, [isOpen, editingTemplate, templateType]);

  const handleSave = useCallback((e) => {
    console.log('모달 저장 버튼 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    if (template.name && template.text) {
      console.log('템플릿 저장:', template);
      onSave({ ...template, id: editingTemplate?.id || Date.now() });
    }
  }, [template, editingTemplate, onSave]);

  const handleClose = useCallback((e) => {
    console.log('모달 닫기 버튼 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    console.log('모달 배경 클릭됨');
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  console.log('SmsTemplateModal 렌더링 조건 확인 - isOpen:', isOpen);
  if (!isOpen) {
    console.log('모달이 열려있지 않음 - 렌더링하지 않음');
    return null;
  }

  console.log('모달 렌더링 시작');
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {template.type === 'sms' ? '문자 메시지 템플릿' : '이메일 템플릿'}
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          {!editingTemplate && (
            <div>
              <label className="block text-sm font-medium mb-1">템플릿 유형</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={template.type}
                onChange={(e) => setTemplate({ ...template, type: e.target.value })}
              >
                <option value="sms">문자 메시지</option>
                <option value="email">이메일 메시지</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">템플릿명</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              placeholder={template.type === 'sms' ? "예: 스타트업용 문자" : "예: 스타트업용 이메일"}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={template.subject || ''}
              onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
              placeholder="템플릿 제목을 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">내용</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 h-48 resize-none"
              value={template.text}
              onChange={(e) => setTemplate({ ...template, text: e.target.value })}
              placeholder={template.type === 'sms' ? 
                "문자 내용을 입력하세요...&#10;&#10;유튜브 링크도 함께 입력할 수 있습니다:&#10;https://youtu.be/..." : 
                "이메일 내용을 입력하세요...&#10;&#10;유튜브 링크도 함께 입력할 수 있습니다:&#10;https://youtu.be/..."
              }
              required
            />
          </div>
          
          {template.type === 'email' && (
            <div>
              <label className="block text-sm font-medium mb-1">이메일 본문</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-48 resize-none"
                value={template.body}
                onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                placeholder="이메일 본문을 입력하세요...&#10;&#10;유튜브 링크도 함께 입력할 수 있습니다:&#10;https://youtu.be/..."
                required
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

SmsTemplateModal.displayName = 'SmsTemplateModal';

const DetailTabs = memo(({ customer }) => {
  // 내부 상태로 관리
  const [tab, setTab] = useState('log');
  const [smsTemplates, setSmsTemplates] = useState(initialSmsTemplates);
  const [mailTemplates, setMailTemplates] = useState(initialMailTemplates);
  const [logs, setLogs] = useState(initialLogs);
  const [editingSms, setEditingSms] = useState(null);
  const [editingMail, setEditingMail] = useState(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [newMail, setNewMail] = useState({ name: '', subject: '', body: '', youtube: '' });
  const [templateType, setTemplateType] = useState('sms');

  const handleSmsSend = useCallback((template) => {
    console.log(`문자 발송: ${template.name} - ${template.text}`);
    
    const newLog = {
      id: Date.now(),
      type: 'sms',
      text: `문자 발송(${template.name})`,
      date: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    
    setLogs(prev => [newLog, ...prev.slice(0, 4)]);
  }, []);

  const handleMailSend = useCallback(async (template) => {
    if (!customer || !customer.email) {
      alert('고객의 이메일 주소가 등록되어 있지 않습니다.');
      return;
    }

    // {{상호}} 변수를 실제 고객 상호로 치환
    const subject = template.subject.replace(/{{상호}}/g, customer.companyName || '');
    const html = (template.body || template.text).replace(/{{상호}}/g, customer.companyName || '');

    // --- 디버깅용 로그 추가 ---
    console.log('--- 메일 발송 데이터 확인 ---');
    console.log('To:', customer.email);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('Original Template:', template);
    // -------------------------

    try {
      const response = await fetch('http://localhost:3003/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: customer.email, subject, html }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '메일 발송에 실패했습니다.');
      }
      
      // 성공 로그 추가
      const newLog = {
        id: Date.now(),
        type: 'mail',
        text: `메일 발송(${template.name}) - ${customer.companyName}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
      setLogs(prev => [newLog, ...prev.slice(0, 9)]);

      alert('메일이 성공적으로 발송되었습니다.');

    } catch (error) {
      console.error('!!! 메일 발송 중 심각한 오류 발생 !!!', error);
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다. 개발자 콘솔(F12)을 확인해주세요.';
      alert(`메일 발송 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }, [customer, setLogs]);

  const handleSmsEdit = useCallback((template) => {
    console.log('SMS 편집 시작:', template);
    setEditingSms(template);
    setShowSmsModal(true);
  }, []);

  const handleMailEdit = useCallback((template) => {
    console.log('이메일 편집 시작:', template);
    setEditingSms(template);
    setShowSmsModal(true);
  }, []);

  const handleSmsTemplateSave = useCallback((newTemplate) => {
    console.log('템플릿 저장:', newTemplate);
    if (newTemplate.type === 'sms') {
      if (editingSms) {
        setSmsTemplates(prev => prev.map(t => t.id === editingSms.id ? newTemplate : t));
      } else {
        setSmsTemplates(prev => [...prev, newTemplate]);
      }
    } else {
      // 이메일 템플릿인 경우
      if (editingSms) {
        setMailTemplates(prev => prev.map(t => t.id === editingSms.id ? newTemplate : t));
      } else {
        setMailTemplates(prev => [...prev, newTemplate]);
      }
    }
    setShowSmsModal(false);
    setEditingSms(null);
    // 탭 상태는 변경하지 않음 - 현재 탭 유지
  }, [editingSms]);

  const handleSmsDelete = useCallback((templateId) => {
    console.log('템플릿 삭제:', templateId);
    setSmsTemplates(prev => prev.filter(t => t.id !== templateId));
  }, []);

  const openSmsModal = useCallback(() => {
    console.log('openSmsModal 호출됨');
    setEditingSms(null);
    setShowSmsModal(true);
    console.log('모달 상태 설정 완료 - showSmsModal:', true);
    // 탭 상태는 변경하지 않음 - 현재 탭 유지
  }, []);

  const closeSmsModal = useCallback(() => {
    console.log('closeSmsModal 호출됨');
    setShowSmsModal(false);
    setEditingSms(null);
    console.log('모달 상태 설정 완료 - showSmsModal:', false);
    // 탭 상태는 변경하지 않음 - 현재 탭 유지
  }, []);

  const handleTabChange = useCallback((newTab) => {
    console.log(`${newTab} 탭 클릭됨`);
    setTab(newTab);
  }, []);

  const handleAddTemplate = useCallback((e) => {
    console.log('handleAddTemplate 호출됨', e);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('새 템플릿 추가 버튼 클릭');
    openSmsModal();
  }, [openSmsModal]);

  // 메모이제이션된 로그 렌더링
  const logContent = useMemo(() => (
    <>
      {logs.slice(0, 5).map(log => (
        <>
          <span className="text-gray-500 text-xs">[{log.date.split(' ')[0]}]</span>
          <span className="text-xs">{log.text}</span>
        </>
      ))}
      {logs.length > 5 && <div className="text-xs text-blue-500 cursor-pointer">더보기</div>}
    </>
  ), [logs]);

  // 메모이제이션된 SMS 템플릿 렌더링
  const smsContent = useMemo(() => (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {smsTemplates.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm mb-3">등록된 문자 템플릿이 없습니다.</p>
        </div>
      ) : (
        <>
          {smsTemplates.map(tpl => (
            <div key={tpl.id}>
              {editingSms === tpl.id ? (
                <div className="border border-gray-200 rounded p-2 bg-gray-50 space-y-2">
                  <input 
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs" 
                    value={tpl.name} 
                    onChange={e => {
                      setSmsTemplates(list => list.map(t => t.id === tpl.id ? { ...t, name: e.target.value } : t));
                    }} 
                    placeholder="템플릿명"
                  />
                  <textarea 
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs h-32 resize-none" 
                    value={tpl.text} 
                    onChange={e => {
                      setSmsTemplates(list => list.map(t => t.id === tpl.id ? { ...t, text: e.target.value } : t));
                    }} 
                    placeholder="문자 내용과 유튜브 링크를 함께 입력하세요..."
                  />
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingSms(null);
                      }}
                    >
                      저장
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingSms(null);
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 border border-gray-200 rounded p-2 bg-yellow-50 relative">
                    <div className="font-semibold text-xs pr-20">{tpl.name}</div>
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSmsEdit(tpl);
                        }}
                        className="text-gray-400 hover:text-blue-600 text-[10px]"
                        title="수정"
                      >
                        수정
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSmsDelete(tpl.id);
                        }}
                        className="text-gray-400 hover:text-red-600 text-[10px]"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSmsSend(tpl);
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 font-semibold h-full"
                  >
                    발송
                  </button>
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  ), [smsTemplates, editingSms, handleSmsEdit, handleSmsDelete, handleSmsSend]);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {/* SMS 템플릿 추가/수정 모달 */}
      {console.log('DetailTabs 렌더링 - showSmsModal:', showSmsModal)}
      <SmsTemplateModal
        isOpen={showSmsModal}
        onClose={closeSmsModal}
        onSave={handleSmsTemplateSave}
        editingTemplate={editingSms}
        templateType={templateType}
      />
      {/* 탭 콘텐츠 */}
      {/* (logContent, smsContent, mailContent 모두 제거) */}
    </div>
  );
});

DetailTabs.displayName = 'DetailTabs';

export default DetailTabs; 