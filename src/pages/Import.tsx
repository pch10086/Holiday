import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { sampleImportText } from '../data/mockTrip'
import { useTripStore } from '../store/tripStore'

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
    <main className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-4 pb-24 pt-6">
      <h1 className="font-serif text-2xl font-semibold text-emerald-950">创建并导入旅行计划</h1>
      <p className="mt-1 text-sm text-emerald-700">两步完成：先填写旅行信息，再粘贴外部计划。</p>

      {step === 1 ? (
        <section className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
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
            className="min-h-12 w-full rounded-xl bg-emerald-900 text-sm font-medium text-white"
            disabled={!form.title || !form.destination || !form.startDate || !form.endDate}
          >
            下一步：导入计划
          </button>
        </section>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
          <label className="block text-sm font-medium text-emerald-900">粘贴外部旅行计划文本</label>
          <textarea
            value={planText}
            onChange={(event) => setPlanText(event.target.value)}
            className="min-h-72 w-full rounded-xl border border-emerald-200 p-3 text-sm outline-none focus:border-emerald-600"
            placeholder="粘贴你的行程计划..."
          />
          {error ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
          {warnings.length ? (
            <div className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
              {warnings.map((warn) => (
                <p key={warn}>- {warn}</p>
              ))}
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-12 flex-1 rounded-xl border border-emerald-200 text-sm text-emerald-800"
            >
              上一步
            </button>
            <button
              type="submit"
              className="min-h-12 flex-1 rounded-xl bg-emerald-900 text-sm font-medium text-white"
              disabled={submitting}
            >
              {submitting ? '导入中...' : '解析并导入'}
            </button>
          </div>
        </form>
      )}
    </main>
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
      <span className="mb-1 block text-sm font-medium text-emerald-900">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-emerald-200 px-3 text-sm outline-none focus:border-emerald-600"
      />
    </label>
  )
}
