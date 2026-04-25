'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// 기존 페이지 컴포넌트들 동적 임포트 (SSR 비활성화 - JSX 호환성)
const MainPage = dynamic(() => import('./pages/MainPage'), { ssr: false })
const CustomerManagementPage = dynamic(() => import('./pages/CustomerManagementPage'), { ssr: false })
const CustomerTagPage = dynamic(() => import('./pages/CustomerTagPage'), { ssr: false })
const ConsultationManagementPage = dynamic(() => import('./pages/ConsultationManagementPage'), { ssr: false })
const ProgressPage = dynamic(() => import('./pages/ProgressPage'), { ssr: false })
const MapPage = dynamic(() => import('./pages/MapPage'), { ssr: false })
const EmailTemplatePage = dynamic(() => import('./pages/EmailTemplatePage'), { ssr: false })
const EmailQueuePage = dynamic(() => import('./pages/EmailQueuePage'), { ssr: false })
const EmailStatsPage = dynamic(() => import('./pages/EmailStatsPage'), { ssr: false })
const EmailResultPage = dynamic(() => import('./pages/EmailResultPage'), { ssr: false })
const LandingPageManagementPage = dynamic(() => import('./pages/LandingPageManagementPage'), { ssr: false })
const LandingPageCreationPage = dynamic(() => import('./pages/LandingPageCreationPage'), { ssr: false })
const LandingPageEditorPage = dynamic(() => import('./pages/LandingPageEditorPage'), { ssr: false })
const LandingEditorPage = dynamic(() => import('./pages/LandingEditorPage'), { ssr: false })
const LandingBuilderPage = dynamic(() => import('./pages/LandingBuilderPage'), { ssr: false })
const LandingSourceManagementPage = dynamic(() => import('./pages/LandingSourceManagementPage'), { ssr: false })
const CommonFormManagementPage = dynamic(() => import('./pages/CommonFormManagementPage'), { ssr: false })
const LinkeePromoPage = dynamic(() => import('./pages/LinkeePromoPage'), { ssr: false })
const LinkeeMailSendingPage = dynamic(() => import('./pages/LinkeeMailSendingPage'), { ssr: false })
const LinkeeMailQueuePage = dynamic(() => import('./pages/LinkeeMailQueuePage'), { ssr: false })
const LinkeeMailResultPage = dynamic(() => import('./pages/LinkeeMailResultPage'), { ssr: false })
const LinkeeMailStatsPage = dynamic(() => import('./pages/LinkeeMailStatsPage'), { ssr: false })
const PitchingDashboardPage = dynamic(() => import('./pages/PitchingDashboardPage'), { ssr: false })
const PitchingSettingsPage = dynamic(() => import('./pages/PitchingSettingsPage'), { ssr: false })
const PitchingStatusStatsPage = dynamic(() => import('./pages/PitchingStatusStatsPage'), { ssr: false })
const CatchingDashboardPage = dynamic(() => import('./pages/CatchingDashboardPage'), { ssr: false })
const CatchingServiceSalespersonPage = dynamic(() => import('./pages/CatchingServiceSalespersonPage'), { ssr: false })
const CatchingLandingPageCreationPage = dynamic(() => import('./pages/CatchingLandingPageCreationPage'), { ssr: false })
const CatchingApplicantStatusPage = dynamic(() => import('./pages/CatchingApplicantStatusPage'), { ssr: false })
const TouchingCallListPage = dynamic(() => import('./pages/TouchingCallListPage'), { ssr: false })
const TouchingMeetingSchedulePage = dynamic(() => import('./pages/TouchingMeetingSchedulePage'), { ssr: false })
const TouchingHistoryPage = dynamic(() => import('./pages/TouchingHistoryPage'), { ssr: false })
const WindupTemplateManagementPage = dynamic(() => import('./pages/WindupTemplateManagementPage'), { ssr: false })
const WindupLandingManagementPage = dynamic(() => import('./pages/WindupLandingManagementPage'), { ssr: false })
const WindupFormManagementPage = dynamic(() => import('./pages/WindupFormManagementPage'), { ssr: false })
const WindupServiceSalespersonPage = dynamic(() => import('./pages/WindupServiceSalespersonPage'), { ssr: false })
const EtcSystemSettingsPage = dynamic(() => import('./pages/EtcSystemSettingsPage'), { ssr: false })
const ClassRegistrationPage = dynamic(() => import('./pages/ClassRegistrationPage'), { ssr: false })
const Header = dynamic(() => import('./layout/Header'), { ssr: false })

