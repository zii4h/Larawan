'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signOut() {
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function createHabit(formData: FormData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = (formData.get('name') as string).trim()
  const color = formData.get('color') as string

  if (!name) return { error: 'Name is required' }

  const { error } = await supabase
    .from('habits')
    .insert({ user_id: user.id, name, color })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
}

export async function deleteHabit(habitId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Delete checkins first
  await supabase.from('checkins').delete().eq('habit_id', habitId).eq('user_id', user.id)
  await supabase.from('habits').delete().eq('id', habitId).eq('user_id', user.id)

  revalidatePath('/dashboard')
}

// ── Check-ins ─────────────────────────────────────────────────────────────────

export async function toggleCheckin(habitId: string, date: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if already checked in today
  const { data: existing } = await supabase
    .from('checkins')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  if (existing) {
    // Remove it (toggle off)
    await supabase.from('checkins').delete().eq('id', existing.id)
  } else {
    // Add it
    await supabase.from('checkins').insert({ habit_id: habitId, user_id: user.id, date })
  }

  revalidatePath('/dashboard')
}
