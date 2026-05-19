import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
      }
      checkins: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          date: string
          created_at?: string
        }
      }
    }
  }
}
