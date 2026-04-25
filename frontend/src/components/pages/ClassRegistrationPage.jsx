import React, { useState, useEffect, useCallback } from 'react'

const STATUS_LABEL = {
  paid: '결제완료',
  pending: '미결제',
  cancelled: '취소',
}

const STATUS_STYLE = {
  paid: { background: '#d1fae5', color: '#065f46' },
  pending: { background: '#fef9c3', color: '#92400e' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatAmount(amount) {
  if (amount == null) return '-'
  return Number(amount).toLocaleString('ko-KR') + '원'
}

export default function ClassRegistrationPage() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const getToken = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('digo_token') || ''
  }

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/class/registrations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`)
      const data = await res.json()
      setRegistrations(Array.isArray(data) ? data : data.registrations || [])
    } catch (e) {
      setError(e.message || '데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const handleToggleStatus = async (item) => {
    const currentStatus = item.paymentStatus || 'pending'
    const nextStatus = currentStatus === 'paid' ? 'cancelled' : 'paid'
    if (!window.confirm(`상태를 "${STATUS_LABEL[nextStatus]}"으로 변경할까요?`)) return

    setTogglingId(item.id)
    try {
      const res = await fetch(`/api/class/registrations/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      })
      if (!res.ok) throw new Error(`변경 실패: ${res.status}`)
      setRegistrations(prev =>
        prev.map(r => (r.id === item.id ? { ...r, paymentStatus: nextStatus } : r))
      )
    } catch (e) {
      alert(e.message || '상태 변경에 실패했습니다.')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">수강생 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">AX First Step 수강 신청자 목록</p>
        </div>
        <button
          onClick={fetchRegistrations}
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          새로고침
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          불러오는 중...
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={fetchRegistrations}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ background: '#667eea' }}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-3 text-sm text-gray-500">
            총 <span className="font-semibold text-gray-900">{registrations.length}</span>명
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-3 px-4 text-left font-semibold text-gray-600 w-12">번호</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600">이름</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600">연락처</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600">이메일</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-600">회사명</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-600">결제상태</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-600">결제금액</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-600">신청일</th>
                  <th className="py-3 px-4 text-center font-semibold text-gray-600">상태변경</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-gray-400">
                      신청자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  registrations.map((item, idx) => {
                    const status = item.paymentStatus || 'pending'
                    const isToggling = togglingId === item.id
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{item.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-700">{item.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-700">{item.email || '-'}</td>
                        <td className="py-3 px-4 text-gray-500">{item.company || '-'}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={STATUS_STYLE[status] || STATUS_STYLE.pending}
                          >
                            {STATUS_LABEL[status] || status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-medium">
                          {formatAmount(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={isToggling}
                            className="px-3 py-1 text-xs font-medium rounded-lg border transition disabled:opacity-50"
                            style={
                              status === 'paid'
                                ? { borderColor: '#fca5a5', color: '#dc2626', background: '#fff5f5' }
                                : { borderColor: '#6ee7b7', color: '#065f46', background: '#f0fdf4' }
                            }
                          >
                            {isToggling ? '변경중...' : status === 'paid' ? '취소' : '결제완료'}
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
