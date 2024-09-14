/* eslint-disable */
import { parse } from 'pg-connection-string'
import * as Joi from 'joi'
import { configurationSchema } from './configuration.schema'

interface Configuration {
  [key: string]: unknown
}

export default () => {
  const databaseUrl = process.env.DATABASE_URL as string
  const { host, port, database, user, password } = parse(databaseUrl)

  const configuration: Configuration = {
    environment: process.env.ENVIRONMENT,
    isWorker: process.env.IS_WORKER === 'true',
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5555,
    baseUrl: process.env.BASE_URL,
    isWorkerMode: process.env.WORKER_MODE === 'true',
    cors: {
      allowedOrigins: process.env.CORS_ALLOWED_ORIGINS
        ? JSON.parse(process.env.CORS_ALLOWED_ORIGINS)
        : []
    },
    authorizedApiKeys: {
      user: process.env.AUTHORIZED_USER_API_KEYS
        ? JSON.parse(process.env.AUTHORIZED_USER_API_KEYS)
        : [],
      admin: process.env.AUTHORIZED_ADMIN_API_KEYS
        ? JSON.parse(process.env.AUTHORIZED_ADMIN_API_KEYS)
        : [],
      script: process.env.AUTHORIZED_SCRIPT_API_KEYS
        ? JSON.parse(process.env.AUTHORIZED_SCRIPT_API_KEYS)
        : []
    },
    redis: {
      url: process.env.REDIS_URL
    },
    database: {
      host,
      port,
      database,
      user,
      password,
      acquireConnections: process.env.DATABASE_ACQUIRE_CONNECTIONS || 10000,
      evictConnections: process.env.DATABASE_EVICT_CONNECTIONS || 10000,
      idleConnections: process.env.DATABASE_IDLE_CONNECTIONS || 10000,
      maxConnections: process.env.DATABASE_MAX_CONNECTIONS || 10,
      minConnections: process.env.DATABASE_MIN_CONNECTIONS || 1
    },
    scrapers: {
      regsScraper: {
        siteUrl: process.env.REGS_SCRAPER_SITE_URL,
        captchaKey: process.env.REGS_SCRAPER_CAPTCHA_KEY,
        apiKey: process.env.REGS_SCRAPER_API_KEY
      }
    },
    headers: {
      maxAge: process.env.CACHE_CONTROL_MAX_AGE_SECONDS
    },
    task: {
      name: process.env.TASK_NAME,
      date: process.env.TASK_DATE
    }
  }

  return Joi.attempt(configuration, configurationSchema)
}
