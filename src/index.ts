import 'dotenv/config'
import supabase from './config/supabase'

import cors from 'cors'
import http from 'http'
import express from 'express'
import morgan from 'morgan'

// Verificar la conexión con Supabase
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false })
      .limit(10)

    if (error) {
      console.log('Error trayendo datos', error)
    } else {
      console.log('Datos trayendo', data)
    }
  } catch (error) {
    console.log('Error general de conexión', error)
  }
}
testConnection()

// Inicializar la aplicación de Express
const app = express()

// Configurar middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Ruta básica
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Configuración del puerto
const PORT = process.env.PORT || 5000 // Usar puerto de la variable de entorno o 3000 por defecto

// Levantar el servidor
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`)
})

console.log('Iniciando servidor')
