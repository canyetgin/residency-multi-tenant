import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const envPath = path.resolve(process.cwd(), ".env")

if (!fs.existsSync(envPath)) {
  console.error("❌ Fatal: .env file not found.")
  process.exit(1)
}

process.loadEnvFile(envPath)

const STRAPI_URL = process.env.STRAPI_URL

if (!STRAPI_URL || STRAPI_URL.trim() === "") {
  console.error("❌ Fatal: STRAPI_URL environment variable is not defined.")
  process.exit(1)
}

// we are using strapi 5 prebuild openapi to generate safe types for our nextjs app
const OPENAPI_ENDPOINT = `${STRAPI_URL}/api/openapi.json`
const OUTPUT_PATH = path.resolve(process.cwd(), "strapi-types/strapi-schema.d.ts")

async function syncStrapiTypes() {
  console.log(`🔄 Checking Strapi OpenAPI schema at ${OPENAPI_ENDPOINT}...`)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)

    const res = await fetch(OPENAPI_ENDPOINT, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true })

    execSync(`npx openapi-typescript "${OPENAPI_ENDPOINT}" -o "${OUTPUT_PATH}"`, {
      stdio: "inherit",
    })

    console.log("✅ Strapi types synced successfully.")
  } catch (error) {
    console.warn(
      `⚠️  Strapi unreachable (${(error as Error).message}). Skipping type sync and using existing schema.`
    )
  }
}

syncStrapiTypes()
