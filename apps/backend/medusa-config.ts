import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { execSync } from 'child_process'
import path from 'path'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Load admin-managed secrets from the DB at boot (fail-safe → {} on any error).
// This lets the operator fill Stripe/email keys in the admin instead of .env.
// Note: changing a secret requires a server restart to take effect.
function loadDbSettings(): Record<string, string | null> {
  try {
    const script = path.join(process.cwd(), 'src/lib/load-settings.cjs')
    const out = execSync(`node "${script}"`, {
      encoding: 'utf8',
      timeout: 8000,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return JSON.parse(out || '{}')
  } catch {
    return {}
  }
}

const db = loadDbSettings()
// env wins if set (ops/CI override); otherwise use the admin-entered DB value.
const STRIPE_KEY = process.env.STRIPE_API_KEY || db.stripe_secret_key || ''
const STRIPE_WEBHOOK = process.env.STRIPE_WEBHOOK_SECRET || db.stripe_webhook_secret || ''
const SENDGRID_KEY = process.env.SENDGRID_API_KEY || db.sendgrid_api_key || ''
const EMAIL_FROM = process.env.EMAIL_FROM || db.email_from || 'hello@aurel.co'

// Image storage (S3 / R2) — admin-fillable, env overrides.
const S3_BUCKET = process.env.S3_BUCKET || db.s3_bucket || ''
const S3_REGION = process.env.S3_REGION || db.s3_region || ''
const S3_ENDPOINT = process.env.S3_ENDPOINT || db.s3_endpoint || ''
const S3_FILE_URL = process.env.S3_FILE_URL || db.s3_file_url || ''
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || db.s3_access_key_id || ''
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || db.s3_secret_access_key || ''

const modules: any[] = [
  { resolve: "./src/modules/content" },
  { resolve: "./src/modules/newsletter" },
  { resolve: "./src/modules/settings" },
]

// Stripe payment provider — registered only when a secret key is available
// (from admin settings or env). Until then the store uses the manual provider.
if (STRIPE_KEY) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/payment-stripe",
          id: "stripe",
          options: {
            apiKey: STRIPE_KEY,
            webhookSecret: STRIPE_WEBHOOK,
            capture: true,
          },
        },
      ],
    },
  })
}

// Email notifications. Uses SendGrid when a key is available (admin or env),
// otherwise the local provider (logs to console) so nothing breaks.
modules.push({
  resolve: "@medusajs/medusa/notification",
  options: {
    providers: [
      SENDGRID_KEY
        ? {
            resolve: "@medusajs/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: SENDGRID_KEY,
              from: EMAIL_FROM,
            },
          }
        : {
            resolve: "@medusajs/notification-local",
            id: "local",
            options: {
              channels: ["email"],
              from: EMAIL_FROM,
            },
          },
    ],
  },
})

// S3 / R2 file storage for product/content images — enabled when a bucket is
// configured (admin Store Settings or env). Locally without it, Medusa uses its
// default local file storage.
if (S3_BUCKET) {
  modules.push({
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/file-s3",
          id: "s3",
          options: {
            file_url: S3_FILE_URL,
            access_key_id: S3_ACCESS_KEY_ID,
            secret_access_key: S3_SECRET_ACCESS_KEY,
            region: S3_REGION,
            bucket: S3_BUCKET,
            endpoint: S3_ENDPOINT || undefined,
          },
        },
      ],
    },
  })
}

// Redis-backed event bus / cache / workflow engine — required for a real
// production deploy (multi-instance, durable). Enabled only in production with a
// REDIS_URL set; local dev keeps the in-memory defaults.
if (process.env.NODE_ENV === "production" && process.env.REDIS_URL) {
  modules.push(
    { resolve: "@medusajs/event-bus-redis", options: { redisUrl: process.env.REDIS_URL } },
    { resolve: "@medusajs/cache-redis", options: { redisUrl: process.env.REDIS_URL } },
    {
      resolve: "@medusajs/workflow-engine-redis",
      options: { redis: { url: process.env.REDIS_URL } },
    }
  )
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules,
})
