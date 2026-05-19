'use client'

import { useMemo } from 'react'

interface HeatmapProps {
  checkins: string[]   // array of date strings "YYYY-MM-DD"
  color: string        // hex color e.g. "#a855f7"
}

const WEEKS = 52
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

  // Build a grid: 52 weeks × 7 days, ending today
  const { grid, monthPositions } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the Sunday that starts our 52-week window
    const endSunday = new Date(today)
    endSunday.setDate(today.getDate() + (6 - today.getDay())) // end of this week (Saturday)

    const startDate = new Date(endSunday)
    startDate.setDate(endSunday.getDate() - WEEKS * DAYS_PER_WEEK + 1)

    const weeks: (string | null)[][] = []
    const monthPos: { label: string; col: number }[] = []
    let seenMonths = new Set<string>()

    for (let w = 0; w < WEEKS; w++) {
      const week: (string | null)[] = []
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + w * 7 + d)
        if (date > today) {
          week.push(null)
        } else {
          const ds = getDateString(date)
          week.push(ds)
          // Track month label position
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`
          if (!seenMonths.has(monthKey) && date.getDate() <= 7) {
            seenMonths.add(monthKey)
            monthPos.push({ label: MONTH_LABELS[date.getMonth()], col: w })
          }
        }
      }
      weeks.push(week)
    }

    return { grid: weeks, monthPositions: monthPos }
  }, [])

  const totalCheckins = checkins.length

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {Array.from({ length: WEEKS }).map((_, w) => {
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
                {week.map((dateStr, d) => {
                  if (dateStr === null) {
                    return <div key={d} className="w-[14px] h-[14px] rounded-sm" />
                  }
                  const filled = checkinSet.has(dateStr)
                  return (
                    <div
                      key={d}
                      title={dateStr}
                      className="w-[14px] h-[14px] rounded-sm transition-opacity"
                      style={{
                        backgroundColor: filled
                          ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
                          : 'rgb(39, 39, 42)', // zinc-800
                        opacity: filled ? 1 : 1,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-zinc-500 mt-2 ml-8">
          {totalCheckins} {totalCheckins === 1 ? 'day' : 'days'} shown in the past year
        </p>
      </div>
    </div>
  )
}
