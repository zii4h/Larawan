'use client'

import { useState, useTransition } from 'react'
import { signIn, signUp } from '@/app/actions'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = mode === 'login' ? await signIn(formData) : await signUp(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-white tracking-tight">
            <span className="text-purple-400">●</span> larawan
          </span>
          <p className="text-zinc-500 text-sm mt-2">habits, visualized.</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-lg bg-zinc-800 p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'signup'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {isPending ? 'Loading…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