type Tab = { key: string; title: string; content: string }

const TAB_TITLES: Record<string, string> = {
  main: '메인',
  'customer-management': '고객관리',
  'customer-tag': '고객태그',
  'touching-consultation-management': '상담관리',
  'progress': '진행현황',
  'map': '지도',
  'email-template': '이메일템플릿',
  'email-queue': '이메일대기열',
  'email-stats': '이메일통계',
  'email-result': '이메일결과',
  'landing-page-management': '랜딩페이지',
  'landing-page-creation': '랜딩생성',
  'landing-page-editor': '랜딩편집',
  'landing-editor': '코드편집',
  'landing-builder': '랜딩빌더',
  'landing-source-management': '소스관리',
  'common-form-management': '공통양식',
  'linkee-promo': 'Linkee홍보',
  'linkee-mail-sending': 'Linkee발송',
  'linkee-mail-queue': 'Linkee대기열',
  'linkee-mail-result': 'Linkee결과',
  'linkee-mail-stats': 'Linkee통계',
  'pitching-dashboard': 'Pitching',
  'pitching-settings': 'Pitching설정',
  'pitching-status-stats': 'Pitching통계',
  'catching-dashboard': 'Catching',
  'catching-service-salesperson': 'Catching영업',
  'catching-landing-page-creation': 'Catching랜딩',
  'catching-applicant-status': 'Catching현황',
  'touching-call-list': '통화목록',
  'touching-meeting-schedule': '미팅일정',
  'touching-history': '접촉이력',
  'windup-template-management': 'Windup템플릿',
  'windup-landing-management': 'Windup랜딩',
  'windup-form-management': 'Windup양식',
  'windup-service-salesperson': 'Windup영업',
  'etc-system-settings': '시스템설정',
  'class-registrations': '수강관리',
}

const PAGE_MAP: Record<string, React.ReactNode> = {}

function renderPage(content: string) {
  switch (content) {
    case 'main': return <MainPage />
    case 'customer-management': case 'catching-dummy-customer-list': return <CustomerManagementPage />
    case 'customer-tag': case 'catching-dummy-customer-tag': return <CustomerTagPage />
    case 'touching-consultation-management': return <ConsultationManagementPage />
    case 'progress': case 'pitching-sending': return <ProgressPage />
    case 'map': return <MapPage />
    case 'email-template': case 'windup-template-management': return <EmailTemplatePage />
    case 'email-queue': return <EmailQueuePage />
    case 'email-stats': return <EmailStatsPage />
    case 'email-result': return <EmailResultPage />
    case 'landing-page-management': case 'windup-landing-management': return <LandingPageManagementPage />
    case 'landing-page-creation': case 'catching-landing-page-creation': return <LandingPageCreationPage />
    case 'landing-page-editor': return <LandingPageEditorPage />
    case 'landing-editor': return <LandingEditorPage />
    case 'landing-builder': return <LandingBuilderPage />
    case 'landing-source-management': return <LandingSourceManagementPage />
    case 'common-form-management': case 'windup-form-management': return <CommonFormManagementPage />
    case 'linkee-promo': case 'etc-linkee-promo': return <LinkeePromoPage />
    case 'linkee-mail-sending': return <LinkeeMailSendingPage />
    case 'linkee-mail-queue': return <LinkeeMailQueuePage />
    case 'linkee-mail-result': return <LinkeeMailResultPage />
    case 'linkee-mail-stats': return <LinkeeMailStatsPage />
    case 'pitching-dashboard': return <PitchingDashboardPage />
    case 'pitching-settings': return <PitchingSettingsPage />
    case 'pitching-status-stats': return <PitchingStatusStatsPage />
    case 'catching-dashboard': return <CatchingDashboardPage />
    case 'catching-service-salesperson': case 'windup-service-salesperson': return <CatchingServiceSalespersonPage />
    case 'catching-applicant-status': return <CatchingApplicantStatusPage />
    case 'touching-call-list': return <TouchingCallListPage />
    case 'touching-meeting-schedule': return <TouchingMeetingSchedulePage />
    case 'touching-history': return <TouchingHistoryPage />
    case 'windup-template-management': return <WindupTemplateManagementPage />
    case 'windup-landing-management': return <WindupLandingManagementPage />
    case 'windup-form-management': return <WindupFormManagementPage />
    case 'windup-service-salesperson': return <WindupServiceSalespersonPage />
    case 'etc-system-settings': return <EtcSystemSettingsPage />
    case 'class-registrations': return <ClassRegistrationPage />
    default: return <div className="p-8 text-gray-400">준비중</div>
  }
}

