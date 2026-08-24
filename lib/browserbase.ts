import Browserbase from "@browserbasehq/sdk"

let client: Browserbase | undefined

function getClient(): Browserbase {
  if (client) return client

  const apiKey = process.env.BROWSERBASE_API_KEY
  if (!apiKey) {
    throw new Error(
      "BROWSERBASE_API_KEY is not set. Add it to .env.local — copy it from https://www.browserbase.com/settings"
    )
  }

  client = new Browserbase({ apiKey })
  return client
}

// Server-only Browserbase client for observability calls (session replays,
// logs). It carries the secret API key, so it must never be imported into
// client code. Built on first use so a missing key only fails the replay route
// rather than any module that transitively imports this one.
export const browserbase = new Proxy({} as Browserbase, {
  get(_target, prop) {
    const instance = getClient()
    const value = Reflect.get(instance, prop, instance)
    return typeof value === "function" ? value.bind(instance) : value
  },
})
