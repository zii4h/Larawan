import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/app/actions'
import HabitCard from '@/app/components/HabitCard'
import NewHabitForm from '@/app/components/NewHabitForm'

export default async function DashboardPage() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch habits
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Fetch all checkins for this user (past year)
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const { data: checkins } = await supabase
    .from('checkins')
    .select('habit_id, date')
    .eq('user_id', user.id)
    .gte('date', oneYearAgo.toISOString().split('T')[0])

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  // Group checkins by habit
  const checkinsByHabit: Record<string, string[]> = {}
  for (const c of checkins ?? []) {
    if (!checkinsByHabit[c.habit_id]) checkinsByHabit[c.habit_id] = []
    checkinsByHabit[c.habit_id].push(c.date)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-white font-bold text-xl tracking-tight">
          <span className="text-purple-400">●</span> larawan
        </span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm hidden sm:block">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Your habits</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Show up. That&apos;s all it takes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {(habits ?? []).map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              checkins={checkinsByHabit[habit.id] ?? []}
              todayChecked={(checkinsByHabit[habit.id] ?? []).includes(today)}
            />
          ))}

          <NewHabitForm />
        </div>

        {(habits ?? []).length === 0 && (
          <p className="text-center text-zinc-600 text-sm mt-4">
            Create your first habit above to start tracking your consistency.
          </p>
        )}
      </main>
    </div>
  )
}
