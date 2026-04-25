'use client'
import { useState } from 'react'
import Script from 'next/script'
import Link from 'next/link'

declare global {
  interface Window {
    AUTHNICE: {
      requestPay: (params: {
        clientId: string
        method: string
        orderId: string
        amount: number
        goodsName: string
        returnUrl: string
        fnError?: (result: { errorMsg: string }) => void
      }) => void
    }
  }
}

const AX_STEPS = [
  {
    step: '첫째',
    keyword: '체감',
    en: 'Experience',
    desc: '나의 관심사로 바로 써본다. 직접 써봐야 온다.',
  },
  {
    step: '둘째',
    keyword: '확장',
    en: 'Expand',
    desc: '체감한 사람은 스스로 더 원하게 되어 있다.\n개인의 도구가 조직의 능력이 되는 거다.',
  },
  {
    step: '셋째',
    keyword: '창출',
    en: 'Create',
    desc: '없던 가치가 만들어진다.\nAI와 일하는 게 그냥 일상이 되는 거다.',
  },
]

export default function ClassPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [nicepayLoaded, setNicepayLoaded] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = '이름을 입력해주세요.'
    if (!form.phone.trim()) next.phone = '연락처를 입력해주세요.'
    if (!form.email.trim()) next.email = '이메일을 입력해주세요.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = '올바른 이메일 형식이 아닙니다.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePayment = () => {
    if (!validate()) return
    if (!nicepayLoaded || !window.AUTHNICE) {
      alert('결제 모듈을 로딩 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const isProd = window.location.hostname !== 'localhost'
    const returnUrl = isProd
      ? 'https://digo.kr/api/class/payment/confirm-redirect'
      : 'http://localhost:3004/api/class/payment/confirm-redirect'

    window.AUTHNICE.requestPay({
      clientId: 'R2_8e4a896d895d49838ff5580a506db755',
      method: 'card',
      orderId: `AX_${Date.now()}`,
      amount: 330000,
      goodsName: 'AX First Step 강좌',
      returnUrl,
      fnError: (result) => {
        alert('결제 중 오류가 발생했습니다: ' + result.errorMsg)
      },
    })
  }

  return (
    <>
      <Script
        src="https://pay.nicepay.co.kr/v1/js/"
        strategy="beforeInteractive"
        onLoad={() => setNicepayLoaded(true)}
      />

      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          className="py-8 px-6 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <p className="text-sm font-medium opacity-80 mb-2 tracking-widest uppercase">
              Digo — AX 강좌
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              AX First Step
            </h1>
            <p className="text-lg opacity-90">
              AI 전환의 첫 단계, 체감에서 시작합니다.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* AX 3단계 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              AX 3단계
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">
              AI 전환(AX)은 세 단계로 일어납니다.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {AX_STEPS.map((s, i) => (
                <div
                  key={s.keyword}
                  className="rounded-xl border border-gray-100 p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#667eea' }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-xl font-bold text-gray-900">
                      {s.keyword}
                    </span>
                    <span className="ml-2 text-sm text-gray-400">
                      ({s.en})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 강좌 소개 */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              강좌 소개
            </h2>
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 pr-6 font-semibold text-gray-500 w-28">강좌명</td>
                    <td className="py-3 text-gray-900 font-medium">AX First Step</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-semibold text-gray-500">강사</td>
                    <td className="py-3 text-gray-900">이근영</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-semibold text-gray-500">수강료</td>
                    <td className="py-3 text-gray-900 font-bold text-lg">
                      330,000원{' '}
                      <span className="text-xs font-normal text-gray-400">
                        (부가세 포함)
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-6 font-semibold text-gray-500">정원</td>
                    <td className="py-3 text-gray-900">20명</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 신청 폼 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              수강 신청
            </h2>
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="홍길동"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.name ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.phone ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    회사명{' '}
                    <span className="text-gray-400 font-normal text-xs">
                      (선택)
                    </span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="(주)회사명"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handlePayment}
                  className="w-full py-4 rounded-xl text-white font-bold text-base transition hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  330,000원 결제하기
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  나이스페이먼츠 안전결제 · 카드 결제 지원
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
