import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.supabaseURL as string
const supabaseKey = process.env.supabaseAPI_KEY as string

const supabase = createClient(supabaseUrl, supabaseKey)

if (!supabase) {
  console.log('Error al conectar a Supabase')
  throw new Error('Failed to initialize Supabase client')
} else {
  console.log('Conectado a Supabase')
}

export default supabase
