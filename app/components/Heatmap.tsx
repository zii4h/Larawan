'use client'

import { useMemo } from 'react'

interface HeatmapProps {
  checkins: string[]
  color: string
}

// Total grid: 26 weeks on each side of today = 53 weeks wide
const WEEKS_PAST = 26
const WEEKS_FUTURE = 26
const TOTAL_WEEKS = WEEKS_PAST + 1 + WEEKS_FUTURE
const DAYS_PER_WEEK = 7

function getDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 168, g: 85, b: 247 }
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function Heatmap({ checkins, color }: HeatmapProps) {
  const checkinSet = useMemo(() => new Set(checkins), [checkins])
  const rgb = useMemo(() => hexToRgb(color), [color])

  const { grid, monthPositions, todayCol } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = getDateString(today)

    // Start from WEEKS_PAST weeks ago (beginning of that week, Sunday)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - today.getDay() - WEEKS_PAST * 7)

    const weeks: { dateStr: string; isFuture: boolean; isToday: boolean }[][] = []
    const monthPos: { label: string; col: number }[] = []
    const seenMonths = new Set<string>()
    let todayCol = WEEKS_PAST

    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const week: { dateStr: string; isFuture: boolean; isToday: boolean }[] = []
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + w * 7 + d)
        const ds = getDateString(date)
        const isFuture = date > today
        const isToday = ds === todayStr

        if (isToday) todayCol = w

        week.push({ dateStr: ds, isFuture, isToday })

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        if (!seenMonths.has(monthKey) && date.getDate() <= 7) {
          seenMonths.add(monthKey)
          monthPos.push({ label: MONTH_LABELS[date.getMonth()], col: w })
        }
      }
      weeks.push(week)
    }

    return { grid: weeks, monthPositions: monthPos, todayCol }
  }, [])

  const totalCheckins = checkins.length

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {Array.from({ length: TOTAL_WEEKS }).map((_, w) => {
            const mp = monthPositions.find(m => m.col === w)
            return (
              <div key={w} className="w-[14px] mr-[2px] text-[10px] text-zinc-500 shrink-0">
                {mp ? mp.label : ''}
              </div>
            )
          })}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col mr-1">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[14px] mb-[2px] text-[10px] text-zinc-500 w-6 flex items-center justify-end pr-1">
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {grid.map((week, w) => (
              <div key={w} className="flex flex-col gap-[2px]">
                {week.map((cell, d) => {
                  const filled = !cell.isFuture && checkinSet.has(cell.dateStr)

                  let bgColor: string
                  let opacity: number

                  if (cell.isToday) {
                    // Today: filled with color if checked in, else a dim outline
                    bgColor = filled
                      ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                      : 'rgb(39, 39, 42)'
                    opacity = 1
                  } else if (cell.isFuture) {
                    // Future: same default color as empty past squares
                    bgColor = 'rgb(39, 39, 42)'
                    opacity = 1
                  } else {
                    // Past
                    bgColor = filled
                      ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                      : 'rgb(39, 39, 42)'
                    opacity = 1
                  }

                  return (
                    <div
                      key={d}
                      title={cell.dateStr}
                      className={`w-[14px] h-[14px] rounded-sm transition-all ${cell.isToday ? 'ring-1 ring-white/20' : ''}`}
                      style={{ backgroundColor: bgColor, opacity }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-2 ml-8">
          {totalCheckins} {totalCheckins === 1 ? 'day' : 'days'} · today is column {todayCol + 1} of {TOTAL_WEEKS}
        </p>
      </div>
    </div>
  )
}
