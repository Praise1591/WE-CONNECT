import { createClient } from '@supabase/supabase-js'

const supabaseUrl    = 'https://riskwusifojoagmbavfg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2t3dXNpZm9qb2FnbWJhdmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5OTM5MTksImV4cCI6MjA4MzU2OTkxOX0.c5kamYSFhf7BrW9yG25BhGkvpFe171f4jXKM1kuQ64w'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)