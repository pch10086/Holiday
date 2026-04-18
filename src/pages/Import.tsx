import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { sampleImportText } from '../data/mockTrip'
import { useTripStore } from '../store/tripStore'

const field =
  'min-h-12 w-full rounded-[11px] border-[3px] border-black/[0.04] bg-apple-surface px-3 text-[15px] text-apple-text outline-none transition focus-visible:border-apple-blue'

export function ImportPage() {
  const navigate = useNavigate()
  const { createTrip, importPlan } = useTripStore()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: '',
    coverEmoji: '🧭',
  })
  const [planText, setPlanText] = useState(sampleImportText)
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setWarnings([])
    setSubmitting(true)
    try {
      const trip = await createTrip({
        title: form.title.trim(),
        destination: form.destination.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        travelers: form.travelers
          .split(/[，,]/)
          .map((item) => item.trim())
          .filter(Boolean),
        coverEmoji: form.coverEmoji,
      })
      const parseWarnings = await importPlan(trip.id, planText)
      setWarnings(parseWarnings)
      navigate(`/trip/${trip.id}/today`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : '创建失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-apple-gray text-apple-text antialiased">
      <div className="bg-apple-black px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))] text-white">
        <p className="text-[12px] font-medium tracking-wide text-white/48">新建</p>
        <h1 className="mt-2 text-[clamp(1.5rem,7vw,2rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          创建并导入旅行计划
        </h1>
        <p className="mt-3 max-w-sm text-[15px] leading-[1.47] text-white/65">两步：旅行信息，再粘贴外部计划文本。</p>
      </div>

      <div className="relative z-[1] -mt-6 mx-auto max-w-md rounded-t-[24px] bg-apple-gray px-4 pb-24 pt-6">
        {step === 1 ? (
          <section className="space-y-4 rounded-[12px] bg-white p-4 shadow-apple-card">
            <Input label="旅行名称" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <Input
              label="目的地"
              value={form.destination}
              onChange={(value) => setForm({ ...form, destination: value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="开始日期"
                type="date"
                value={form.startDate}
                onChange={(value) => setForm({ ...form, startDate: value })}
              />
              <Input
                label="结束日期"
                type="date"
                value={form.endDate}
                onChange={(value) => setForm({ ...form, endDate: value })}
              />
            </div>
            <Input
              label="旅伴（逗号分隔）"
              value={form.travelers}
              placeholder="你, 小林"
              onChange={(value) => setForm({ ...form, travelers: value })}
            />
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-12 w-full rounded-lg bg-apple-blue text-[16px] font-normal text-white transition hover:bg-apple-blue-hover disabled:opacity-40"
              disabled={!form.title || !form.destination || !form.startDate || !form.endDate}
            >
              下一步：导入计划
            </button>
          </section>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-[12px] bg-white p-4 shadow-apple-card">
            <label className="block text-[13px] font-semibold text-apple-text">粘贴外部旅行计划文本</label>
            <textarea
              value={planText}
              onChange={(event) => setPlanText(event.target.value)}
              className="min-h-72 w-full rounded-[11px] border-[3px] border-black/[0.04] bg-apple-surface p-3 text-[14px] leading-relaxed text-apple-text outline-none transition focus-visible:border-apple-blue"
              placeholder="粘贴你的行程计划..."
            />
            {error ? (
              <p className="rounded-lg bg-apple-surface px-3 py-2 text-[14px] text-apple-text">{error}</p>
            ) : null}
            {warnings.length ? (
              <div className="rounded-lg bg-apple-surface px-3 py-2 text-[12px] leading-relaxed text-black/70">
                {warnings.map((warn) => (
                  <p key={warn}>— {warn}</p>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-12 flex-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[15px] font-normal text-apple-text transition hover:bg-black/[0.03]"
              >
                上一步
              </button>
              <button
                type="submit"
                className="min-h-12 flex-1 rounded-lg bg-apple-blue text-[15px] font-normal text-white transition hover:bg-apple-blue-hover disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? '导入中…' : '解析并导入'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

interface InputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}

function Input({ label, value, onChange, type = 'text', placeholder }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-black/48">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={field}
      />
    </label>
  )
}
