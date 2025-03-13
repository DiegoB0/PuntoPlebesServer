import 'dotenv/config'
import cors from 'cors'
import morgan from 'morgan'
import { router } from './routes'
import express, { Request, Response, NextFunction } from 'express'
import { AppDataSource } from './config/typeorm'
import swaggerSpec from './swagger'
import swaggerUI from 'swagger-ui-express'
import fileUpload from 'express-fileupload'

// Inicializar la aplicación de Express
const app = express()

// CORS configuration
const corsOptions =
  process.env.NODE_ENV && process.env.NODE_ENV === 'production'
    ? { origin: ['https://puntoplebes.online'] }
    : { origin: true }

// Configuring middlewares
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(morgan('dev'))
app.use(express.json())

// Middleware para subir imagenes
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads'
  })
)

// Serve swagger
if (process.env.NODE_ENV === 'dev') {
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec))
}

// Routes
app.use(router)

// Global error handler
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error(err.stack) // Log for debugging
  const status = err.status || 500
  const message = err.message || 'Error desconocido del servidor.'
  res.status(status).json({ message })
})

// Handle invalid JSON
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

// Start Express server only after DB connection is established
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Connect to database
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connected!')
  })
  .catch((err) => console.error('Error connecting to DB:', err))
