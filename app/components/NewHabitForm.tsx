'use client'

import { useState, useTransition } from 'react'
import { createHabit } from '@/app/actions'

const PRESET_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export default function NewHabitForm() {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('color', color)

    startTransition(async () => {
      const result = await createHabit(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setOpen(false)
        ;(e.target as HTMLFormElement).reset()
        setColor(PRESET_COLORS[0])
      }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <span className="text-lg">+</span> New habit
      </button>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4">New habit</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="e.g. Morning run, Reading, Meditation…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Color</label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
            {/* Custom color picker */}
            <label className="w-7 h-7 rounded-full border-2 border-dashed border-zinc-600 hover:border-zinc-400 cursor-pointer flex items-center justify-center transition-colors" title="Custom color">
              <span className="text-zinc-500 text-xs">+</span>
              <input
                type="color"
                className="sr-only"
                value={color}
                onChange={e => setColor(e.target.value)}
              />
            </label>
          </div>
          {/* Preview */}
          <div className="mt-2 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-zinc-500">{color}</span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            {isPending ? 'Creating…' : 'Create habit'}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
