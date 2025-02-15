import 'dotenv/config'
import supabase from './config/supabase'
import cors from 'cors'
import morgan from 'morgan'
import { router } from './routes'
import express, { Request, Response, NextFunction } from 'express'

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

const corsOptions =
  process.env.NODE_ENV && process.env.NODE_ENV === 'production'
    ? { origin: ['https://puntoplebes.online', 'null'] }
    : { origin: true }

// Configurar middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use(router)

app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack) // Log para depuración

  const status = err.status || 500 // Usar el status del error, o 500 por defecto
  const message = err.message || 'Error desconocido del servidor.' // Mensaje personalizado o genérico

  res.status(status).json({ message }) // Enviar la respuesta al cliente
})

// Global error handler for invalid JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: 'INVALID_JSON',
      message:
        'The JSON provided is malformed. Please check the syntax and try again.'
    })
  }
  next(err)
})

// Configuración del puerto
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`))

// Run connection test and table initialization on app startup
testConnection()
