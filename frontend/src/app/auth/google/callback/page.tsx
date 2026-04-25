'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const API = '/api'

function GoogleCallbackInner() {
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    if (!code) {
      window.opener?.postMessage({ source: 'digo-oauth', type: 'GOOGLE_AUTH_FAIL', error: 'no code' }, window.location.origin)
      window.close()
      return
    }

    const redirectUri = window.location.origin + '/auth/google/callback'

    fetch(`${API}/auth/google-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          window.opener?.postMessage({ source: 'digo-oauth', type: 'GOOGLE_AUTH_SUCCESS', user: data.data.user }, window.location.origin)
        } else {
          window.opener?.postMessage({ source: 'digo-oauth', type: 'GOOGLE_AUTH_FAIL', error: data.error }, window.location.origin)
        }
        window.close()
      })
      .catch(() => {
        window.opener?.postMessage({ source: 'digo-oauth', type: 'GOOGLE_AUTH_FAIL', error: 'network error' }, window.location.origin)
        window.close()
      })
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Google 로그인 처리 중...</p>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">로딩 중...</p></div>}>
      <GoogleCallbackInner />
    </Suspense>
  )
}
