import { useRef } from 'react';
import { format } from 'date-fns';
import DetailTabs from './DetailTabs';

const STATUS_OPTIONS = [
  '최초등록',
  '문자발송',
  '이메일발송', 
  '동시발송',
  '거절',
  '무관심',
  '무응답',
  '긍정',
];

const SMS_TEMPLATES = [
  { key: 'sms1', label: '소개영상 보내기' },
  { key: 'sms2', label: '도입제안 링크' },
  { key: 'sms3', label: '유튜브 후기 영상' },
];
const EMAIL_TEMPLATES = [
  { key: 'emailA', label: 'A형: 전문기업용' },
  { key: 'emailB', label: 'B형: 스타트업용' },
  { key: 'emailC', label: 'C형: 회신유도형' },
];

function formatPhone(val) {
  const nums = val.replace(/\D/g, '');
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return nums.slice(0, 3) + '-' + nums.slice(3);
  return nums.slice(0, 3) + '-' + nums.slice(3, 7) + '-' + nums.slice(7, 11);
}

function DetailView({ form, setForm, handleSave, handleNew }) {
  if (!form) return <div style={{ padding: 24, color: '#888' }}>선택된 고객이 없습니다.</div>;
  const textareaRef = useRef(null);

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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFinalSave = () => {
    // 종결 상태로 변경하고 저장
    setForm(f => ({ ...f, status: '긍정' }));
    setTimeout(() => {
      handleSave();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col pr-[2px]" onClick={(e) => e.stopPropagation()}>
      <form className="flex-1 flex flex-col overflow-y-auto pl-0 pr-0 pb-0 m-0">
        {/* 크롤링된 데이터 - 읽기 전용 */}
        <div className="space-y-2">
          <div className="relative">
            <input 
              name="regDate" 
              value={form?.regDate ? format(new Date(form?.regDate), 'yyyy-MM-dd   HH:mm:ss') : ''} 
              readOnly 
              className="border border-gray-400 rounded px-2 py-1 bg-gray-100 w-full text-[13px] pr-20" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">접수일</span>
          </div>
          
          <div className="relative">
            <input 
              name="name" 
              value={form?.name || ''} 
              onChange={handleChange}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-16" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">상호</span>
          </div>
          
          <div className="relative">
            <input 
              name="jobTitle" 
              value={form?.jobTitle || ''} 
              onChange={handleChange}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-12" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">공고</span>
          </div>
          
          <div className="relative">
            <input 
              name="region" 
              value={form?.region || ''} 
              onChange={handleChange}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-12" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">지역</span>
          </div>
          
          <div className="relative">
            <input 
              name="contactName" 
              value={form?.contactName || ''} 
              onChange={handleChange}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-12" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">이름</span>
          </div>
          
          <div className="relative">
            <input 
              name="email" 
              value={form?.email || ''} 
              onChange={handleChange}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-16" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">이메일</span>
          </div>
          
          <div className="relative">
            <input 
              name="phone" 
              value={form?.phone || ''} 
              onChange={handlePhoneInput}
              className="border border-gray-400 rounded px-2 py-1 bg-white w-full text-[13px] pr-20" 
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs font-semibold" translate="no">휴대폰</span>
          </div>
        </div>

        {/* 내용 필드 - 코멘트 작성용 */}
        <div className="mt-2 relative">
          <textarea 
            ref={textareaRef} 
            name="content" 
            maxLength={400} 
            value={form?.content || ''} 
            onChange={handleContentChange} 
            className="border border-gray-400 rounded px-2 py-1 min-h-[160px] h-[160px] w-full resize-none text-[13px] pr-16" 
            placeholder="코멘트를 입력하세요..." 
            rows={6} 
          />
          <span className="absolute right-2 top-2 text-gray-500 text-xs font-semibold" translate="no">내용</span>
        </div>

        {/* 문자/이메일 발송 탭 */}
        <DetailTabs key="detail-tabs" customer={form} />

        {/* 최하단 상태확인 + 저장 (세로 배치) */}
        <div className="mt-4 border-t pt-4">
          <div className="grid grid-cols-6 gap-x-2 gap-y-2 items-center">
            <div className="col-span-6">
              <select 
                name="status" 
                value={form?.status || '최초등록'} 
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
              onClick={handleSave}
              className="flex-1 py-1 px-3 bg-blue-500 text-white rounded font-semibold text-xs hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
            <button
              type="button"
              onClick={handleFinalSave}
              className="flex-1 py-1 px-3 bg-green-500 text-white rounded font-semibold text-xs hover:bg-green-600 transition-colors"
            >
              종결 저장
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default DetailView; 