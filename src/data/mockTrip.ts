import type { TripDetail } from '../types'

const now = new Date().toISOString()

export const mockTrip: TripDetail = {
  trip: {
    id: 'demo-trip',
    title: '东京赏樱周末',
    destination: '日本东京',
    startDate: '2026-04-20',
    endDate: '2026-04-23',
    travelers: ['你', '小林'],
    coverEmoji: '🗼',
    createdAt: now,
    updatedAt: now,
  },
  days: [
    {
      id: 'day-1',
      tripId: 'demo-trip',
      date: '2026-04-20',
      dayNumber: 1,
      title: '第一天 · 抵达东京',
    },
    {
      id: 'day-2',
      tripId: 'demo-trip',
      date: '2026-04-21',
      dayNumber: 2,
      title: '第二天 · 城市漫步',
    },
  ],
  itineraryItems: [
    {
      id: 'item-1',
      dayId: 'day-1',
      tripId: 'demo-trip',
      time: '09:00',
      title: '前往机场',
      location: '浦东国际机场 T2',
      notes: '',
      completed: true,
      assignee: '你',
      updatedBy: '你',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'item-2',
      dayId: 'day-1',
      tripId: 'demo-trip',
      time: '14:30',
      title: '办理酒店入住',
      location: '新宿格兰贝尔酒店',
      notes: '护照随身带',
      completed: false,
      assignee: '小林',
      updatedBy: '你',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'item-3',
      dayId: 'day-2',
      tripId: 'demo-trip',
      time: '10:00',
      title: '上野公园赏樱',
      location: '上野公园',
      notes: '',
      completed: false,
      assignee: '你',
      updatedBy: '你',
      createdAt: now,
      updatedAt: now,
    },
  ],
  tasks: [
    {
      id: 'task-1',
      tripId: 'demo-trip',
      type: 'prep',
      title: '确认护照有效期',
      completed: true,
      assignee: '你',
      notes: '',
      updatedBy: '你',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-2',
      tripId: 'demo-trip',
      type: 'prep',
      title: '购买 eSIM',
      completed: false,
      assignee: '小林',
      notes: '',
      updatedBy: '你',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-3',
      tripId: 'demo-trip',
      type: 'travel',
      title: '第一晚兑换现金',
      completed: false,
      assignee: '你',
      notes: '',
      updatedBy: '小林',
      createdAt: now,
      updatedAt: now,
    },
  ],
}

export const sampleImportText = `第一天
09:00 去机场 - 浦东国际机场
12:30 到达酒店办理入住 - 新宿
14:00 去博物馆 - 东京国立博物馆
18:00 晚餐 - 银座

准备事项
- 订机票
- 订酒店
- 准备签证材料

途中事项
- 兑换日元
- 购买交通卡`
