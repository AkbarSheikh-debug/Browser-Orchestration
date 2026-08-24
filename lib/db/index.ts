import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "./schema"

type Database = ReturnType<typeof createDb>

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon pooled connection string to .env.local, then run `npm run db:migrate`."
    )
  }

  // Pooled HTTP connection — safe for serverless/edge and Server Components.
  return drizzle({ client: neon(url), schema, casing: "snake_case" })
}

let client: Database | undefined

function getDb(): Database {
  if (!client) client = createDb()
  return client
}

// Connected on first query rather than at import, so a missing DATABASE_URL
// surfaces as a failing query with a clear message instead of taking down every
// module that transitively imports this one.
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const instance = getDb()
    const value = Reflect.get(instance, prop, instance)
    return typeof value === "function" ? value.bind(instance) : value
  },
})

export { schema }
