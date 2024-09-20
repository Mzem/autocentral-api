import * as Joi from 'joi'

export const configurationSchema = Joi.object({
  environment: Joi.string().valid('prod', 'staging').required(),
  isWorker: Joi.boolean().required(),
  port: Joi.number(),
  baseUrl: Joi.string().uri().required(),
  isWorkerMode: Joi.boolean().required(),
  authorizedApiKeys: Joi.object({
    user: Joi.array().items(Joi.string().required()).min(1).required(),
    admin: Joi.array().items(Joi.string().required()).min(1).required(),
    script: Joi.array().items(Joi.string().required()).min(1).required()
  }),
  cors: Joi.object({
    allowedOrigins: Joi.array().items(Joi.string())
  }),
  firebase: Joi.object({
    key: Joi.string().required()
  }).required(),
  redis: Joi.object({
    url: Joi.string().uri()
  }),
  database: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    database: Joi.string().required(),
    user: Joi.string().required(),
    password: Joi.string().required(),
    acquireConnections: Joi.number().required(),
    evictConnections: Joi.number().required(),
    idleConnections: Joi.number().required(),
    maxConnections: Joi.number().required(),
    minConnections: Joi.number().required()
  }).required(),
  scrapers: Joi.object({
    shiftech: Joi.object({
      apiToken: Joi.string().required()
    }),
    regsScraper: Joi.object({
      siteUrl: Joi.string().required(),
      captchaKey: Joi.string().required(),
      apiKey: Joi.string().required()
    })
  }),
  headers: Joi.object({
    maxAge: Joi.number()
  }),
  task: Joi.object({
    name: Joi.string(),
    date: Joi.string().isoDate()
  })
})
