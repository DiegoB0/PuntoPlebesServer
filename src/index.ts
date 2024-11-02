import 'dotenv/config'
import supabase from './config/supabase'
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { router } from './routes'

// Verificar la conexión con Supabase
const testConnection = async () => {
  try {
    const { data, error } = await supabase.rpc('connectivity_test')

    if (error) {
      console.log('Connection test failed:', error.message)
    } else {
      console.log('Connection successful:', data)
    }
  } catch (error) {
    console.log('General connection error:', error)
  }
}

// Inicializar la aplicación de Express
const app = express()

// Configurar middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use(router)

// Configuración del puerto
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`))

// Run connection test and table initialization on app startup
testConnection()
