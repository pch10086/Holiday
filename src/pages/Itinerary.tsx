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
    return <p className="p-4 text-sm text-slate-500">加载行程中...</p>
  }
  if (!tripDetail) {
    return <p className="p-4 text-sm text-red-600">{error ?? '旅行不存在'}</p>
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
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-900 text-sm font-medium text-white"
          aria-label="新增行程"
        >
          <Plus size={18} /> 新增
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickEdit')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-white text-sm font-medium text-emerald-800"
          aria-label="编辑行程"
        >
          <Pencil size={18} /> 编辑
        </button>
        <button
          type="button"
          onClick={() => {
            resetManage()
            setManagePhase('pickDelete')
          }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-700"
          aria-label="删除行程"
        >
          <Trash2 size={18} /> 删除
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={resetManage}
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
      >
        取消操作
      </button>
    )

  return (
    <div className="pb-24">
      <PageHeader title="行程安排" subtitle={tripDetail.trip.title} backTo={`/trip/${id}`} below={toolbar} />
      <main className="mx-auto w-full max-w-md bg-stone-50 px-4 py-4">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm ${
                day.id === selectedDayId ? 'bg-emerald-900 text-white' : 'bg-white text-emerald-800'
              }`}
            >
              D{day.dayNumber}
            </button>
          ))}
        </div>

        {managePhase === 'pickEdit' ? (
          <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            请点击下方要编辑的行程项
          </p>
        ) : null}
        {managePhase === 'pickDelete' ? (
          <p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            请点击要删除的行程项
          </p>
        ) : null}

        {selectedDay ? (
          <>
            {showForm ? (
              <form
                onSubmit={managePhase === 'edit' ? submitEdit : submitCreate}
                className="mb-4 space-y-2 rounded-2xl bg-white p-3 shadow-sm"
              >
                <p className="text-sm font-medium text-emerald-950">
                  {managePhase === 'edit' ? '编辑行程项' : '新增行程项'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-slate-600">
                    时间
                    <input
                      type="time"
                      value={form.time}
                      onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                      className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    地点
                    <input
                      value={form.location}
                      onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                      className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
                    />
                  </label>
                </div>
                <label className="text-xs text-slate-600">
                  标题
                  <input
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="mt-1 min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  备注
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className="mt-1 min-h-20 w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="min-h-11 flex-1 rounded-xl bg-emerald-900 text-sm font-medium text-white"
                  >
                    {managePhase === 'edit' ? '保存修改' : '保存新增'}
                  </button>
                  <button
                    type="button"
                    onClick={resetManage}
                    className="min-h-11 flex-1 rounded-xl border border-emerald-200 text-sm text-emerald-800"
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
