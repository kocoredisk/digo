import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// 탭 제목 매핑 함수
const getTabTitle = (tabId) => {
  const titleMap = {
    'windup-service-salesperson': '서비스/영업자 관리',
    'windup-form-management': '공통 신청폼 관리',
    'windup-landing-management': '랜딩 페이지 관리',
    'windup-template-management': '이메일 템플릿 관리',
    'pitching-dashboard': 'Pitching 대시보드',
    'pitching-customer-acquisition': '크롤링',
    'pitching-dummy-customer-list': '더미 고객 리스트',
    'pitching-dummy-customer-management': '더미 고객 태그 관리',
    'pitching-template-management': '발송 템플릿 관리',
    'pitching-settings': 'Pitching 설정',
    'pitching-sending-center': '발송 센터',
    'pitching-stats': '발송현황',
    'catching-dashboard': 'Catching 대시보드',
    'catching-service-salesperson': '서비스 영업자 관리',
    'catching-landing-sources': '랜딩 페이지 관리',
    'catching-form-management': '공통 신청폼 관리',
    'catching-applicant-status': '신청자 현황',
    'touching-dashboard': '메인',
    'touching-consultation-management': '상담 신청 관리',
    'touching-call-list': '콜 리스트',
    'touching-meeting-schedule': '미팅 스케줄',
    'touching-history': '터치 히스토리',
    'etc-linkee-promo': '링키 홍보',
    'etc-system-settings': '시스템 설정',
    'catching-crawling': '크롤링(수집하기)',
    'catching-dummy-customer-list': '더미 고객 리스트',
    'catching-dummy-customer-tag': '더미 고객 태그 관리',
    'pitching-sending': '이메일 발송',
    'landing-page-creation': '랜딩페이지 만들기',
    'landing-page-editor': '랜딩페이지 편집',
    'landing-builder': '랜딩 빌더',
    'class-registrations': '수강생 관리',
  };
  return titleMap[tabId] || tabId;
};

export { getTabTitle };

