'use client'

import { useState, useTransition } from 'react'
import { toggleCheckin, deleteHabit } from '@/app/actions'
import Heatmap from './Heatmap'

interface Habit {
  id: string
  name: string
  color: string
}

interface HabitCardProps {
  habit: Habit
  checkins: string[]
  todayChecked: boolean
}

function getTodayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function HabitCard({ habit, checkins: initialCheckins, todayChecked }: HabitCardProps) {
  const today = getTodayString()
  const [checkins, setCheckins] = useState(initialCheckins)
  const [checked, setChecked] = useState(todayChecked)
  const [isPending, startTransition] = useTransition()
  const [showDelete, setShowDelete] = useState(false)

  function handleCheckin() {
    const nowChecked = !checked
    setChecked(nowChecked)
    setCheckins(prev =>
      nowChecked ? [...prev, today] : prev.filter(d => d !== today)
    )
    startTransition(async () => {
      await toggleCheckin(habit.id, today)
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteHabit(habit.id)
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <h3 className="text-white font-semibold text-lg">{habit.name}</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete button */}
          {showDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDelete(true)}
              className="text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
              aria-label="Delete habit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="mb-5">
        <Heatmap checkins={checkins} color={habit.color} key={checkins.length} />
      </div>

      {/* Check-in button */}
      <button
        onClick={handleCheckin}
        className={`w-full py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
          checked
            ? 'text-white border-2'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-2 border-transparent'
        }`}
        style={checked ? { borderColor: habit.color, color: habit.color, backgroundColor: `${habit.color}15` } : {}}
      >
        {checked ? '✓ Showed up today' : 'I showed up today'}
      </button>
    </div>
  )
}
