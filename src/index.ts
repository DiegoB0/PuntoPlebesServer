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

// Apply the CORS middleware globally
app.use(cors())
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

app.get('/', (req, res) => {
  res.send('Welcome to the API!')
})

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack) // Log for debugging
    const status = err.status || 500
    const message = err.message || 'Error desconocido del servidor.'

    if (typeof res.status === 'function') {
      res.status(status).json({ message })
    } else {
      console.error('res.status is not a function', res)
      next(err)
    }
  }
)

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
const PORT = Number(process.env.PORT) || 5000
app.listen(PORT, '127.0.0.1', () =>
  console.log(`Server running on port ${PORT}`)
)

// Connect to database
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connected!')
  })
  .catch((err) => console.error('Error connecting to DB:', err))