function Header({ activeTab, setActiveTab, setIsLoggedIn, openTab }) {
  const navigate = useRouter();
  const [expandedGroup, setExpandedGroup] = useState(null);
  const menuRef = useRef(null);

  // TouchFlow 구조로 그룹화된 메뉴
  const menuGroups = [
    {
      id: 'windup',
      name: 'Wind-up',
      icon: '',
      items: [
        { id: 'windup-service-salesperson', name: '서비스/영업자 관리', icon: '', isActive: true },
        { id: 'windup-form-management', name: '공통 신청폼 관리', icon: '', isActive: true },
        { id: 'landing-page-creation', name: '랜딩페이지 만들기', icon: '', isActive: true },
        { id: 'landing-page-editor', name: '랜딩페이지 편집', icon: '', isActive: true },
        { id: 'windup-landing-management', name: '랜딩 페이지 관리', icon: '', isActive: true },
        { id: 'windup-template-management', name: '이메일 템플릿 관리', icon: '', isActive: true },
        { id: 'landing-builder', name: '페이지 빌더', icon: '', isActive: true }, // 이름 변경 및 맨 마지막으로 이동
      ]
    },
    {
      id: 'catching',
      name: 'Catching',
      icon: '',
      items: [
        { id: 'catching-crawling', name: '크롤링(수집하기)', icon: '', isActive: true },
        { id: 'catching-dummy-customer-list', name: '더미 고객 리스트', icon: '', isActive: true },
        { id: 'catching-dummy-customer-tag', name: '더미 고객 태그 관리', icon: '', isActive: true },
      ]
    },
    {
      id: 'pitching',
      name: 'Pitching',
      icon: '',
      items: [
        { id: 'pitching-sending', name: '1. 메일발송', icon: '', isActive: true },
        { id: 'email-queue', name: '2. 큐 상황', icon: '', isActive: true },
        { id: 'email-result', name: '3. 발송 결과', icon: '', isActive: true },
        { id: 'email-stats', name: '4. 발송 현황', icon: '', isActive: true },
      ]
    },
    {
      id: 'pitching2',
      name: 'Pitching2',
      icon: '',
      items: [
        { id: 'linkee-mail-sending', name: '1. 링키홍보 메일발송', icon: '', isActive: true },
        { id: 'linkee-mail-queue', name: '2. 링키홍보 큐 상황', icon: '', isActive: true },
        { id: 'linkee-mail-result', name: '3. 링키홍보 발송 결과', icon: '', isActive: true },
        { id: 'linkee-mail-stats', name: '4. 링키홍보 발송 현황', icon: '', isActive: true },
      ]
    },
    {
      id: 'touching',
      name: 'Touching',
      icon: '',
      items: [
        { id: 'touching-consultation-management', name: '상담 신청 관리', icon: '', isActive: true },
        { id: 'touching-call-list', name: '콜 리스트', icon: '', isActive: true },
        { id: 'touching-meeting-schedule', name: '미팅 스케줄', icon: '', isActive: true },
        { id: 'touching-history', name: '히스토리', icon: '', isActive: true },
      ]
    },
    {
      id: 'class',
      name: '강좌',
      icon: '',
      items: [
        { id: 'class-registrations', name: '수강생 관리', icon: '', isActive: true },
      ]
    },
    // 기타/즐겨찾기 그룹은 뒤로 이동
    {
      id: 'etc',
      name: '기타',
      icon: '', // 라인 아이콘 또는 공백
      items: [
        { id: 'etc-linkee-promo', name: '링키 홍보', icon: '', isActive: true },
        { id: 'etc-system-settings', name: '시스템 설정 (준비중)', icon: '', isActive: false },
      ]
    },
    {
      id: 'favorites',
      name: '즐겨쓰는 메뉴',
      icon: '',
      items: [
        // 피칭
        { type: 'section', label: '피칭' },
        { id: 'pitching-customer-acquisition', name: '크롤링', icon: '', isActive: true },
        { id: 'pitching-dummy-customer-list', name: '더미 고객 리스트', icon: '', isActive: true },
        { id: 'pitching-dummy-customer-management', name: '더미 고객 태그 관리', icon: '', isActive: true },
        { id: 'pitching-template-management', name: '발송 템플릿 관리', icon: '', isActive: true },
        { id: 'pitching-sending-center', name: '발송 센터', icon: '', isActive: true },
        // 캐칭
        { type: 'section', label: '캐칭' },
        { id: 'catching-landing-sources', name: '랜딩 페이지 관리', icon: '', isActive: true },
        { id: 'catching-form-management', name: '공통 신청폼 관리', icon: '', isActive: true },
        // 터칭
        { type: 'section', label: '터칭' },
        { id: 'touching-dashboard', name: '대시보드', icon: '', isActive: true },
        { id: 'touching-consultation-management', name: '상담 신청 관리', icon: '', isActive: true },
        // 기타
        { type: 'section', label: '기타' },
        { id: 'etc-linkee-promo', name: '링키 홍보', icon: '', isActive: true },
      ]
    }
  ];

  // 로그아웃
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    if (setIsLoggedIn) setIsLoggedIn(false);
    navigate('/login');
  };

  // 로고/타이틀 클릭 시 메인 탭으로
  const handleLogoClick = () => {
    setActiveTab('touching-dashboard');
    setExpandedGroup(null);
    openTab('main', '메인', 'main');
  };

  // 메뉴 그룹 클릭
  const handleGroupClick = (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
    }
  };

  // 서브 메뉴 클릭
  const handleSubMenuClick = (tabId, menuName) => {
    if (tabId === 'landing-builder') {
      window.open('/builder', '_blank');
      setExpandedGroup(null);
      return;
    }
    setActiveTab(tabId);
    setExpandedGroup(null); // 서브 메뉴 클릭 시 상단 메뉴 활성화 해제
    
    // 터칭 대시보드는 메인 탭으로 이동
    if (tabId === 'touching-dashboard') {
      openTab('main', '메인', 'main');
    } else {
      // 다른 메뉴는 새 탭으로 열기
      openTab(tabId);
    }
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    if (!expandedGroup) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setExpandedGroup(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedGroup]);

  return (
    <>
      {/* 헤더 위 16px 공간 */}
      <div style={{ height: 16 }} />
      {/* 헤더: 한 줄로 타이틀 + 메뉴 그룹 + 로그아웃 */}
      <div className="admin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 32px', minHeight: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', gap: 32 }}>
        {/* 타이틀(로고) + 메뉴 그룹 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <span role="img" aria-label="logo" style={{ fontSize: '2rem', marginRight: 4, cursor: 'pointer' }} onClick={handleLogoClick}>🏗️</span>
            <span style={{ fontWeight: 700, fontSize: '1.7rem', letterSpacing: '-1px', marginRight: 32, cursor: 'pointer' }} onClick={handleLogoClick}>고객 접점 관리 시스템</span>
          </div>
          {/* 메뉴 그룹 */}
          <div ref={menuRef} className="admin-menu" style={{ display: 'flex', gap: 20, position: 'relative' }}>
            {menuGroups.map(group => {
              // 상단 메뉴 활성화: 펼침 상태일 때만
              const isGroupActive = expandedGroup === group.id;
              const isExpanded = expandedGroup === group.id;
              
              return (
                <div key={group.id} style={{ position: 'relative' }}>
                  <button
                    className={`group-button ${isGroupActive ? 'active' : ''}`}
                    onClick={() => handleGroupClick(group.id)}
                    style={{
                      background: isGroupActive ? '#4f46e5' : 'transparent',
                      color: isGroupActive ? '#fff' : 'rgba(255,255,255,0.95)',
                      borderBottom: '2px solid transparent',
                      boxShadow: isGroupActive ? '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)' : 'none',
                      fontWeight: isGroupActive ? 700 : 500,
                      fontSize: '18px',
                      minWidth: 160,
                      padding: '6px 14px',
                      borderRadius: 6,
                      height: 32,
                      transition: 'all 0.15s',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span className="group-icon">{group.icon}</span>
                    <span className="group-name" style={{ fontSize: group.id === 'favorites' ? '14px' : '18px' }}>{group.name}</span>
                    {/* ▼ 삼각형 아이콘 완전 제거 */}
                  </button>
                  
                  {/* 서브 메뉴 드롭다운 */}
                  {isExpanded && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: '#fff',
                      borderRadius: 8,
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      padding: '8px 0',
                      minWidth: 200,
                      zIndex: 1000,
                      marginTop: 4
                    }}>
                      {group.items.map(item => {
                        if (item.type === 'section') {
                          return (
                            <div key={item.label} className="px-4 py-1 text-xs text-gray-400 font-semibold mt-2 mb-1 text-left">
                              {item.label}
                            </div>
                          );
                        }
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            className={`submenu-button ${isActive ? 'active' : ''}`}
                            onClick={() => handleSubMenuClick(item.id, item.name)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 16px',
                              background: isActive ? '#f3f4f6' : 'transparent',
                              color: isActive ? '#4f46e5' : '#374151',
                              border: 'none',
                              fontSize: '14px',
                              fontWeight: isActive ? 600 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              transition: 'all 0.15s'
                            }}
                          >
                            <span className="submenu-icon">{item.icon}</span>
                            <span className="submenu-name">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 로그아웃 버튼 */}
        <button onClick={handleLogout} style={{ background: '#fff', color: '#3958fd', border: '1px solid #3958fd', borderRadius: 6, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', minWidth: 80, fontSize: '13px', height: 32, marginLeft: 32 }}>
          로그아웃
        </button>
      </div>
      {/* 헤더 아래 16px 공간 */}
      <div style={{ height: 16 }} />
    </>
  );
}

export default Header; 