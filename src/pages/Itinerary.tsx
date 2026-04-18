import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { DaySection } from '../components/itinerary/DaySection'
import { PageHeader } from '../components/layout/PageHeader'
import { useTrip } from '../hooks/useTrip'
import { resolveCurrentTripDay } from '../hooks/useToday'
import type { ItineraryItem } from '../types'

type ManagePhase = 'idle' | 'add' | 'pickEdit' | 'edit' | 'pickDelete'

const emptyForm = { time: '09:00', title: '', location: '', notes: '' }

const field =
  'mt-1 min-h-11 w-full rounded-[11px] border-[3px] border-black/[0.04] bg-apple-surface px-3 text-[15px] text-apple-text outline-none transition focus-visible:border-apple-blue'

export function ItineraryPage() {
  const { id = '' } = useParams()
  const { tripDetail, loading, error, createItineraryItem, updateItineraryItem, deleteItineraryItem } =
    useTrip(id)
  const [activeDayId, setActiveDayId] = useState<string>('')
  const [managePhase, setManagePhase] = useState<ManagePhase>('idle')
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const nextItemId = useMemo(() => {
    if (!tripDetail?.days.length) return undefined
    const { todayDay, status } = resolveCurrentTripDay(tripDetail)
    const days = tripDetail.days
    const selectedDayId = activeDayId || todayDay?.id || days[0]?.id
    if (status !== 'inProgress' || !todayDay || selectedDayId !== todayDay.id) return undefined
    const now = new Date().toTimeString().slice(0, 5)
    const dayItems = tripDetail.itineraryItems
      .filter((item) => item.dayId === todayDay.id)
      .sort((a, b) => a.time.localeCompare(b.time))
    return dayItems.find((item) => !item.completed && item.time >= now)?.id
  }, [tripDetail, activeDayId])

  const resetManage = () => {
    setManagePhase('idle')
    setEditingItem(null)
    setForm(emptyForm)
  }

  if (loading && !tripDetail) {
    return <p className="p-4 text-[15px] text-black/48">加载行程中…</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-[15px] font-medium text-apple-text">{error ?? '旅行不存在'}</p>
  }

  const days = tripDetail.days
  const { todayDay } = resolveCurrentTripDay(tripDetail)
  const selectedDayId = activeDayId || todayDay?.id || days[0]?.id
  const selectedDay = days.find((item) => item.id === selectedDayId) ?? days[0]
  const items = tripDetail.itineraryItems.filter((item) => item.dayId === selectedDay?.id)

  const submitCreate = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedDay || !form.title.trim()) return
    await createItineraryItem(id, {
      dayId: selectedDay.id,
      time: form.time,
      title: form.title.trim(),
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    })
    resetManage()
  }

  const submitEdit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingItem || !form.title.trim()) return
    await updateItineraryItem(id, editingItem.id, {
      dayId: editingItem.dayId,
      time: form.time,
      title: form.title.trim(),
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
      updatedBy: '旅伴',
    })
    resetManage()
  }

  const onPickEditItem = (item: ItineraryItem) => {
    setEditingItem(item)
    setForm({
      time: item.time,
      title: item.title,
      location: item.location ?? '',
      notes: item.notes ?? '',
    })
    setManagePhase('edit')
  }

  const onPickDeleteItem = async (item: ItineraryItem) => {
    const confirmed = window.confirm(`确认删除行程「${item.title}」吗？`)
    if (!confirmed) return
    await deleteItineraryItem(id, item.id)
    resetManage()
  }

  const selectMode =
    managePhase === 'pickEdit' ? 'edit' : managePhase === 'pickDelete' ? 'delete' : null
  const onItemSelect =
    managePhase === 'pickEdit'
      ? onPickEditItem
      : managePhase === 'pickDelete'
        ? (it: ItineraryItem) => void onPickDeleteItem(it)
        : undefined

  const showForm = managePhase === 'add' || managePhase === 'edit'

  const toolbar =
    managePhase === 'idle' ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('add')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-apple-blue text-[14px] font-normal text-white transition hover:bg-apple-blue-hover"
          aria-label="新增行程"
        >
          <Plus size={17} strokeWidth={2} /> 新增
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickEdit')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[14px] font-normal text-apple-text transition hover:bg-black/[0.03]"
          aria-label="编辑行程"
        >
          <Pencil size={17} strokeWidth={2} /> 编辑
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickDelete')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg bg-apple-text text-[14px] font-normal text-white transition hover:opacity-90"
          aria-label="删除行程"
        >
          <Trash2 size={17} strokeWidth={2} /> 删除
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={resetManage}
        className="min-h-11 w-full rounded-lg bg-white text-[15px] font-normal text-apple-text shadow-apple-card transition hover:bg-apple-surface"
      >
        取消操作
      </button>
    )

  return (
    <div className="pb-28">
      <PageHeader title="行程安排" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} below={toolbar} />
      <main className="mx-auto w-full max-w-md px-4 py-4">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          {days.map((day) => (
            <button
              type="button"
              key={day.id}
              onClick={() => {
                setActiveDayId(day.id)
                if (managePhase === 'pickEdit' || managePhase === 'pickDelete' || managePhase === 'edit') {
                  resetManage()
                }
              }}
              className={`min-h-10 shrink-0 rounded-full px-4 text-[14px] font-medium tracking-[-0.02em] transition ${
                day.id === selectedDayId
                  ? 'bg-apple-text text-white'
                  : 'bg-white text-black/70 shadow-apple-card hover:text-apple-text'
              }`}
            >
              D{day.dayNumber}
            </button>
          ))}
        </div>

        {managePhase === 'pickEdit' ? (
          <p className="mb-3 rounded-lg bg-white px-4 py-3 text-[14px] leading-relaxed text-black/80 shadow-apple-card">
            请点击下方要编辑的行程项
          </p>
        ) : null}
        {managePhase === 'pickDelete' ? (
          <p className="mb-3 rounded-lg bg-apple-dark-1 px-4 py-3 text-[14px] leading-relaxed text-white/85">
            请点击要删除的行程项
          </p>
        ) : null}

        {selectedDay ? (
          <>
            {showForm ? (
              <form
                onSubmit={managePhase === 'edit' ? submitEdit : submitCreate}
                className="mb-5 space-y-3 rounded-[12px] bg-white p-4 shadow-apple-card"
              >
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-apple-text">
                  {managePhase === 'edit' ? '编辑行程项' : '新增行程项'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                    时间
                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                      className={field}
                    />
                  </label>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                    地点
                    <input
                      value={form.location}
                      onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                      className={field}
                    />
                  </label>
                </div>
                <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                  标题
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    className={field}
                  />
                </label>
                <label className="text-[11px] font-medium uppercase tracking-wide text-black/48">
                  备注
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className="mt-1 min-h-24 w-full rounded-[11px] border-[3px] border-black/[0.04] bg-apple-surface px-3 py-2 text-[15px] text-apple-text outline-none transition focus-visible:border-apple-blue"
                  />
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="min-h-11 flex-1 rounded-lg bg-apple-blue text-[15px] font-normal text-white transition hover:bg-apple-blue-hover"
                  >
                    {managePhase === 'edit' ? '保存' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={resetManage}
                    className="min-h-11 flex-1 rounded-lg border-[3px] border-black/[0.04] bg-apple-surface text-[15px] font-normal text-apple-text transition hover:bg-black/[0.03]"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : null}

            <DaySection
              day={selectedDay}
              items={items}
              nextItemId={nextItemId}
              selectMode={selectMode}
              onItemSelect={onItemSelect}
            />
          </>
        ) : null}
      </main>
    </div>
  )
}
