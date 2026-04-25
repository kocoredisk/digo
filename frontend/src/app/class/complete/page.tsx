'use client'
import Link from 'next/link'

export default function ClassCompletePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          수강 신청이 완료되었습니다.
        </h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          확인 메일을 발송했습니다.
          <br />
          메일이 도착하지 않으면 스팸 폴더를 확인해주세요.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          홈으로 가기
        </Link>
      </div>
    </div>
  )
}
