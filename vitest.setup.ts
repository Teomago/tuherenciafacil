// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Use the direct Neon connection for tests — the pooler (port 6543)
// can hang during Drizzle push/schema sync. The direct connection (port 5432)
// is required for DDL operations that run on getPayload() init.
if (process.env.DATABASE_URI_DIRECT) {
  process.env.DATABASE_URI = process.env.DATABASE_URI_DIRECT
}

// Disable Brevo email sending in tests — prevents real API calls that could hang
process.env.BREVO_EMAILS_ACTIVE = 'false'