export default function DigoApp() {
  const router = useRouter()
  const [tabs, setTabs] = useState<Tab[]>([{ key: 'main', title: '메인', content: 'main' }])
  const [activeTab, setActiveTab] = useState('main')
  const [activeMenuTab, setActiveMenuTab] = useState('touching-consultation-management')

  useEffect(() => {
    const saved = localStorage.getItem('digo_tabs')
    if (saved) setTabs(JSON.parse(saved))
    const savedActive = localStorage.getItem('digo_active_tab')
    if (savedActive) setActiveTab(savedActive)
  }, [])

  useEffect(() => {
    localStorage.setItem('digo_tabs', JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    localStorage.setItem('digo_active_tab', activeTab)
  }, [activeTab])

  const openTab = (key: string, content?: string) => {
    const tabContent = content || key
    const title = TAB_TITLES[key] || key
    setTabs(prev => {
      if (prev.find(t => t.key === key)) return prev
      const next = [...prev, { key, title, content: tabContent }]
      return next.length > 10 ? next.slice(1) : next
    })
    setActiveTab(key)
  }

  const closeTab = (key: string) => {
    if (key === 'main') return
    setTabs(prev => {
      const idx = prev.findIndex(t => t.key === key)
      const next = prev.filter(t => t.key !== key)
      if (activeTab === key && next.length) setActiveTab(next[Math.max(0, idx - 1)].key)
      return next
    })
  }

  const closeAllTabs = () => {
    setTabs([{ key: 'main', title: '메인', content: 'main' }])
    setActiveTab('main')
  }

  const handleLogout = () => {
    localStorage.removeItem('digo_token')
    router.push('/login')
  }

  const currentContent = tabs.find(t => t.key === activeTab)?.content || 'main'

  return (
    <div className="landing-admin-page" style={{ position: 'relative' }}>
      <Header
        activeTab={activeMenuTab}
        setActiveTab={setActiveMenuTab}
        setIsLoggedIn={handleLogout}
        openTab={openTab}
      />

      {/* 멀티탭 바 */}
      <div
        className="bg-white border-l border-b border-gray-200 rounded-t-lg"
        style={{ height: 30, minHeight: 30, width: 1850, margin: 0, padding: 0, display: 'flex', overflow: 'hidden' }}
      >
        <div className="flex items-end gap-2 h-full" style={{ height: 30, maxWidth: 1700, flexShrink: 1, overflow: 'hidden' }}>
          {tabs.map(tab => (
            <div
              key={tab.key}
              className={`flex items-center px-4 py-1 rounded-t-lg border border-b-0 text-[12px] font-semibold cursor-pointer ${
                activeTab === tab.key ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-800'
              }`}
              style={tab.key === 'main'
                ? { minWidth: 60, maxWidth: 80, flexShrink: 1, overflow: 'hidden', justifyContent: 'center', display: 'flex' }
                : { maxWidth: 150, minWidth: 80, flexShrink: 1, overflow: 'hidden' }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="truncate w-full text-center">{tab.title}</span>
              {tab.key !== 'main' && (
                <button
                  className="ml-2 text-gray-300 hover:text-red-400 text-xs"
                  onClick={e => { e.stopPropagation(); closeTab(tab.key) }}
                >×</button>
              )}
            </div>
          ))}
          <div className="flex-1" />
          {tabs.length > 1 && (
            <button
              className="px-3 py-1 text-[11px] text-gray-500 hover:text-red-600 font-medium border border-gray-200 rounded hover:bg-red-50"
              onClick={closeAllTabs}
            >
              모든 탭 닫기
            </button>
          )}
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div style={{ width: 1850, margin: 0, padding: 0 }}>
        <div className="bg-white" style={{ width: 1850, minHeight: 400, margin: 0, padding: 0 }}>
          {renderPage(currentContent)}
        </div>
      </div>
    </div>
  )
}
