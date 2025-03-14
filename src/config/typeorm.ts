import 'reflect-metadata'
import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
const isProduction = process.env.NODE_ENV === 'production'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: true,
  logging: ['error', 'schema'],
  entities: isProduction ? ['dist/entities/*.js'] : ['src/entities/*.ts']
})
