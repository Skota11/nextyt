import { createClient } from '@supabase/supabase-js'

const url = "https://jwefzgvvgzjesamosqdn.supabase.co"
const key:any = process.env.NEXT_PUBLIC_KEY
export const supabase = createClient(
  url,
  key,
)