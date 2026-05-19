import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')
  redirect('/login')
}
